// Simple test for the categorizer without API calls
console.log('🧪 Testing AI Claim Categorizer (Simple Test)...\n');

// Test the categories array and helper functions
import { CLAIM_CATEGORIES, isValidCategory, getAllCategories } from './categorizer.js';

console.log('📋 Available Categories:');
console.log(getAllCategories());
console.log(`\n📊 Total Categories: ${CLAIM_CATEGORIES.length}`);

console.log('\n🔍 Testing Category Validation:');
console.log('Politics is valid:', isValidCategory('Politics'));
console.log('InvalidCategory is valid:', isValidCategory('InvalidCategory'));

// Test cases for categorization (without actual API calls)
const testClaims = [
  "Biden announces new climate change policy to reduce carbon emissions by 50% by 2030",
  "New iPhone 15 features advanced AI chip that doubles processing speed",
  "Scientists discover breakthrough treatment for Alzheimer's disease in clinical trials",
  "Bitcoin reaches new all-time high as institutional adoption continues to grow",
  "Breaking: Major earthquake hits coastal region, thousands evacuated"
];

console.log('\n📝 Test Claims for Categorization:');
testClaims.forEach((claim, index) => {
  console.log(`${index + 1}. "${claim}"`);
});

console.log('\n✅ Basic categorizer setup is working!');
console.log('💡 To test with actual AI categorization, you need to set up OPENAI_API_KEY environment variable.');

// Mock test result structure
const mockResult = {
  category: 'Technology',
  confidence: 0.85,
  reasoning: 'This claim discusses AI chip technology in smartphones',
  content: 'New iPhone 15 features advanced AI chip that doubles processing speed'
};

console.log('\n📋 Example categorization result structure:');
console.log(JSON.stringify(mockResult, null, 2)); 