import { Claim, Evidence, User } from '../../app/types/db.types';

export const users: User[] = [];

export const claims: Claim[] = [
  {
    url: "https://x.com/realDonaldTrump/status/1925548216243703820",
    claimId: "trump-investment-claim",
    author: "realDonaldTrump",
    content: "In two months, there has been more Private Investment spoken for, and/or committed to, than in four years of the Sleepy Joe Biden Administration — A fact that the Fake News hates talking about!",
    category: "Politics",
    profilePic: "/trump-profile.jpg",
    evidence: []
  },
  {
    url: "https://x.com/techguru2024/status/1925548216243703821",
    claimId: "ai-healthcare-breakthrough",
    author: "techguru2024",
    content: "Breaking: New AI breakthrough promises to revolutionize healthcare diagnostics with 95% accuracy in early disease detection.",
    category: "Technology",
    profilePic: "/globe.svg",
    evidence: []
  },
  {
    url: "https://x.com/newsreporter/status/1925548216243703822",
    claimId: "earthquake-alert",
    author: "newsreporter",
    content: "URGENT: Major earthquake hits coastal region, thousands evacuated. Emergency services responding to multiple rescue calls.",
    category: "News",
    profilePic: "/window.svg",
    evidence: []
  },
  {
    url: "https://x.com/sciencefacts/status/1925548216243703823",
    claimId: "marine-discovery",
    author: "sciencefacts",
    content: "Scientists discover new species of deep-sea creature with bioluminescent properties that could lead to advances in medical imaging.",
    category: "Science",
    profilePic: "/file.svg",
    evidence: []
  },
  {
    url: "https://x.com/cryptoexpert/status/1925548216243703824",
    claimId: "bitcoin-ath",
    author: "cryptoexpert",
    content: "Bitcoin reaches new all-time high as institutional adoption continues to grow. Major banks now offering crypto custody services.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: []
  }
];

export const evidence: Evidence[] = [];
