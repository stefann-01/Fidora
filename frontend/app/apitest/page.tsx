'use client'

import { useState } from 'react';
import { createPost } from '../../back/tweet_api';

interface PostResult {
  screen_name: string;
  full_text: string;
  id_str: string;
  lighthouseHash: string;
}

export default function ApiTest() {
  const [tweetUrl, setTweetUrl] = useState('');
  const [result, setResult] = useState<PostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createPost(tweetUrl);
      setResult(data);
    } catch (error) {
      console.error('Full error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null) {
        setError(JSON.stringify(error, null, 2));
      } else {
        setError('An unknown error occurred');
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          placeholder="Enter tweet URL"
          className="p-2 border rounded mr-2"
        />
        <button 
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-red-700 mb-2">Error:</h2>
          <pre className="text-red-600 whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 
