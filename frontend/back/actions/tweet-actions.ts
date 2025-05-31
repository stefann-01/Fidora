'use server'

import lighthouse from '@lighthouse-web3/sdk';
import axios from 'axios';

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

// Internal function for server-side use (without 'use server')
export async function createPostInternal(tweetUrl: string) {
  try {
    console.log('X_RAPIDAPI_KEY:', process.env.X_RAPIDAPI_KEY);
    console.log('LIGHTHOUSE_API_KEY:', process.env.LIGHTHOUSE_API_KEY);
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

    const dataWithTimestamp = {
      ...response.data,
      fetchedAt: new Date().toISOString()
    };

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

// Server Action for client-side use (with 'use server')
export async function createPost(tweetUrl: string) {
  return createPostInternal(tweetUrl);  
} 