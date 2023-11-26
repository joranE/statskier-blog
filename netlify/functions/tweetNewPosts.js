const { TwitterApi } = require('twitter-api-v2');
const fetch = require('node-fetch');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const baseURL = 'https://statisticalskier.netlify.app';

const tweetPost = async (url) => {
  try {
    await twitterClient.v2.tweet(`New post: ${url}`);
  } catch (error) {
    console.error('Error tweeting:', error);
  }
};

const hasTweeted = async (url) => {
  try {
    const tweets = await twitterClient.v2.search(url, { max_results: 10 });
    return tweets.data.some(tweet => tweet.text.includes(url));
  } catch (error) {
    console.error('Error searching tweets:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  try {
    const response = await fetch(`${baseURL}/listings.json`);
    const listings = await response.json();
    
    // Assuming the first item in the array is the most recent listing
    const items = listings[0].items;

    for (const item of items) {
      const fullURL = `${baseURL}${item}`;
      const alreadyTweeted = await hasTweeted(fullURL);

      if (!alreadyTweeted) {
        await tweetPost(fullURL);
      }
    }

    return {
      statusCode: 200,
      body: 'Processed new posts.',
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
