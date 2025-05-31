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

export async function createPost(tweetUrl: string) {
  try {
    const tweetId = tweetUrl.split('/').pop();
    const response = await axios.request<TweetResponse>({
      method: 'GET',
      url: 'https://twitter241.p.rapidapi.com/tweet',
      params: { pid: tweetId },
      headers: {
        'x-rapidapi-key': 'c61beeff96msh67d12151c563241p13be66jsn2d6ef66ed4c3',
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    });
    
    const { tweet, user } = response.data;
    return {
      screen_name: user.legacy.screen_name,
      full_text: tweet.full_text,
      id_str: tweet.id_str
    };
  } catch (error) {
    console.error('Error fetching tweet:', error);
    throw error;
  }
}

// Example usage:
// createPost('https://twitter.com/username/status/1234567890');