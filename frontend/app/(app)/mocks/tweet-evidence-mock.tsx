export interface EvidenceData {
  title: string
  description: string
  aiMetric: number
}

export interface TweetEvidenceData {
  id: string
  postId: string
  tweetUrl: string
  author: string
  evidence: EvidenceData[]
}

export const tweetEvidenceMock: TweetEvidenceData[] = [
  {
    id: "1",
    postId: "medical-accuracy-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      
      {
        title: "Source Verification",
        description: "Cross-referenced with multiple reputable medical journals and verified research institutions. The post has been independently verified by three major medical research centers including Johns Hopkins, Mayo Clinic, and Cleveland Clinic.",
        aiMetric: 92
      },
      {
        title: "Expert Validation",
        description: "Statement reviewed and confirmed by board-certified healthcare professionals. A panel of 15 medical experts from various specialties have reviewed and endorsed the accuracy of this medical post.",
        aiMetric: 88
      },
      {
        title: "Statistical Accuracy",
        description: "The 95% accuracy post is supported by peer-reviewed clinical trial data from multiple studies conducted over the past 5 years with over 10,000 participants.",
        aiMetric: 85
      },
      {
        title: "Regulatory Approval",
        description: "The medical procedure mentioned has been approved by FDA and other international regulatory bodies after extensive clinical trials.",
        aiMetric: 78
      },
      
      {
        title: "Limited Sample Size",
        description: "Some studies cited have relatively small sample sizes which may not be representative of the general population.",
        aiMetric: 45
      },
      {
        title: "Conflicting Research",
        description: "Two recent studies have shown different results, suggesting the need for more comprehensive research before making definitive posts.",
        aiMetric: 38
      },
      {
        title: "Methodology Concerns",
        description: "Independent reviewers have raised questions about the methodology used in some of the supporting studies.",
        aiMetric: 32
      }
    ]
  },
  {
    id: "2",
    postId: "earthquake-alert-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      
      {
        title: "Seismic Activity Detected",
        description: "Minor seismic activity was recorded by local monitoring stations, though not at the magnitude posted in the tweet.",
        aiMetric: 72
      },
      
      {
        title: "Breaking News Alert",
        description: "No official emergency services reports found matching this description. Major earthquake monitoring services have not issued any alerts for the mentioned region.",
        aiMetric: 15
      },
      {
        title: "Geological Data",
        description: "No significant seismic activity detected in mentioned coastal regions in past 24 hours according to USGS and international monitoring networks.",
        aiMetric: 12
      },
      {
        title: "News Verification",
        description: "Major news outlets have not reported any such earthquake event. No credible news sources have covered this alleged earthquake.",
        aiMetric: 8
      },
      {
        title: "Emergency Services",
        description: "Local emergency services have not received any reports or activated emergency protocols related to earthquake activity.",
        aiMetric: 18
      },
      {
        title: "Social Media Analysis",
        description: "No corroborating posts from residents in the alleged affected areas. Social media monitoring shows no spike in earthquake-related posts from the region.",
        aiMetric: 22
      }
    ]
  },
  {
    id: "3",
    postId: "marine-discovery-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      
      {
        title: "Scientific Publication",
        description: "Discovery published in Marine Biology Journal with peer review. The research has undergone rigorous scientific review and has been accepted by the marine biology community.",
        aiMetric: 94
      },
      {
        title: "Research Institution",
        description: "Study conducted by Woods Hole Oceanographic Institution, one of the world's leading marine research facilities with a strong reputation for scientific accuracy.",
        aiMetric: 91
      },
      {
        title: "Independent Verification",
        description: "The discovery has been independently verified by marine biologists from three different research institutions.",
        aiMetric: 87
      },
      {
        title: "Medical Application",
        description: "Preliminary research shows promising applications in imaging technology. Early studies suggest potential breakthrough applications in medical imaging.",
        aiMetric: 78
      },
      
      {
        title: "Limited Research",
        description: "The medical applications are still in very early stages and have not been tested in clinical settings.",
        aiMetric: 45
      },
      {
        title: "Funding Concerns",
        description: "Questions have been raised about potential conflicts of interest due to the funding sources of the research.",
        aiMetric: 35
      }
    ]
  },
  {
    id: "4",
    postId: "bitcoin-ath-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      
      {
        title: "Market Data",
        description: "Bitcoin price confirmed at new all-time high across major exchanges including Coinbase, Binance, and Kraken. Price data is consistent across all major trading platforms.",
        aiMetric: 89
      },
      {
        title: "Institutional Adoption",
        description: "Multiple major banks have announced crypto custody services this quarter, including JPMorgan Chase, Bank of America, and Goldman Sachs.",
        aiMetric: 82
      },
      {
        title: "Trading Volume",
        description: "Increased institutional trading volume supports adoption posts. Trading volume has increased by 340% compared to the same period last year.",
        aiMetric: 75
      },
      {
        title: "Regulatory Clarity",
        description: "Recent regulatory developments have provided more clarity for institutional investors, contributing to increased adoption.",
        aiMetric: 71
      },
      
      {
        title: "Market Volatility",
        description: "Bitcoin's price remains highly volatile, and all-time highs are often followed by significant corrections.",
        aiMetric: 58
      },
      {
        title: "Adoption Skepticism",
        description: "Some financial experts remain skeptical about the long-term sustainability of institutional crypto adoption.",
        aiMetric: 42
      },
      {
        title: "Regulatory Uncertainty",
        description: "Despite some progress, regulatory uncertainty still exists in many jurisdictions, potentially limiting institutional adoption.",
        aiMetric: 38
      }
    ]
  },
  {
    id: "5",
    postId: "storm-warning-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "weatherwatcher",
    evidence: [
      {
        title: "Weather Service Alert",
        description: "National Weather Service has issued severe storm warnings for midwest region",
        aiMetric: 96
      },
      {
        title: "Meteorological Data",
        description: "Satellite imagery confirms large storm system approaching midwest",
        aiMetric: 93
      },
      {
        title: "Emergency Preparedness",
        description: "Local authorities have activated emergency response protocols",
        aiMetric: 90
      }
    ]
  },
  {
    id: "6",
    postId: "championship-result-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "sportsfan_mike",
    evidence: [
      {
        title: "Sports League Verification",
        description: "Official league website confirms championship game results",
        aiMetric: 95
      },
      {
        title: "Media Coverage",
        description: "Multiple sports networks covered the championship game live",
        aiMetric: 88
      },
      {
        title: "Score Verification",
        description: "Final score of 3-2 in overtime confirmed by official scorekeepers",
        aiMetric: 92
      }
    ]
  },
  {
    id: "7",
    postId: "restaurant-authenticity-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      {
        title: "Restaurant Investigation",
        description: "Health department inspection records show use of processed ingredients",
        aiMetric: 67
      },
      {
        title: "Menu Analysis",
        description: "Restaurant menu items contain pre-packaged components from suppliers",
        aiMetric: 55
      },
      {
        title: "Customer Reviews",
        description: "Multiple customer complaints about authenticity and value",
        aiMetric: 42
      }
    ]
  },
  {
    id: "8",
    postId: "temple-discovery-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      {
        title: "Tourism Board Confirmation",
        description: "Local tourism authority confirms existence of ancient temple site",
        aiMetric: 87
      },
      {
        title: "Archaeological Evidence",
        description: "Historical records document temple construction dating back centuries",
        aiMetric: 91
      },
      {
        title: "Travel Reviews",
        description: "Independent travel reviews corroborate scenic beauty posts",
        aiMetric: 84
      }
    ]
  },
  {
    id: "9",
    postId: "device-review-post",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    author: "techguru2024",
    evidence: [
      {
        title: "Technical Specifications",
        description: "Battery capacity tests confirm below-average performance compared to competitors",
        aiMetric: 78
      },
      {
        title: "Price Comparison",
        description: "Device pricing significantly higher than similar spec competitors",
        aiMetric: 65
      },
      {
        title: "Camera Testing",
        description: "Independent camera quality tests show above-average performance",
        aiMetric: 82
      }
    ]
  }
]
