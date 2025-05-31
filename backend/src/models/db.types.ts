export interface User {
  id: string;
  profilePic: string; // URL to profile picture
  username: string;
  latestPostContent: string;
  rating: number; // numeric rating
  isOnJury: boolean;
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
  id: string;
  supportsClaim: boolean;
  title: string;
  description: string;
  wellStructuredPercentage: number; // AI-generated percentage
}
