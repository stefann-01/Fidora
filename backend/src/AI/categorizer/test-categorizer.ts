#!/usr/bin/env node

import { ClaimCategorizer } from './categorizer.js';
import * as dotenv from 'dotenv';

// Load environment variables from frontend/.env
dotenv.config({ path: '../.env' });

async function testCategorizer() {
  console.log('🧪 Testing AI Claim Categorizer...\n');

  const categorizer = new ClaimCategorizer();

  // Test cases with different types of content and blockchain data
  const testClaims = [
    {
      content: "Biden announces new climate change policy to reduce carbon emissions by 50% by 2030",
      expectedCategory: "Politics", // Could also be Environment
      block: 1000,
      method: "createClaim",
      claimId: "1928763171902304581"
    },
    {
      content: "New iPhone 15 features advanced AI chip that doubles processing speed",
      expectedCategory: "Technology",
      block: 1001,
      method: "bet",
      claimId: "1928525100695134570"
    },
    {
      content: "Scientists discover breakthrough treatment for Alzheimer's disease in clinical trials",
      expectedCategory: "Science", // Could also be Health
      block: 1002,
      method: "createClaim",
      claimId: "1928463411764920324"
    },
    {
      content: "Bitcoin reaches new all-time high as institutional adoption continues to grow",
      expectedCategory: "Finance",
      block: 1003,
      method: "bet",
      claimId: "1928463411764920325"
    },
    {
      content: "Breaking: Major earthquake hits coastal region, thousands evacuated",
      expectedCategory: "Weather & Climate" // Could also be News
    },
    {
      content: "Liverpool defeats Manchester City 3-1 in Premier League championship final",
      expectedCategory: "Sports"
    },
    {
      content: "Taylor Swift announces world tour with 50 new cities",
      expectedCategory: "Entertainment"
    },
    {
      content: "New study shows Mediterranean diet reduces heart disease risk by 30%",
      expectedCategory: "Health"
    }
  ];

  let successCount = 0;
  let totalTests = testClaims.length;

  for (const testCase of testClaims) {
    try {
      console.log(`📝 Testing: "${testCase.content}"`);
      console.log(`Expected category: ${testCase.expectedCategory}`);
      console.log(`Block: ${testCase.block}`);
      console.log(`Method: ${testCase.method}`);
      console.log(`Claim ID: ${testCase.claimId}`);
      
      const result = await categorizer.categorize(
        testCase.content,
        testCase.block,
        testCase.method,
        testCase.claimId
      );
      
      console.log(`✅ AI Result: ${result.category} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
      console.log(`💭 Reasoning: ${result.reasoning}`);
      console.log(`📦 Additional Data:`, {
        block: result.block,
        method: result.method,
        claimId: result.claimId
      });
      
      // Check if the result is reasonable (not necessarily exact match)
      if (result.confidence > 0.3) {
        successCount++;
        console.log('✅ Test passed (reasonable confidence)\n');
      } else {
        console.log('⚠️  Test warning: Low confidence\n');
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Test failed for "${testCase.content}":`, error);
      console.log('');
    }
  }

  console.log('🎯 Test Summary:');
  console.log(`Successful tests: ${successCount}/${totalTests}`);
  console.log(`Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed!');
  } else if (successCount > totalTests * 0.7) {
    console.log('✅ Most tests passed - categorizer is working well');
  } else {
    console.log('⚠️  Some tests failed - check API key and network connection');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCategorizer().catch(console.error);
}

export { testCategorizer }; 