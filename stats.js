import assign from 'object-assign';
import stats from 'tweets-stats';
import maxValues from 'max-values'

const getStatsPerAuthor = authors =>
  authors
    .map(author => (assign({}, author, { followers: author.info.followers_count })))
    .map((author, i, arr) => (assign({}, author, {
      gainedFollowers: arr[i + 1]
        ? (author.followers - arr[i + 1].followers)
        : author.followers
    })))
    .map(author => assign({}, author, stats(author.tweets)))

export default function getStats(authors) {
  return maxValues(getStatsPerAuthor(authors), [
    'tweets', 'gainedFollowers',
    'own.total', 'replies.total', 'retweets.total',
    'favorited.total', 'favorited.average',
    'retweeted.total', 'retweeted.average'
  ]);
};
