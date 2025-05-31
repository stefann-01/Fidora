import { Evidence, User } from '../../app/types/db.types';
import { addClaim } from '../funcs/claims';
import { addEvidence } from '../funcs/evidence';
import { addUser } from '../funcs/users';
import { claims, evidence, users } from './db';

// Mock data converted to proper types
const mockUsers: User[] = [
  {
    profilePic: "/globe.svg",
    username: "techguru2024",
    latestPostContent: "Breaking: New AI breakthrough promises to revolutionize healthcare diagnostics with 95% accuracy in early disease detection.",
    rating: 87,
    isOnJury: true,
    claims: []
  },
  {
    profilePic: "/window.svg",
    username: "newsreporter",
    latestPostContent: "URGENT: Major earthquake hits coastal region, thousands evacuated. Emergency services responding to multiple rescue calls.",
    rating: 23,
    isOnJury: false,
    claims: []
  },
  {
    profilePic: "/file.svg",
    username: "sciencefacts",
    latestPostContent: "Scientists discover new species of deep-sea creature with bioluminescent properties that could lead to advances in medical imaging.",
    rating: 91,
    isOnJury: true,
    claims: []
  },
  {
    profilePic: "/globe.svg",
    username: "cryptoexpert",
    latestPostContent: "Bitcoin reaches new all-time high as institutional adoption continues to grow. Major banks now offering crypto custody services.",
    rating: 76,
    isOnJury: false,
    claims: []
  },
  {
    profilePic: "/window.svg",
    username: "weatherwatch",
    latestPostContent: "Severe storm warning issued for the midwest. Heavy rainfall and flooding expected through the weekend. Stay safe everyone!",
    rating: 94,
    isOnJury: true,
    claims: []
  },
  {
    profilePic: "/file.svg",
    username: "sportsnews",
    latestPostContent: "BREAKING: Underdog team wins championship in stunning upset! Final score 3-2 in overtime thriller that had fans on their feet.",
    rating: 82,
    isOnJury: false,
    claims: []
  },
  {
    profilePic: "/globe.svg",
    username: "foodcritic",
    latestPostContent: "New restaurant posts to serve authentic Italian cuisine but uses processed ingredients. Disappointing experience for the price point.",
    rating: 34,
    isOnJury: false,
    claims: []
  },
  {
    profilePic: "/window.svg",
    username: "travelguide",
    latestPostContent: "Hidden gem discovered in remote mountain village! Ancient temples and breathtaking views make this a must-visit destination.",
    rating: 89,
    isOnJury: true,
    claims: []
  },
  {
    profilePic: "/file.svg",
    username: "techreviews",
    latestPostContent: "Latest smartphone review: Great camera but battery life is terrible. Overpriced for what you get. Wait for the next generation.",
    rating: 45,
    isOnJury: false,
    claims: []
  },
  {
    profilePic: "/globe.svg",
    username: "musicnews",
    latestPostContent: "Grammy nominations announced! Surprised by some inclusions and notable snubs. What are your thoughts on this year's list?",
    rating: 71,
    isOnJury: true,
    claims: []
  }
];

const mockEvidence: Evidence[] = [
  // Medical accuracy post evidence
  {
    supportsClaim: true,
    title: "Source Verification",
    description: "Cross-referenced with multiple reputable medical journals and verified research institutions. The post has been independently verified by three major medical research centers including Johns Hopkins, Mayo Clinic, and Cleveland Clinic.",
    wellStructuredPercentage: 92
  },
  {
    supportsClaim: true,
    title: "Expert Validation",
    description: "Statement reviewed and confirmed by board-certified healthcare professionals. A panel of 15 medical experts from various specialties have reviewed and endorsed the accuracy of this medical post.",
    wellStructuredPercentage: 88
  },
  {
    supportsClaim: true,
    title: "Statistical Accuracy",
    description: "The 95% accuracy post is supported by peer-reviewed clinical trial data from multiple studies conducted over the past 5 years with over 10,000 participants.",
    wellStructuredPercentage: 85
  },
  {
    supportsClaim: true,
    title: "Regulatory Approval",
    description: "The medical procedure mentioned has been approved by FDA and other international regulatory bodies after extensive clinical trials.",
    wellStructuredPercentage: 78
  },
  {
    supportsClaim: false,
    title: "Limited Sample Size",
    description: "Some studies cited have relatively small sample sizes which may not be representative of the general population.",
    wellStructuredPercentage: 45
  },
  {
    supportsClaim: false,
    title: "Conflicting Research",
    description: "Two recent studies have shown different results, suggesting the need for more comprehensive research before making definitive posts.",
    wellStructuredPercentage: 38
  },
  {
    supportsClaim: false,
    title: "Methodology Concerns",
    description: "Independent reviewers have raised questions about the methodology used in some of the supporting studies.",
    wellStructuredPercentage: 32
  },
  // Earthquake alert post evidence
  {
    supportsClaim: false,
    title: "Seismic Activity Detected",
    description: "Minor seismic activity was recorded by local monitoring stations, though not at the magnitude posted in the tweet.",
    wellStructuredPercentage: 72
  },
  {
    supportsClaim: false,
    title: "Breaking News Alert",
    description: "No official emergency services reports found matching this description. Major earthquake monitoring services have not issued any alerts for the mentioned region.",
    wellStructuredPercentage: 15
  },
  {
    supportsClaim: false,
    title: "Geological Data",
    description: "No significant seismic activity detected in mentioned coastal regions in past 24 hours according to USGS and international monitoring networks.",
    wellStructuredPercentage: 12
  },
  {
    supportsClaim: false,
    title: "News Verification",
    description: "Major news outlets have not reported any such earthquake event. No credible news sources have covered this alleged earthquake.",
    wellStructuredPercentage: 8
  },
  {
    supportsClaim: false,
    title: "Emergency Services",
    description: "Local emergency services have not received any reports or activated emergency protocols related to earthquake activity.",
    wellStructuredPercentage: 18
  },
  {
    supportsClaim: false,
    title: "Social Media Analysis",
    description: "No corroborating posts from residents in the alleged affected areas. Social media monitoring shows no spike in earthquake-related posts from the region.",
    wellStructuredPercentage: 22
  },
  // Marine discovery post evidence
  {
    supportsClaim: true,
    title: "Scientific Publication",
    description: "Discovery published in Marine Biology Journal with peer review. The research has undergone rigorous scientific review and has been accepted by the marine biology community.",
    wellStructuredPercentage: 94
  },
  {
    supportsClaim: true,
    title: "Research Institution",
    description: "Study conducted by Woods Hole Oceanographic Institution, one of the world's leading marine research facilities with a strong reputation for scientific accuracy.",
    wellStructuredPercentage: 91
  },
  {
    supportsClaim: true,
    title: "Independent Verification",
    description: "The discovery has been independently verified by marine biologists from three different research institutions.",
    wellStructuredPercentage: 87
  },
  {
    supportsClaim: true,
    title: "Medical Application",
    description: "Preliminary research shows promising applications in imaging technology. Early studies suggest potential breakthrough applications in medical imaging.",
    wellStructuredPercentage: 78
  },
  {
    supportsClaim: false,
    title: "Limited Research",
    description: "The medical applications are still in very early stages and have not been tested in clinical settings.",
    wellStructuredPercentage: 45
  },
  {
    supportsClaim: false,
    title: "Funding Concerns",
    description: "Questions have been raised about potential conflicts of interest due to the funding sources of the research.",
    wellStructuredPercentage: 35
  },
  // Bitcoin ATH post evidence
  {
    supportsClaim: true,
    title: "Market Data",
    description: "Bitcoin price confirmed at new all-time high across major exchanges including Coinbase, Binance, and Kraken. Price data is consistent across all major trading platforms.",
    wellStructuredPercentage: 89
  },
  {
    supportsClaim: true,
    title: "Institutional Adoption",
    description: "Multiple major banks have announced crypto custody services this quarter, including JPMorgan Chase, Bank of America, and Goldman Sachs.",
    wellStructuredPercentage: 82
  },
  {
    supportsClaim: true,
    title: "Trading Volume",
    description: "Increased institutional trading volume supports adoption posts. Trading volume has increased by 340% compared to the same period last year.",
    wellStructuredPercentage: 75
  },
  {
    supportsClaim: true,
    title: "Regulatory Clarity",
    description: "Recent regulatory developments have provided more clarity for institutional investors, contributing to increased adoption.",
    wellStructuredPercentage: 71
  },
  {
    supportsClaim: false,
    title: "Market Volatility",
    description: "Bitcoin's price remains highly volatile, and all-time highs are often followed by significant corrections.",
    wellStructuredPercentage: 58
  },
  {
    supportsClaim: false,
    title: "Adoption Skepticism",
    description: "Some financial experts remain skeptical about the long-term sustainability of institutional crypto adoption.",
    wellStructuredPercentage: 42
  },
  {
    supportsClaim: false,
    title: "Regulatory Uncertainty",
    description: "Despite some progress, regulatory uncertainty still exists in many jurisdictions, potentially limiting institutional adoption.",
    wellStructuredPercentage: 38
  },
  // Storm warning post evidence
  {
    supportsClaim: true,
    title: "Weather Service Alert",
    description: "National Weather Service has issued severe storm warnings for midwest region",
    wellStructuredPercentage: 96
  },
  {
    supportsClaim: true,
    title: "Meteorological Data",
    description: "Satellite imagery confirms large storm system approaching midwest",
    wellStructuredPercentage: 93
  },
  {
    supportsClaim: true,
    title: "Emergency Preparedness",
    description: "Local authorities have activated emergency response protocols",
    wellStructuredPercentage: 90
  },
  // Championship result post evidence
  {
    supportsClaim: true,
    title: "Sports League Verification",
    description: "Official league website confirms championship game results",
    wellStructuredPercentage: 95
  },
  {
    supportsClaim: true,
    title: "Media Coverage",
    description: "Multiple sports networks covered the championship game live",
    wellStructuredPercentage: 88
  },
  {
    supportsClaim: true,
    title: "Score Verification",
    description: "Final score of 3-2 in overtime confirmed by official scorekeepers",
    wellStructuredPercentage: 92
  },
  // Restaurant authenticity post evidence
  {
    supportsClaim: false,
    title: "Restaurant Investigation",
    description: "Health department inspection records show use of processed ingredients",
    wellStructuredPercentage: 67
  },
  {
    supportsClaim: false,
    title: "Menu Analysis",
    description: "Restaurant menu items contain pre-packaged components from suppliers",
    wellStructuredPercentage: 55
  },
  {
    supportsClaim: false,
    title: "Customer Reviews",
    description: "Multiple customer complaints about authenticity and value",
    wellStructuredPercentage: 42
  },
  // Temple discovery post evidence
  {
    supportsClaim: true,
    title: "Tourism Board Confirmation",
    description: "Local tourism authority confirms existence of ancient temple site",
    wellStructuredPercentage: 87
  },
  {
    supportsClaim: true,
    title: "Archaeological Evidence",
    description: "Historical records document temple construction dating back centuries",
    wellStructuredPercentage: 91
  },
  {
    supportsClaim: true,
    title: "Travel Reviews",
    description: "Independent travel reviews corroborate scenic beauty posts",
    wellStructuredPercentage: 84
  },
  // Device review post evidence
  {
    supportsClaim: false,
    title: "Technical Specifications",
    description: "Battery capacity tests confirm below-average performance compared to competitors",
    wellStructuredPercentage: 78
  },
  {
    supportsClaim: false,
    title: "Price Comparison",
    description: "Device pricing significantly higher than similar spec competitors",
    wellStructuredPercentage: 65
  },
  {
    supportsClaim: true,
    title: "Camera Testing",
    description: "Independent camera quality tests show above-average performance",
    wellStructuredPercentage: 82
  }
];

// Function to initialize the database with mock data
export function initializeDatabase(): void {
  console.log('Initializing database with mock data...');
  
  // Clear existing data
  users.length = 0;
  claims.length = 0;
  evidence.length = 0;
  
  // Add users
  mockUsers.forEach(user => {
    const success = addUser(user);
    if (!success) {
      console.warn(`Failed to add user: ${user.username}`);
    }
  });
  
  console.log("adding claims")
  // Add claims
  for (let i = 0; i < 10; i++) {
    const success = addClaim("https://x.com/realDonaldTrump/status/1925548216243703820");
    if (!success) {
      console.warn("Failed to add claim");
    }
  }
  
  // Add evidence
  mockEvidence.forEach(evidenceItem => {
    const success = addEvidence(evidenceItem);
    if (!success) {
      console.warn(`Failed to add evidence: ${evidenceItem.title}`);
    }
  });
  
  // Link evidence to claims (this is a simplified approach)
  // In a real application, you'd have proper foreign key relationships
  const evidenceGroups = [
    { claimId: 'medical-accuracy-post', evidenceRange: [0, 6] },
    { claimId: 'earthquake-alert-post', evidenceRange: [7, 12] },
    { claimId: 'marine-discovery-post', evidenceRange: [13, 18] },
    { claimId: 'bitcoin-ath-post', evidenceRange: [19, 25] },
    { claimId: 'storm-warning-post', evidenceRange: [26, 28] },
    { claimId: 'championship-result-post', evidenceRange: [29, 31] },
    { claimId: 'restaurant-authenticity-post', evidenceRange: [32, 34] },
    { claimId: 'temple-discovery-post', evidenceRange: [35, 37] },
    { claimId: 'device-review-post', evidenceRange: [38, 40] }
  ];
  
  evidenceGroups.forEach(group => {
    const claim = claims.find(c => c.claimId === group.claimId);
    if (claim) {
      claim.evidence = evidence.slice(group.evidenceRange[0], group.evidenceRange[1] + 1);
    }
  });
  
  console.log(`Database initialized with:`);
  console.log(`- ${users.length} users`);
  console.log(`- ${claims.length} claims`);
  console.log(`- ${evidence.length} evidence items`);
}

// Auto-initialize when this module is imported
initializeDatabase(); 
