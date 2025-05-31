import { Claim } from "@/app/types/db.types"

export const tweetsMock: Claim[] = [
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "medical-breakthrough-ai-diagnostics",
    author: "techguru2024",
    content: "Breaking: New AI breakthrough promises to revolutionize healthcare diagnostics with 95% accuracy in early disease detection.",
    category: "Health",
    profilePic: "/globe.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Peer-Reviewed Research",
        description: "Multiple studies published in Nature Medicine and NEJM confirm 95% accuracy rate in clinical trials with over 10,000 participants.",
        wellStructuredPercentage: 92
      },
      {
        supportsClaim: true,
        title: "FDA Approval Documentation",
        description: "Official FDA documentation shows breakthrough device designation with comprehensive safety and efficacy data.",
        wellStructuredPercentage: 88
      },
      {
        supportsClaim: false,
        title: "Limited Sample Diversity",
        description: "Critics note that clinical trials had limited demographic diversity, potentially affecting generalizability of results.",
        wellStructuredPercentage: 34
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "earthquake-coastal-evacuation",
    author: "newsreporter",
    content: "URGENT: Major earthquake hits coastal region, thousands evacuated. Emergency services responding to multiple rescue calls.",
    category: "News",
    profilePic: "/window.svg",
    evidence: [
      {
        supportsClaim: false,
        title: "USGS Seismic Data",
        description: "No significant seismic activity recorded in mentioned coastal regions according to official USGS monitoring stations.",
        wellStructuredPercentage: 15
      },
      {
        supportsClaim: false,
        title: "Emergency Services Report",
        description: "Local emergency services have not issued any major earthquake alerts or evacuation orders for the region in past 48 hours.",
        wellStructuredPercentage: 12
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "deep-sea-bioluminescent-discovery",
    author: "sciencefacts",
    content: "Scientists discover new species of deep-sea creature with bioluminescent properties that could lead to advances in medical imaging.",
    category: "Science",
    profilePic: "/file.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Marine Biology Journal Publication",
        description: "Research published in Marine Biology describes the newly discovered species with detailed bioluminescent protein analysis.",
        wellStructuredPercentage: 89
      },
      {
        supportsClaim: true,
        title: "University Research Team Confirmation",
        description: "MIT and Woods Hole Oceanographic Institution researchers confirm the discovery and its potential medical applications.",
        wellStructuredPercentage: 85
      },
      {
        supportsClaim: false,
        title: "Medical Application Timeline",
        description: "Experts caution that translating bioluminescent properties to medical imaging could take decades of additional research.",
        wellStructuredPercentage: 42
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "bitcoin-all-time-high-institutional",
    author: "cryptoexpert",
    content: "Bitcoin reaches new all-time high as institutional adoption continues to grow. Major banks now offering crypto custody services.",
    category: "Finance",
    profilePic: "/globe.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Market Data Verification",
        description: "CoinMarketCap and multiple exchanges confirm Bitcoin reached new all-time high of $73,000+ in recent trading.",
        wellStructuredPercentage: 95
      },
      {
        supportsClaim: true,
        title: "Bank Custody Services",
        description: "JPMorgan, Goldman Sachs, and Bank of America have all announced or expanded cryptocurrency custody services for institutional clients.",
        wellStructuredPercentage: 87
      },
      {
        supportsClaim: false,
        title: "Market Volatility Concerns",
        description: "Financial analysts warn that institutional adoption may not prevent significant price volatility and potential corrections.",
        wellStructuredPercentage: 38
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "midwest-storm-warning-flooding",
    author: "weatherwatch",
    content: "Severe storm warning issued for the midwest. Heavy rainfall and flooding expected through the weekend. Stay safe everyone!",
    category: "Weather",
    profilePic: "/window.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "National Weather Service Alert",
        description: "Official NWS severe weather warning issued for multiple midwest states with flood watches in effect through Sunday.",
        wellStructuredPercentage: 94
      },
      {
        supportsClaim: true,
        title: "Doppler Radar Data",
        description: "Weather radar shows significant storm systems moving through Iowa, Illinois, and Indiana with heavy precipitation rates.",
        wellStructuredPercentage: 91
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "championship-upset-overtime-win",
    author: "sportsnews",
    content: "BREAKING: Underdog team wins championship in stunning upset! Final score 3-2 in overtime thriller that had fans on their feet.",
    category: "Sports",
    profilePic: "/file.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Official Game Results",
        description: "ESPN and official league records confirm the 3-2 overtime victory by the underdog team in yesterday's championship game.",
        wellStructuredPercentage: 97
      },
      {
        supportsClaim: true,
        title: "Video Highlights",
        description: "Multiple video sources show the winning goal scored in overtime with crowd reactions confirming the excitement level.",
        wellStructuredPercentage: 89
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "restaurant-processed-ingredients",
    author: "foodcritic",
    content: "New restaurant claims to serve authentic Italian cuisine but uses processed ingredients. Disappointing experience for the price point.",
    category: "Food",
    profilePic: "/globe.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Ingredient Source Investigation",
        description: "Restaurant supplier invoices show purchases of pre-made pasta sauces and frozen components despite advertising fresh, homemade items.",
        wellStructuredPercentage: 78
      },
      {
        supportsClaim: false,
        title: "Chef Training Background",
        description: "Head chef has extensive training in traditional Italian cuisine and worked in authentic Italian restaurants for 15 years.",
        wellStructuredPercentage: 45
      },
      {
        supportsClaim: false,
        title: "Customer Review Analysis",
        description: "Overall customer reviews are positive with 4.2/5 stars, suggesting most diners are satisfied with the food quality.",
        wellStructuredPercentage: 32
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "mountain-village-ancient-temples",
    author: "travelguide",
    content: "Hidden gem discovered in remote mountain village! Ancient temples and breathtaking views make this a must-visit destination.",
    category: "Travel",
    profilePic: "/window.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Archaeological Survey",
        description: "Local archaeological society confirms temples date back to 12th century with significant historical and cultural value.",
        wellStructuredPercentage: 86
      },
      {
        supportsClaim: true,
        title: "Tourism Board Recognition",
        description: "Regional tourism board has officially recognized the site and added it to cultural heritage trail recommendations.",
        wellStructuredPercentage: 82
      },
      {
        supportsClaim: false,
        title: "Access Difficulty",
        description: "Remote location requires 6-hour hike through challenging terrain, making it unsuitable for most tourists.",
        wellStructuredPercentage: 29
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "smartphone-review-battery-issues",
    author: "techreviews",
    content: "Latest smartphone review: Great camera but battery life is terrible. Overpriced for what you get. Wait for the next generation.",
    category: "Technology",
    profilePic: "/file.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Battery Life Testing",
        description: "Independent testing shows battery lasts only 4.5 hours of heavy use, significantly below industry average of 8+ hours.",
        wellStructuredPercentage: 91
      },
      {
        supportsClaim: true,
        title: "Price Comparison Analysis",
        description: "Device costs 30% more than competitors with similar specifications and superior battery performance.",
        wellStructuredPercentage: 85
      },
      {
        supportsClaim: false,
        title: "Camera Quality Recognition",
        description: "DxOMark rates the camera system as top 3 in current smartphone market with excellent low-light performance.",
        wellStructuredPercentage: 93
      }
    ]
  },
  {
    url: "https://x.com/realDonaldTrump/status/1913359035132158083",
    claimId: "grammy-nominations-snubs-surprises",
    author: "musicnews",
    content: "Grammy nominations announced! Surprised by some inclusions and notable snubs. What are your thoughts on this year's list?",
    category: "Entertainment",
    profilePic: "/globe.svg",
    evidence: [
      {
        supportsClaim: true,
        title: "Official Grammy Announcement",
        description: "Recording Academy officially released the complete nominations list with several unexpected categories and omissions noted by industry experts.",
        wellStructuredPercentage: 95
      },
      {
        supportsClaim: true,
        title: "Industry Expert Analysis",
        description: "Music industry analysts from Billboard and Rolling Stone highlight surprising nominations and discuss notable artist snubs.",
        wellStructuredPercentage: 87
      },
      {
        supportsClaim: false,
        title: "Nomination Process Explanation",
        description: "Grammy voting process involves industry professionals making subjective choices, making surprises and snubs normal occurrences.",
        wellStructuredPercentage: 56
      }
    ]
  }
]