import { createPost as serverCreatePost } from '../app/actions/tweet-actions';

export async function createPost(tweetUrl: string) {
  return await serverCreatePost(tweetUrl);
}

// Example usage:
// createPost('https://twitter.com/username/status/1234567890');