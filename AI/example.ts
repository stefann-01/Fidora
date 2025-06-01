import { RecommendationSystem, Tweet, UserInteraction } from './test_recommendation';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY', 
    'PINECONE_INDEX_NAME'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  console.log(`   - OpenAI API Key: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
  console.log(`   - Pinecone API Key: ${process.env.PINECONE_API_KEY?.substring(0, 10)}...`);
  console.log(`   - Pinecone Index: ${process.env.PINECONE_INDEX_NAME}`);
  console.log();
}

async function fidoraRecommendationExample() {
  console.log('='.repeat(60));
  console.log('🤖 Fidora AI Recommendation System Example');
  console.log('='.repeat(60));
  console.log();
  
  await checkEnvironment();
  
  const recommender = new RecommendationSystem();
  await recommender.initialize();
  
  // Use unique IDs to avoid conflicts with previous test data
  const timestamp = Date.now();
  
  // Sample tweets database (mix of categories like your real platform)
  const allTweets: Tweet[] = [
    // Tweets user has already interacted with
    {
      id: `fidora_001_${timestamp}`,
      text: "Ethereum Layer 2 solutions are revolutionizing DeFi scalability and reducing gas fees",
      category: "crypto",
      author: "defi_expert",
      timestamp: Date.now() - 86400000, // 1 day ago
      popularity_score: 450
    },
    {
      id: `fidora_002_${timestamp}`,
      text: "New AI model achieves 95% accuracy in predicting market movements using sentiment analysis",
      category: "ai",
      author: "quant_researcher",
      timestamp: Date.now() - 172800000, // 2 days ago
      popularity_score: 320
    },
    
    // NEW tweets for recommendations
    {
      id: `fidora_003_${timestamp}`,
      text: "Bitcoin ETF approval sparks institutional adoption, price reaches new highs",
      category: "crypto",
      author: "crypto_analyst",
      timestamp: Date.now() - 3600000, // 1 hour ago
      popularity_score: 680
    },
    {
      id: `fidora_004_${timestamp}`,
      text: "Breakthrough in quantum computing threatens current encryption methods",
      category: "tech",
      author: "security_expert",
      timestamp: Date.now() - 7200000, // 2 hours ago
      popularity_score: 290
    },
    {
      id: `fidora_005_${timestamp}`,
      text: "Machine learning algorithms now predict protein folding with 99% accuracy",
      category: "ai",
      author: "biotech_ai",
      timestamp: Date.now() - 14400000, // 4 hours ago
      popularity_score: 520
    },
    {
      id: `fidora_006_${timestamp}`,
      text: "Solana network upgrade promises 65,000 TPS, challenging Ethereum dominance",
      category: "crypto",
      author: "blockchain_dev",
      timestamp: Date.now() - 10800000, // 3 hours ago
      popularity_score: 380
    },
    {
      id: `fidora_007_${timestamp}`,
      text: "Web3 gaming reaches 1 billion players, NFT integration drives adoption",
      category: "gaming",
      author: "web3_gamer",
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      popularity_score: 190
    }
  ];
  
  console.log('📝 Storing tweets in vector database...');
  const batchId = await recommender.batchStoreTweets(allTweets);
  console.log(`✅ Stored ${allTweets.length} tweets successfully with batch ID: ${batchId}\n`);
  
  // User's interaction history (what they've already bet on, provided evidence for, etc.)
  const userInteractions: UserInteraction[] = [
    { tweetId: `fidora_001_${timestamp}`, type: "bet", weight: 1, timestamp: Date.now() - 80000000 },
    { tweetId: `fidora_001_${timestamp}`, type: "provide_evidence", weight: 1, timestamp: Date.now() - 79000000 },
    { tweetId: `fidora_002_${timestamp}`, type: "bet", weight: 1, timestamp: Date.now() - 150000000 },
  ];
  
  console.log('👤 User interaction history:');
  userInteractions.forEach(interaction => {
    const tweet = allTweets.find(t => t.id === interaction.tweetId);
    console.log(`   - ${interaction.type}: "${tweet?.text?.substring(0, 50)}..."`);
  });
  
  console.log('\n🎯 Getting personalized recommendations for NEW tweets...');
  
  // Get recommendations excluding tweets user has already interacted with
  const recommendations = await recommender.getRecommendationsForUser(
    `fidora_user_${timestamp}`,
    userInteractions,
    allTweets,
    { topK: 5, diversityFactor: 0.3, batchId }
  );
  
  console.log('\n✅ Recommended NEW tweets (based on user preferences):');
  recommendations.forEach((rec, index) => {
    const tweet = allTweets.find(t => t.id === rec.tweetId);
    if (tweet) {
      console.log(`${index + 1}. [Score: ${rec.score.toFixed(3)}] ${tweet.category.toUpperCase()}`);
      console.log(`   "${tweet.text}"`);
      console.log(`   👥 Popularity: ${rec.popularity_score} | Author: ${tweet.author}\n`);
    } else {
      console.log(`${index + 1}. [Score: ${rec.score.toFixed(3)}] UNKNOWN TWEET (from previous test)`);
      console.log(`   Tweet ID: ${rec.tweetId} not found in current dataset\n`);
    }
  });
  
  // Filter recommendations to only include tweets from our current dataset
  const validRecommendations = recommendations.filter(rec => 
    allTweets.some(tweet => tweet.id === rec.tweetId)
  );
  
  if (validRecommendations.length < recommendations.length) {
    console.log(`📝 Note: Filtered out ${recommendations.length - validRecommendations.length} recommendations from previous test runs\n`);
  }
  
  // Demonstrate filtering capabilities
  console.log('🏷️  Category-specific recommendations (Crypto only):');
  const cryptoRecs = await recommender.getRecommendations(`fidora_user_${timestamp}`, {
    topK: 3,
    includeCategories: ["crypto"],
    excludeTweetIds: userInteractions.map(i => i.tweetId),
    batchId
  });
  
  cryptoRecs.forEach((rec, index) => {
    const tweet = allTweets.find(t => t.id === rec.tweetId);
    console.log(`${index + 1}. [${rec.score.toFixed(3)}] "${tweet?.text?.substring(0, 70)}..."`);
  });
  
  console.log('\n🔥 High-popularity recommendations (>300 popularity):');
  const popularRecs = await recommender.getRecommendations(`fidora_user_${timestamp}`, {
    topK: 3,
    minPopularity: 300,
    excludeTweetIds: userInteractions.map(i => i.tweetId),
    batchId
  });
  
  popularRecs.forEach((rec, index) => {
    const tweet = allTweets.find(t => t.id === rec.tweetId);
    console.log(`${index + 1}. [${rec.score.toFixed(3)}] "${tweet?.text?.substring(0, 70)}..." (👥 ${rec.popularity_score})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Example completed successfully!');
  console.log('\n📊 What happened:');
  console.log('1. User interacted with Ethereum DeFi and AI prediction tweets');
  console.log('2. System built user profile based on these preferences');
  console.log('3. Recommended similar NEW tweets (crypto, AI, tech)');
  console.log('4. Successfully excluded tweets user already saw');
  console.log('5. Applied category and popularity filters');
  console.log('\n💡 Integration tips:');
  console.log('- Store all your tweets in the vector database');
  console.log('- Track user interactions (bets, evidence, views)');
  console.log('- Call getRecommendationsForUser() to get personalized content');
  console.log('- Use filters for category/popularity preferences');
  console.log('='.repeat(60));
}

// Run the example
if (require.main === module) {
  fidoraRecommendationExample().catch(console.error);
} 