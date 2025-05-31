import { Group } from "@semaphore-protocol/group";

export interface User {
  id: string;
  profilePic?: string;
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
  profilePic?: string;
  evidence: Evidence[];
  semaphore: Group;
  lighthouseHash?: string;
}

export interface Evidence {
  id: string;
  supportsClaim: boolean;
  title: string;
  description: string;
  wellStructuredPercentage: number; // AI-generated percentage
}
