import { Group } from '@semaphore-protocol/group';
import { Claim, Evidence } from '../models/db.types';
import { ClaimService } from '../services/claim';
import { EvidenceService } from '../services/evidence';
import { db_claims, db_evidence, db_users } from './db';

const mockEvidence: Evidence[] = [
  // Medical accuracy post evidence
  {
    id: "evidence1",
    supportsClaim: true,
    title: "Source Verification",
    description: "Cross-referenced with multiple reputable medical journals and verified research institutions. The post has been independently verified by three major medical research centers including Johns Hopkins, Mayo Clinic, and Cleveland Clinic.",
    wellStructuredPercentage: 92
  },
  {
    id: "evidence2",
    supportsClaim: true,
    title: "Expert Validation",
    description: "Statement reviewed and confirmed by board-certified healthcare professionals. A panel of 15 medical experts from various specialties have reviewed and endorsed the accuracy of this medical post.",
    wellStructuredPercentage: 88
  },
  {
    id: "evidence3",
    supportsClaim: true,
    title: "Statistical Accuracy",
    description: "The 95% accuracy post is supported by peer-reviewed clinical trial data from multiple studies conducted over the past 5 years with over 10,000 participants.",
    wellStructuredPercentage: 85
  },
  {
    id: "evidence4",
    supportsClaim: true,
    title: "Regulatory Approval",
    description: "The medical procedure mentioned has been approved by FDA and other international regulatory bodies after extensive clinical trials.",
    wellStructuredPercentage: 78
  },
  {
    id: "evidence5",
    supportsClaim: false,
    title: "Limited Sample Size",
    description: "Some studies cited have relatively small sample sizes which may not be representative of the general population.",
    wellStructuredPercentage: 45
  },
  {
    id: "evidence6",
    supportsClaim: false,
    title: "Conflicting Research",
    description: "Two recent studies have shown different results, suggesting the need for more comprehensive research before making definitive posts.",
    wellStructuredPercentage: 38
  },
  {
    id: "evidence7",
    supportsClaim: false,
    title: "Methodology Concerns",
    description: "Independent reviewers have raised questions about the methodology used in some of the supporting studies.",
    wellStructuredPercentage: 32
  },
  // Earthquake alert post evidence
  {
    id: "evidence8",
    supportsClaim: false,
    title: "Seismic Activity Detected",
    description: "Minor seismic activity was recorded by local monitoring stations, though not at the magnitude posted in the tweet.",
    wellStructuredPercentage: 72
  },
  {
    id: "evidence9",
    supportsClaim: false,
    title: "Breaking News Alert",
    description: "No official emergency services reports found matching this description. Major earthquake monitoring services have not issued any alerts for the mentioned region.",
    wellStructuredPercentage: 15
  },
  {
    id: "evidence10",
    supportsClaim: false,
    title: "Geological Data",
    description: "No significant seismic activity detected in mentioned coastal regions in past 24 hours according to USGS and international monitoring networks.",
    wellStructuredPercentage: 12
  },
  {
    id: "evidence11",
    supportsClaim: false,
    title: "News Verification",
    description: "Major news outlets have not reported any such earthquake event. No credible news sources have covered this alleged earthquake.",
    wellStructuredPercentage: 8
  },
  {
    id: "evidence12",
    supportsClaim: false,
    title: "Emergency Services",
    description: "Local emergency services have not received any reports or activated emergency protocols related to earthquake activity.",
    wellStructuredPercentage: 18
  },
  {
    id: "evidence13",
    supportsClaim: false,
    title: "Social Media Analysis",
    description: "No corroborating posts from residents in the alleged affected areas. Social media monitoring shows no spike in earthquake-related posts from the region.",
    wellStructuredPercentage: 22
  },
  // Marine discovery post evidence
  {
    id: "evidence14",
    supportsClaim: true,
    title: "Scientific Publication",
    description: "Discovery published in Marine Biology Journal with peer review. The research has undergone rigorous scientific review and has been accepted by the marine biology community.",
    wellStructuredPercentage: 94
  },
  {
    id: "evidence15",
    supportsClaim: true,
    title: "Research Institution",
    description: "Study conducted by Woods Hole Oceanographic Institution, one of the world's leading marine research facilities with a strong reputation for scientific accuracy.",
    wellStructuredPercentage: 91
  },
  {
    id: "evidence16",
    supportsClaim: true,
    title: "Independent Verification",
    description: "The discovery has been independently verified by marine biologists from three different research institutions.",
    wellStructuredPercentage: 87
  },
  {
    id: "evidence17",
    supportsClaim: true,
    title: "Medical Application",
    description: "Preliminary research shows promising applications in imaging technology. Early studies suggest potential breakthrough applications in medical imaging.",
    wellStructuredPercentage: 78
  },
  {
    id: "evidence18",
    supportsClaim: false,
    title: "Limited Research",
    description: "The medical applications are still in very early stages and have not been tested in clinical settings.",
    wellStructuredPercentage: 45
  },
  {
    id: "evidence19",
    supportsClaim: false,
    title: "Funding Concerns",
    description: "Questions have been raised about potential conflicts of interest due to the funding sources of the research.",
    wellStructuredPercentage: 35
  },
  // Bitcoin ATH post evidence
  {
    id: "evidence20",
    supportsClaim: true,
    title: "Market Data",
    description: "Bitcoin price confirmed at new all-time high across major exchanges including Coinbase, Binance, and Kraken. Price data is consistent across all major trading platforms.",
    wellStructuredPercentage: 89
  },
  {
    id: "evidence21",
    supportsClaim: true,
    title: "Institutional Adoption",
    description: "Multiple major banks have announced crypto custody services this quarter, including JPMorgan Chase, Bank of America, and Goldman Sachs.",
    wellStructuredPercentage: 82
  },
  {
    id: "evidence22",
    supportsClaim: true,
    title: "Trading Volume",
    description: "Increased institutional trading volume supports adoption posts. Trading volume has increased by 340% compared to the same period last year.",
    wellStructuredPercentage: 75
  },
  {
    id: "evidence23",
    supportsClaim: true,
    title: "Regulatory Clarity",
    description: "Recent regulatory developments have provided more clarity for institutional investors, contributing to increased adoption.",
    wellStructuredPercentage: 71
  },
  {
    id: "evidence24",
    supportsClaim: false,
    title: "Market Volatility",
    description: "Bitcoin's price remains highly volatile, and all-time highs are often followed by significant corrections.",
    wellStructuredPercentage: 58
  },
  {
    id: "evidence25",
    supportsClaim: false,
    title: "Adoption Skepticism",
    description: "Some financial experts remain skeptical about the long-term sustainability of institutional crypto adoption.",
    wellStructuredPercentage: 42
  },
  {
    id: "evidence26",
    supportsClaim: false,
    title: "Regulatory Uncertainty",
    description: "Despite some progress, regulatory uncertainty still exists in many jurisdictions, potentially limiting institutional adoption.",
    wellStructuredPercentage: 38
  },
  // Storm warning post evidence
  {
    id: "evidence27",
    supportsClaim: true,
    title: "Weather Service Alert",
    description: "National Weather Service has issued severe storm warnings for midwest region",
    wellStructuredPercentage: 96
  },
  {
    id: "evidence28",
    supportsClaim: true,
    title: "Meteorological Data",
    description: "Satellite imagery confirms large storm system approaching midwest",
    wellStructuredPercentage: 93
  },
  {
    id: "evidence29",
    supportsClaim: true,
    title: "Emergency Preparedness",
    description: "Local authorities have activated emergency response protocols",
    wellStructuredPercentage: 90
  },
  // Championship result post evidence
  {
    id: "evidence30",
    supportsClaim: true,
    title: "Sports League Verification",
    description: "Official league website confirms championship game results",
    wellStructuredPercentage: 95
  },
  {
    id: "evidence31",
    supportsClaim: true,
    title: "Media Coverage",
    description: "Multiple sports networks covered the championship game live",
    wellStructuredPercentage: 88
  },
  {
    id: "evidence32",
    supportsClaim: true,
    title: "Score Verification",
    description: "Final score of 3-2 in overtime confirmed by official scorekeepers",
    wellStructuredPercentage: 92
  },
  // Restaurant authenticity post evidence
  {
    id: "evidence33",
    supportsClaim: false,
    title: "Restaurant Investigation",
    description: "Health department inspection records show use of processed ingredients",
    wellStructuredPercentage: 67
  },
  {
    id: "evidence34",
    supportsClaim: false,
    title: "Menu Analysis",
    description: "Restaurant menu items contain pre-packaged components from suppliers",
    wellStructuredPercentage: 55
  },
  {
    id: "evidence35",
    supportsClaim: false,
    title: "Customer Reviews",
    description: "Multiple customer complaints about authenticity and value",
    wellStructuredPercentage: 42
  },
  // Temple discovery post evidence
  {
    id: "evidence36",
    supportsClaim: true,
    title: "Tourism Board Confirmation",
    description: "Local tourism authority confirms existence of ancient temple site",
    wellStructuredPercentage: 87
  },
  {
    id: "evidence37",
    supportsClaim: true,
    title: "Archaeological Evidence",
    description: "Historical records document temple construction dating back centuries",
    wellStructuredPercentage: 91
  },
  {
    id: "evidence38",
    supportsClaim: true,
    title: "Travel Reviews",
    description: "Independent travel reviews corroborate scenic beauty posts",
    wellStructuredPercentage: 84
  },
  // Device review post evidence
  {
    id: "evidence39",
    supportsClaim: false,
    title: "Technical Specifications",
    description: "Battery capacity tests confirm below-average performance compared to competitors",
    wellStructuredPercentage: 78
  },
  {
    id: "evidence40",
    supportsClaim: false,
    title: "Price Comparison",
    description: "Device pricing significantly higher than similar spec competitors",
    wellStructuredPercentage: 65
  },
  {
    id: "evidence41",
    supportsClaim: true,
    title: "Camera Testing",
    description: "Independent camera quality tests show above-average performance",
    wellStructuredPercentage: 82
  }
];

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

  // Add evidence after claims are created
  mockEvidence.forEach(evidenceItem => {
    try {
      EvidenceService.create(evidenceItem);
    } catch (error) {
      console.warn(`Failed to add evidence: ${evidenceItem.title}`, error);
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
