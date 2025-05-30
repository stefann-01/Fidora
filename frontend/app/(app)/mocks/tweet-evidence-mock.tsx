export interface EvidenceData {
  title: string
  description: string
  aiMetric: number
}

export interface TweetEvidenceData {
  id: string
  tweetUrl: string
  evidence: EvidenceData[]
}

export const tweetEvidenceMock: TweetEvidenceData[] = [
  {
    id: "1",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    evidence: [
      {
        title: "Source Verification",
        description: "Cross-referenced with multiple reputable medical journals and verified research institutions",
        aiMetric: 92
      },
      {
        title: "Expert Validation",
        description: "Statement reviewed and confirmed by board-certified healthcare professionals",
        aiMetric: 88
      },
      {
        title: "Statistical Accuracy",
        description: "The 95% accuracy claim is supported by peer-reviewed clinical trial data",
        aiMetric: 85
      }
    ]
  },
  {
    id: "2",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    evidence: [
      {
        title: "Breaking News Alert",
        description: "No official emergency services reports found matching this description",
        aiMetric: 15
      },
      {
        title: "Geological Data",
        description: "No seismic activity detected in mentioned coastal regions in past 24 hours",
        aiMetric: 12
      },
      {
        title: "News Verification",
        description: "Major news outlets have not reported any such earthquake event",
        aiMetric: 8
      }
    ]
  },
  {
    id: "3",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    evidence: [
      {
        title: "Scientific Publication",
        description: "Discovery published in Marine Biology Journal with peer review",
        aiMetric: 94
      },
      {
        title: "Research Institution",
        description: "Study conducted by Woods Hole Oceanographic Institution",
        aiMetric: 91
      },
      {
        title: "Medical Application",
        description: "Preliminary research shows promising applications in imaging technology",
        aiMetric: 78
      }
    ]
  },
  {
    id: "4",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
    evidence: [
      {
        title: "Market Data",
        description: "Bitcoin price confirmed at new all-time high across major exchanges",
        aiMetric: 89
      },
      {
        title: "Institutional Adoption",
        description: "Multiple major banks have announced crypto custody services this quarter",
        aiMetric: 82
      },
      {
        title: "Trading Volume",
        description: "Increased institutional trading volume supports adoption claims",
        aiMetric: 75
      }
    ]
  },
  {
    id: "5",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
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
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
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
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
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
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
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
        description: "Independent travel reviews corroborate scenic beauty claims",
        aiMetric: 84
      }
    ]
  },
  {
    id: "9",
    tweetUrl: "https://x.com/Makaronnez/status/1924554466101019057",
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