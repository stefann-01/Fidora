import { Group } from '@semaphore-protocol/group';
import { Claim, Evidence } from '../models/db.types';
import { ClaimService } from '../services/claim';
import { EvidenceService } from '../services/evidence';
import { db_claims, db_evidence, db_users } from './db';

const mockClaims: Claim[] = [
  {
    url: "https://x.com/cspan/status/1928522470983606543",
    claimId: "1928522470983606543",
    author: "cspan",
    content: "Congressional hearing reveals new information about government spending priorities and budget allocation decisions.",
    category: "Politics",
    profilePic: "/cspan-profile.jpg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/GeniusGTX/status/1908142630279794818",
    claimId: "1908142630279794818",
    author: "GeniusGTX",
    content: "Revolutionary AI breakthrough promises to transform how we approach complex computational problems in quantum computing.",
    category: "Technology",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/Phil_Lewis_/status/1928490380284117375",
    claimId: "1928490380284117375",
    author: "Phil_Lewis_",
    content: "Breaking: Major development in ongoing investigation reveals significant findings that could impact policy decisions.",
    category: "News",
    profilePic: "/window.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/NASAWebb/status/1920181776036630596",
    claimId: "1920181776036630596",
    author: "NASAWebb",
    content: "Webb telescope captures unprecedented images of distant galaxies, revealing new insights about early universe formation.",
    category: "Science",
    profilePic: "/file.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/theRealKiyosaki/status/1923760378237841626",
    claimId: "1923760378237841626",
    author: "theRealKiyosaki",
    content: "Economic indicators suggest major market shifts ahead. Smart investors are positioning themselves for the coming changes.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/realDonaldTrump/status/1909258777380974625",
    claimId: "1909258777380974625",
    author: "realDonaldTrump",
    content: "New policies will bring unprecedented economic growth and job creation to American workers across all industries.",
    category: "Politics",
    profilePic: "/trump-profile.jpg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/zachxbt/status/1916756932763046273",
    claimId: "1916756932763046273",
    author: "zachxbt",
    content: "Investigation reveals sophisticated crypto fraud scheme affecting thousands of investors worldwide.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/BuryCrypto/status/1928512190757171513",
    claimId: "1928512190757171513",
    author: "BuryCrypto",
    content: "Cryptocurrency market analysis shows strong bullish indicators across multiple digital assets and trading pairs.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/EU_Eurostat/status/1928738219497238978",
    claimId: "1928738219497238978",
    author: "EU_Eurostat",
    content: "Latest European economic data shows significant improvements in employment rates and GDP growth across member states.",
    category: "Economics",
    profilePic: "/file.svg",
    evidence: [],
    semaphore: new Group,
  },
  {
    url: "https://x.com/MarioNawfal/status/1928861532437324075",
    claimId: "1928861532437324075",
    author: "MarioNawfal",
    content: "Global markets react to major geopolitical developments affecting international trade and economic partnerships.",
    category: "News",
    profilePic: "/window.svg",
    evidence: [],
    semaphore: new Group,
  }
]

// Mock evidence for the Niko McKnight death claim
const mockEvidenceNikoMcKnight: Evidence[] = [
  // Supporting evidence
  {
    supportsClaim: true,
    title: "Obituary published on TheGrio.com",
    description: "Official obituary notice published on TheGrio.com, a reputable news source, confirming Niko McKnight's death from cancer. The article includes details about his life and career as Brian McKnight's son.",
    wellStructuredPercentage: 92
  },
  {
    supportsClaim: true,
    title: "Family statement on social media",
    description: "Brian McKnight's official social media accounts posted a heartfelt statement confirming his son's passing and asking for privacy during this difficult time.",
    wellStructuredPercentage: 88
  },
  {
    supportsClaim: true,
    title: "Multiple news outlets reporting",
    description: "Several entertainment news outlets including Entertainment Tonight, People Magazine, and TMZ have independently confirmed the death through their own sources.",
    wellStructuredPercentage: 85
  },
  {
    supportsClaim: true,
    title: "Hospital records leak",
    description: "Unverified hospital documentation allegedly showing Niko McKnight's admission and treatment for terminal cancer has circulated on social media platforms.",
    wellStructuredPercentage: 45
  },
  
  // Contradicting evidence
  {
    supportsClaim: false,
    title: "No official death certificate found",
    description: "Public records searches in multiple states show no official death certificate filed for Niko McKnight as of the date claimed in the tweet.",
    wellStructuredPercentage: 78
  },
  {
    supportsClaim: false,
    title: "Recent social media activity",
    description: "Niko McKnight's personal Instagram account shows activity within the past 48 hours, including story views and likes on posts, suggesting he may still be alive.",
    wellStructuredPercentage: 82
  },
  {
    supportsClaim: false,
    title: "Brian McKnight's representatives deny reports",
    description: "A spokesperson for Brian McKnight has issued a statement calling the death reports 'completely false' and stating that Niko is 'alive and well.'",
    wellStructuredPercentage: 90
  },
  {
    supportsClaim: false,
    title: "TheGrio.com link returns 404 error",
    description: "The link provided in the original tweet (thegrio.com/2025/05/30/nik...) returns a 404 'page not found' error, suggesting the article may not exist or has been removed.",
    wellStructuredPercentage: 95
  },
  {
    supportsClaim: false,
    title: "Similar hoax patterns identified",
    description: "The tweet follows a common pattern of celebrity death hoaxes, including vague details, emotional language, and links to non-existent articles on legitimate news sites.",
    wellStructuredPercentage: 73
  },
  {
    supportsClaim: false,
    title: "No mainstream media coverage",
    description: "Major news networks (CNN, BBC, Reuters, AP) have not reported on Niko McKnight's alleged death, which would be unusual for the son of a well-known celebrity.",
    wellStructuredPercentage: 87
  }
];

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
  
  // Add the Niko McKnight evidence to the database
  mockEvidenceNikoMcKnight.forEach(evidence => {
    try {
      EvidenceService.create({
        ...evidence,
        statement: evidence.description
      });
    } catch (error) {
      console.warn(`Failed to add evidence: ${evidence.title}`, error);
    }
  });
  
  // Link evidence to claims
  const philLewisClaim = db_claims.find(c => c.author === 'Phil_Lewis_');
  if (philLewisClaim) {
    philLewisClaim.evidence = mockEvidenceNikoMcKnight;
  }
  
  // Link evidence to claims (this is a simplified approach)
  // In a real application, you'd have proper foreign key relationships
  const evidenceGroups = [
    { claimId: '1908142630279794818', evidenceRange: [0, 6] },
    { claimId: '1920181776036630596', evidenceRange: [13, 18] },
    { claimId: '1923760378237841626', evidenceRange: [19, 25] },
    { claimId: '1909258777380974625', evidenceRange: [26, 28] },
    { claimId: '1916756932763046273', evidenceRange: [29, 31] },
    { claimId: '1928512190757171513', evidenceRange: [32, 34] },
    { claimId: '1928738219497238978', evidenceRange: [35, 37] },
    { claimId: '1928738219497238978', evidenceRange: [38, 40] },
    { claimId: '1928861532437324075', evidenceRange: [26, 28] }
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
