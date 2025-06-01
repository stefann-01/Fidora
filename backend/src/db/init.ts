import { Group } from '@semaphore-protocol/group';
import { Claim, Evidence } from '../models/db.types';
import { ClaimService } from '../services/claim';
import { EvidenceService } from '../services/evidence';
import { db_claims, db_evidence, db_users } from './db';

const mockClaims: Claim[] = [
  {
    url: "https://x.com/cspan/status/1928522470983606543",
    claimId: "cspan-political-claim",
    author: "cspan",
    content: "Congressional hearing reveals new information about government spending priorities and budget allocation decisions.",
    category: "Politics",
    profilePic: "/cspan-profile.jpg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/GeniusGTX/status/1908142630279794818",
    claimId: "tech-innovation-claim",
    author: "GeniusGTX",
    content: "Revolutionary AI breakthrough promises to transform how we approach complex computational problems in quantum computing.",
    category: "Technology",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/Phil_Lewis_/status/1928490380284117375",
    claimId: "breaking-news-claim",
    author: "Phil_Lewis_",
    content: "Breaking: Major development in ongoing investigation reveals significant findings that could impact policy decisions.",
    category: "News",
    profilePic: "/window.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/NASAWebb/status/1920181776036630596",
    claimId: "space-discovery-claim",
    author: "NASAWebb",
    content: "Webb telescope captures unprecedented images of distant galaxies, revealing new insights about early universe formation.",
    category: "Science",
    profilePic: "/file.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/theRealKiyosaki/status/1923760378237841626",
    claimId: "financial-advice-claim",
    author: "theRealKiyosaki",
    content: "Economic indicators suggest major market shifts ahead. Smart investors are positioning themselves for the coming changes.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/realDonaldTrump/status/1909258777380974625",
    claimId: "trump-policy-claim",
    author: "realDonaldTrump",
    content: "New policies will bring unprecedented economic growth and job creation to American workers across all industries.",
    category: "Politics",
    profilePic: "/trump-profile.jpg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/zachxbt/status/1916756932763046273",
    claimId: "crypto-investigation-claim",
    author: "zachxbt",
    content: "Investigation reveals sophisticated crypto fraud scheme affecting thousands of investors worldwide.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/BuryCrypto/status/1928512190757171513",
    claimId: "crypto-market-claim",
    author: "BuryCrypto",
    content: "Cryptocurrency market analysis shows strong bullish indicators across multiple digital assets and trading pairs.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/EU_Eurostat/status/1928738219497238978",
    claimId: "eu-statistics-claim",
    author: "EU_Eurostat",
    content: "Latest European economic data shows significant improvements in employment rates and GDP growth across member states.",
    category: "Economics",
    profilePic: "/file.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/MarioNawfal/status/1928861532437324075",
    claimId: "global-news-claim",
    author: "MarioNawfal",
    content: "Global markets react to major geopolitical developments affecting international trade and economic partnerships.",
    category: "News",
    profilePic: "/window.svg",
    evidence: [],
    semaphore: new Group,
  }
]

// Function to initialize the database with mock data
export function initializeDatabase(): void {
  // Clear existing data
  db_users.length = 0;
  db_claims.length = 0;
  db_evidence.length = 0;
  
  // Add claims first - this will automatically create users if they don't exist
  mockClaims.forEach(claim => {
    try {
      ClaimService.create(claim);
    } catch (error) {
      console.warn(`Failed to add claim: ${claim.claimId}`, error);
    }
  });
  
  // Link evidence to claims (this is a simplified approach)
  // In a real application, you'd have proper foreign key relationships
  const evidenceGroups = [
    { claimId: 'tech-innovation-claim', evidenceRange: [0, 6] },
    { claimId: 'breaking-news-claim', evidenceRange: [7, 12] },
    { claimId: 'space-discovery-claim', evidenceRange: [13, 18] },
    { claimId: 'financial-advice-claim', evidenceRange: [19, 25] },
    { claimId: 'cspan-political-claim', evidenceRange: [26, 28] },
    { claimId: 'trump-policy-claim', evidenceRange: [29, 31] },
    { claimId: 'crypto-investigation-claim', evidenceRange: [32, 34] },
    { claimId: 'crypto-market-claim', evidenceRange: [35, 37] },
    { claimId: 'eu-statistics-claim', evidenceRange: [38, 40] },
    { claimId: 'global-news-claim', evidenceRange: [26, 28] }
  ];
  
  evidenceGroups.forEach(group => {
    const claim = db_claims.find(c => c.claimId === group.claimId);
    if (claim) {
      claim.evidence = db_evidence.slice(group.evidenceRange[0], group.evidenceRange[1] + 1);
    }
  });
  
  console.log(`Database initialized with:`);
  console.log(`- ${db_users.length} users`);
  console.log(`- ${db_claims.length} claims`);
  console.log(`- ${db_evidence.length} evidence items`);
}

// Auto-initialize when this module is imported
initializeDatabase(); 
