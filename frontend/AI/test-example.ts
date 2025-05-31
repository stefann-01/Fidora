import { EvidenceAnalyzer } from './relevance';

async function testEvidenceAnalyzer() {
  console.log('🧪 Testing Evidence Analyzer...\n');
  
  const analyzer = new EvidenceAnalyzer();
  
  // Test Case 1: Supporting evidence
  console.log('Test 1: High-quality supporting evidence');
  const result1 = await analyzer.analyze(
    "According to a peer-reviewed study published in Nature Medicine, COVID-19 vaccines showed 95% efficacy in preventing severe illness in clinical trials involving 40,000 participants.",
    "COVID-19 vaccines are safe and effective",
    true
  );
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('\n---\n');
  
  // Test Case 2: Opposing evidence with link
  console.log('Test 2: Evidence with external link');
  const result2 = await analyzer.analyze(
    "covid vaccines killed so many people, see https://pmc.ncbi.nlm.nih.gov/articles/PMC8875435/",
    "Covid vaccines are safe and effective",
    false
  );
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('\n---\n');
  
  // Test Case 3: Not evidence (personal opinion)
  console.log('Test 3: Personal opinion (not evidence)');
  const result3 = await analyzer.analyze(
    "I think vaccines are bad because my friend got sick after taking one",
    "COVID-19 vaccines are safe and effective",
    false
  );
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('\n---\n');
  
  // Test Case 4: Unrelated content
  console.log('Test 4: Unrelated content');
  const result4 = await analyzer.analyze(
    "The weather today is really nice, perfect for a picnic with family and friends",
    "COVID-19 vaccines are safe and effective",
    true
  );
  console.log('Result:', JSON.stringify(result4, null, 2));
  
  console.log('\n✅ All tests completed!');
}

// Run the test
testEvidenceAnalyzer().catch(console.error); 