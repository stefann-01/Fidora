export interface AccountData {
  id: string
  photo: string
  accountName: string
  latestTweetContent: string
  votedTrue: boolean
  rating: number
}

export const accountsMock: AccountData[] = [
  {
    id: "1",
    photo: "/globe.svg",
    accountName: "@techguru2024",
    latestTweetContent: "Breaking: New AI breakthrough promises to revolutionize healthcare diagnostics with 95% accuracy in early disease detection.",
    votedTrue: true,
    rating: 87
  },
  {
    id: "2", 
    photo: "/window.svg",
    accountName: "@newsreporter",
    latestTweetContent: "URGENT: Major earthquake hits coastal region, thousands evacuated. Emergency services responding to multiple rescue calls.",
    votedTrue: false,
    rating: 23
  },
  {
    id: "3",
    photo: "/file.svg", 
    accountName: "@sciencefacts",
    latestTweetContent: "Scientists discover new species of deep-sea creature with bioluminescent properties that could lead to advances in medical imaging.",
    votedTrue: true,
    rating: 91
  },
  {
    id: "4",
    photo: "/globe.svg",
    accountName: "@cryptoexpert",
    latestTweetContent: "Bitcoin reaches new all-time high as institutional adoption continues to grow. Major banks now offering crypto custody services.",
    votedTrue: true,
    rating: 76
  },
  {
    id: "5",
    photo: "/window.svg",
    accountName: "@weatherwatch",
    latestTweetContent: "Severe storm warning issued for the midwest. Heavy rainfall and flooding expected through the weekend. Stay safe everyone!",
    votedTrue: true,
    rating: 94
  },
  {
    id: "6",
    photo: "/file.svg",
    accountName: "@sportsnews",
    latestTweetContent: "BREAKING: Underdog team wins championship in stunning upset! Final score 3-2 in overtime thriller that had fans on their feet.",
    votedTrue: true,
    rating: 82
  },
  {
    id: "7",
    photo: "/globe.svg",
    accountName: "@foodcritic",
    latestTweetContent: "New restaurant posts to serve authentic Italian cuisine but uses processed ingredients. Disappointing experience for the price point.",
    votedTrue: false,
    rating: 34
  },
  {
    id: "8",
    photo: "/window.svg",
    accountName: "@travelguide",
    latestTweetContent: "Hidden gem discovered in remote mountain village! Ancient temples and breathtaking views make this a must-visit destination.",
    votedTrue: true,
    rating: 89
  },
  {
    id: "9",
    photo: "/file.svg",
    accountName: "@techreviews",
    latestTweetContent: "Latest smartphone review: Great camera but battery life is terrible. Overpriced for what you get. Wait for the next generation.",
    votedTrue: false,
    rating: 45
  },
  {
    id: "10",
    photo: "/globe.svg",
    accountName: "@musicnews",
    latestTweetContent: "Grammy nominations announced! Surprised by some inclusions and notable snubs. What are your thoughts on this year's list?",
    votedTrue: true,
    rating: 71
  }
] 
