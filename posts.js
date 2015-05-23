import fs from 'fs-extra';
import authors from './authors';
import moment from 'moment';
import d from './date-format';

const filterTimeline = (item)=> {
  return (item.text[0] !== '@') || (item.text.indexOf('@jsunderhood') === 0);
}
const formatTweet = (item, index)=> {
  var text = item.text;
  if (item.retweeted_status) {
    var rtAuthor = item.retweeted_status.user.screen_name;
    text = `RT @${rtAuthor}: ${item.retweeted_status.text}`;
  }
  return `${text} [${index}][${index}]`
};
const formatRef = (item, index)=> `[${index}]: https://twitter.com/jsunderhood/status/${item.id_str}`

const getWeekday = (date) => {
  console.log(date);
  return moment(new Date(date)).format("dddd");
};

const separateByWeekdays = (state, item, i, arr)=> {
  var weekday = getWeekday(item.created_at);
  if (!state.length) {
    state.push({ weekday, tweets: [] });
  }
  if (state[state.length - 1].weekday !== weekday) {
    state.push({ weekday, tweets: [] });
  }
  state[state.length-1].tweets.push(item);
  return state;
};


const post = (author, post=true)=> {
  if (!post) { return; }

  author.tweets.reverse();
  author.tweets = author.tweets.filter(filterTimeline);


  console.log(getWeekday(author.tweets[0].created_at));

  const md = [
    `# @${author.username}`,
    `_${ d(author.tweets[0].created_at) }_`,
    author.tweets.reduce(separateByWeekdays, []).map((weekday)=> {
      return [
        '## ' + weekday.weekday,
        weekday.tweets.map(formatTweet).join('\n\n'),
      ].join('\n\n');
    }).join('\n\n'),
    author.tweets.map(formatRef).join('\n')
  ].join('\n\n');

  fs.outputFile(`./posts/${author.username}.md`, md, (err)=> console.log(`${author.username} done`))
}

authors.forEach((item)=> {
  fs.readJson(`dump/${item.username}.json`, (err, author)=> post(author, item.post))
});
