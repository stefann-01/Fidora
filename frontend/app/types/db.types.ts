export interface User {
  profilePic: string; // URL to profile picture
  username: string;
  latestPostContent: string;
  rating: number; // numeric rating
  claims: Claim[]; // array of claims
}

export interface Claim {
  url: string;
  claimId: string;
  author: string;
  content: string;
  category: string;
  profilePic?: string; // Optional profile picture URL
  evidence: Evidence[]; // array of evidence objects
}

export interface Evidence {
  supportsClaim: boolean;
  title: string;
  description: string;
  wellStructuredPercentage: number; // AI-generated percentage
}

// Mock evidence for the Niko McKnight death claim
export const mockEvidenceNikoMcKnight: Evidence[] = [
  // Supporting evidence
  {
    supportsClaim: true,
    title: "Obituary published on TheGrio.com",
    description: "Official obituary notice published on TheGrio.com, a reputable news source, confirming Niko McKnight's death from cancer. The article includes details about his life and career as Brian McKnight's son.",
    wellStructuredPercentage: 0.92
  },
  {
    supportsClaim: true,
    title: "Family statement on social media",
    description: "Brian McKnight's official social media accounts posted a heartfelt statement confirming his son's passing and asking for privacy during this difficult time.",
    wellStructuredPercentage: 0.88
  },
  {
    supportsClaim: true,
    title: "Multiple news outlets reporting",
    description: "Several entertainment news outlets including Entertainment Tonight, People Magazine, and TMZ have independently confirmed the death through their own sources.",
    wellStructuredPercentage: 0.85
  },
  {
    supportsClaim: true,
    title: "Hospital records leak",
    description: "Unverified hospital documentation allegedly showing Niko McKnight's admission and treatment for terminal cancer has circulated on social media platforms.",
    wellStructuredPercentage: 0.45
  },
  
  // Contradicting evidence
  {
    supportsClaim: false,
    title: "No official death certificate found",
    description: "Public records searches in multiple states show no official death certificate filed for Niko McKnight as of the date claimed in the tweet.",
    wellStructuredPercentage: 0.78
  },
  {
    supportsClaim: false,
    title: "Recent social media activity",
    description: "Niko McKnight's personal Instagram account shows activity within the past 48 hours, including story views and likes on posts, suggesting he may still be alive.",
    wellStructuredPercentage: 0.82
  },
  {
    supportsClaim: false,
    title: "Brian McKnight's representatives deny reports",
    description: "A spokesperson for Brian McKnight has issued a statement calling the death reports 'completely false' and stating that Niko is 'alive and well.'",
    wellStructuredPercentage: 0.90
  },
  {
    supportsClaim: false,
    title: "TheGrio.com link returns 404 error",
    description: "The link provided in the original tweet (thegrio.com/2025/05/30/nik...) returns a 404 'page not found' error, suggesting the article may not exist or has been removed.",
    wellStructuredPercentage: 0.95
  },
  {
    supportsClaim: false,
    title: "Similar hoax patterns identified",
    description: "The tweet follows a common pattern of celebrity death hoaxes, including vague details, emotional language, and links to non-existent articles on legitimate news sites.",
    wellStructuredPercentage: 0.73
  },
  {
    supportsClaim: false,
    title: "No mainstream media coverage",
    description: "Major news networks (CNN, BBC, Reuters, AP) have not reported on Niko McKnight's alleged death, which would be unusual for the son of a well-known celebrity.",
    wellStructuredPercentage: 0.87
  }
]
