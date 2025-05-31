import axios from 'axios';
import lighthouse from '@lighthouse-web3/sdk';
import dotenv from 'dotenv';

dotenv.config();

interface TweetResponse {
  tweet: {
    full_text: string;
    id_str: string;
  };
  user: {
    legacy: {
      screen_name: string;
    };
  };
}

export async function createPost(tweetUrl: string) {
  try {
    // Debug logging
    console.log('Environment Variables:');
    console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);
    console.log('X_RAPIDAPI_KEY:', process.env.X_RAPIDAPI_KEY);
    console.log('LIGHTHOUSE_API_KEY:', process.env.LIGHTHOUSE_API_KEY);
    console.log('All env:', process.env);

    const tweetId = tweetUrl.split('/').pop();
    const response = await axios.request<TweetResponse>({
      method: 'GET',
      url: 'https://twitter241.p.rapidapi.com/tweet',
      params: { pid: tweetId },
      headers: {
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    });

    // Add timestamp to the data
    const dataWithTimestamp = {
      ...response.data,
      fetchedAt: new Date().toISOString()
    };

    // Upload complete response to Lighthouse
    const uploadResponse = await lighthouse.uploadText(
      JSON.stringify(dataWithTimestamp),
      process.env.LIGHTHOUSE_API_KEY || '',
      tweetId
    );

    return {
      screen_name: response.data.user.legacy.screen_name,
      full_text: response.data.tweet.full_text,
      id_str: response.data.tweet.id_str,
      lighthouseHash: uploadResponse.data.Hash
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Example usage:
// createPost('https://twitter.com/username/status/1234567890');