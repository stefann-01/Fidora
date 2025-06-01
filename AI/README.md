# Fidora AI Recommendation System

A sophisticated tweet recommendation system using OpenAI embeddings and Pinecone vector database to provide personalized content recommendations based on user interactions.

## Features

- 🎯 **Personalized Recommendations**: Builds user profiles from likes, comments, and impressions
- 🏷️ **Category-Aware**: Incorporates tweet categories for better content understanding
- 📊 **Popularity Integration**: Considers tweet popularity scores for trending content
- 🎨 **Diversity Control**: Balances relevance with category diversity
- ⚡ **Scalable**: Batch processing and efficient vector operations
- 🔄 **Real-time Updates**: Dynamic user profile updates based on new interactions

## Setup Instructions

### 1. Install Dependencies

```bash
cd AI
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:

```env
# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Get from https://www.pinecone.io/
PINECONE_API_KEY=your_pinecone_api_key_here

# Check your Pinecone dashboard for the correct region
PINECONE_ENVIRONMENT=us-east-1

# Create an index in your Pinecone dashboard
PINECONE_INDEX_NAME=fidora-recommendations
```

### 3. Set Up Pinecone Index

1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create a new index with these settings:
   - **Dimensions**: 1536 (for OpenAI text-embedding-3-small)
   - **Metric**: cosine
   - **Index Name**: `fidora-recommendations` (or whatever you set in .env)

### 4. Set Up OpenAI API

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Create an API key in your dashboard
3. Add credits to your account for API usage

## Usage

### Basic Example

```typescript
import { RecommendationSystem, Tweet, UserInteraction } from './test_recommendation';

const recommender = new RecommendationSystem();
await recommender.initialize();

// Store tweets
const tweets: Tweet[] = [
  {
    id: "1",
    text: "Amazing new developments in blockchain technology!",
    category: "blockchain",
    author: "crypto_expert",
    timestamp: Date.now(),
    popularity_score: 150
  }
];

await recommender.batchStoreTweets(tweets);

// Track user interactions
const interactions: UserInteraction[] = [
  { tweetId: "1", type: "bet", weight: 1, timestamp: Date.now() },
  { tweetId: "1", type: "provide_evidence", weight: 1, timestamp: Date.now() }
];

// Build user profile
await recommender.buildUserProfile("user123", interactions, tweets);

// Get recommendations
const recommendations = await recommender.getRecommendations("user123", {
  topK: 10,
  diversityFactor: 0.3,
  minPopularity: 50
});
```

### API Reference

#### `RecommendationSystem`

**Methods:**

- `initialize()`: Initialize the system and connect to Pinecone
- `storeTweet(tweet: Tweet)`: Store a single tweet embedding
- `batchStoreTweets(tweets: Tweet[], batchSize?: number)`: Store multiple tweets efficiently
- `buildUserProfile(userId: string, interactions: UserInteraction[], tweets: Tweet[])`: Create/update user profile
- `getRecommendations(userId: string, options?)`: Get personalized recommendations

**Recommendation Options:**

```typescript
{
  topK?: number;              // Number of recommendations (default: 10)
  includeCategories?: string[]; // Only include these categories
  excludeCategories?: string[]; // Exclude these categories
  minPopularity?: number;      // Minimum popularity score
  diversityFactor?: number;    // 0-1, balance between relevance and diversity
}
```

#### Types

```typescript
interface Tweet {
  id: string;
  text: string;
  category: string;
  author: string;
  timestamp: number;
  popularity_score?: number;
}

interface UserInteraction {
  tweetId: string;
  type: 'bet' | 'provide_evidence' | 'popularity';
  weight: number;
  timestamp: number;
}
```

## How It Works

### 1. Tweet Embedding
- Tweets are embedded using OpenAI's `text-embedding-3-small` model
- Category and author information is included in the embedding context
- Embeddings are stored in Pinecone with metadata

### 2. User Profile Building
- User profiles are created by weighted averaging of interacted tweet embeddings
- Different interaction types have different weights:
  - **Provide Evidence**: 2.5 (strongest signal - user contributes evidence)
  - **Bet**: 1.0 (medium signal - user places a bet)
  - **Popularity**: 0.1 (weak signal - popularity/view metrics)

### 3. Recommendation Generation
- Uses cosine similarity search in Pinecone to find relevant tweets
- Applies filters for categories, popularity, etc.
- Optional diversity algorithm ensures variety across categories

### 4. Popularity Integration
- Popularity scores can be used for filtering (`minPopularity`)
- Can be integrated post-retrieval for re-ranking
- Balances relevance with trending content

## Advanced Features

### Category Diversity
The system can balance relevance with diversity by ensuring recommendations span multiple categories:

```typescript
const recommendations = await recommender.getRecommendations("user123", {
  diversityFactor: 0.5 // Higher values = more diversity
});
```

### Batch Processing
For initial data loading or bulk updates:

```typescript
await recommender.batchStoreTweets(largeTweetArray, 50); // Process in batches of 50
```

### Real-time Updates
User profiles are automatically updated and stored in Pinecone for fast retrieval.

## Testing

Run the comprehensive example:

```bash
npm run dev
```

This will run a complete example showing:
- Environment setup verification
- Tweet storage and user profile building
- Personalized recommendations
- Category and popularity filtering
- Integration tips for your Fidora application

## Integration with Fidora

This recommendation system can be integrated with your main Fidora application by:

1. **Backend Integration**: Import and use the `RecommendationSystem` class in your backend API
2. **User Tracking**: Send user interactions (bets, evidence, popularity views) to the recommendation system
3. **Content Ingestion**: Automatically store new tweets as they're created
4. **API Endpoints**: Create endpoints for getting recommendations with various filters

## Cost Considerations

- **OpenAI**: ~$0.02 per 1M tokens for embeddings
- **Pinecone**: Free tier includes 1M vectors, paid plans start at $70/month
- Consider caching user profiles and batch processing for cost optimization

## Troubleshooting

### Common Issues

1. **"User profile not found"**: Make sure to call `buildUserProfile()` before getting recommendations
2. **Empty recommendations**: Check that tweets are stored and user has interactions
3. **API errors**: Verify your API keys and ensure services are accessible

### Debug Mode

Add more logging by setting environment variable:
```bash
DEBUG=true npm run dev
```

## New Feature: Get Recommendations for NEW Tweets Only

### How to Use This Feature

1. **User Interaction History**: You have a user with interaction history
2. **Full Tweet Database**: You have your full tweet database
3. **Get Recommendations**: Get recommendations for NEW tweets only

### Example Code

```typescript
// 1. You have a user with interaction history
const userInteractions = [
  { tweetId: "tweet_123", type: "bet", weight: 1, timestamp: Date.now() },
  { tweetId: "tweet_456", type: "provide_evidence", weight: 1, timestamp: Date.now() }
];

// 2. You have your full tweet database
const allTweets = [/* your tweet collection */];

// 3. Get recommendations for NEW tweets only
const recommendations = await recommender.getRecommendationsForUser(
  userId,
  userInteractions, 
  allTweets,
  { topK: 10 }
);

// 4. recommendations will only contain tweets the user hasn't seen yet!
```