Fidora Web3 Project

Fidora is a decentralized truth‐verification platform built around Twitter claims. Users can turn a tweet into a “claim,” allow others to secretly bet on whether it’s true or false, and then resolve outcomes via a randomly selected jury. Over time, Fidora becomes a community-driven truth oracle—and we can aggregate results to rate how often individual Twitter accounts post claims that are ultimately proven true or false.

This README covers:

    Project Overview

    Prerequisites

    Installation & Setup

    Smart Contract Details

    Deployment

    Interaction Examples

    Frontend Integration Guidance

    Testing

    Configuration & Environment Variables

    Security Notes

1. Project Overview

    Decentralized Truth Oracle
    Fidora lets users turn any tweet into a verifiable “claim.” Bettors stake native currency on “Agree,” “Disagree,” and a jury resolves the claim. Because bets and votes are kept secret, there’s no herd mentality—each decision is based on individual judgment and cryptographic randomness.

    Jury-Based Resolution
    Jurors pre-stake to join a pool. After betting ends, a random subset of jurors is selected. They vote on the claim: “Agree,” “Disagree,” or “Unprovable.” If all vote, the outcome is computed, losing bettors’ funds are distributed to winners, and jurors earn rewards. If any juror fails to vote, that juror is penalized and voting restarts.

    Rating Twitter Accounts Over Time
    By recording each claim’s final outcome on-chain, Fidora can track which Twitter accounts tend to post accurate or inaccurate statements. Over time, the platform can compute a “truth score” for each account, helping users judge reliability.

    Randomness Sources

        Flare RNG: If isFlare = true, Fidora uses Flare’s on-chain RandomNumberV2 via ContractRegistry.

        Pyth RNG: If isPyth = true, Fidora uses a custom RandomNumberSource that queries Pyth’s randomness.

2. Prerequisites

    Node.js v16+

    npm or yarn

    Hardhat v2.14+

    Solidity v0.8.28

    Metamask (or another EOA) for interacting with deployed contracts

    .env file with required configuration (see Section 9)

3. Installation & Setup

    Clone the repository

git clone https://github.com/yourusername/fidora.git
cd fidora

Install dependencies

npm install
# or
yarn install

Compile Smart Contracts

npx hardhat compile

Create a .env file at the project root with these entries:

# .env

# Deployer / Owner address
OWNER_ADDRESS=0xYourDeployerAddress

# Entropy provider addresses per network
ENTROPY_ADDRESS_COSTON2=0xFlareEntropyOnCoston2
ENTROPY_ADDRESS_ARBITRUM_SEPOLIA=0xEntropyOnArbSepolia

# Fees & durations
JUROR_BUYIN_FEE=1000000000000000000         # 1 native token (wei)
CLAIM_FEE=500000000000000000                  # 0.5 native token (wei)
VOTING_DURATION=86400                         # 24 hours (seconds)
MAX_BETTING_DURATION=43200                    # 12 hours (seconds)
MIN_BETTING_AMOUNT=10000000000000000          # 0.01 native token (wei)
SIGNIFICANT_VOTE_MULTIPLIER=1500000000000000000 # 1.5× wad

# Initial funding for Pyth RNG contract
RANDOM_SOURCE_INITIAL_FUND=2000000000000000000 # 2 native tokens (wei)

# RPC URLs
COSTON2_RPC_URL=https://coston2-rpc.flare.network
ARB_SEPOLIA_RPC_URL=https://arb1-sepolia.g.alchemy.com/v2/your-key

# Deployer private key (for Hardhat)
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

Configure hardhat.config.js

    require("dotenv").config();
    require("@nomiclabs/hardhat-ethers");
    require("@nomiclabs/hardhat-etherscan");

    module.exports = {
      solidity: "0.8.28",
      defaultNetwork: "hardhat",
      networks: {
        hardhat: {},
        localhost: {},
        coston2: {
          url: process.env.COSTON2_RPC_URL,
          chainId: 14161,
          accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
        },
        arbitrum_sepolia: {
          url: process.env.ARB_SEPOLIA_RPC_URL,
          chainId: 421613,
          accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
        }
      },
      etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || ""
      }
    };

4. Smart Contract Details
4.1. Fidora.sol

    Purpose: Decentralized truth verification via juror votes and secret bets.

Constructor Parameters

    _owner (address)

    _zkProofsAddress (address) – ZkProofs implementation (e.g., ZkPlaceholder)

    _randomNumberSourceAddress (address) – Pyth RNG contract

    _jurorBuyInFee (uint256) – Stake for jurors to join

    _claimFee (uint256) – Fee to make a claim

    _votingDuration (uint256) – Voting window length (seconds)

    _maxBettingDuration (uint256) – Maximum betting window (seconds)

    _minBettingAmount (uint256) – Minimum bet (wei)

    _significantVoteMultiplier (uint256) – Vote margin multiplier (wad)

    _isFlare (bool) – Use Flare RNG if true

    _isPyth (bool) – Use Pyth RNG if true

Key State Variables

    bool isFlare, isPyth – Toggle which RNG source to use.

    IZkProofs zkProofs – Interface for secret bet recording.

    RandomNumberSource randomNumberSource – Pyth RNG consumer.

    RandomNumberV2Interface randomV2 – Flare RNG interface (if isFlare).

    mapping(uint256 => Claim) claims – Stores each claim’s data: timestamp, bet window, owner, voting deadline, finalVote, paidOut mapping.

    address[] jurors – List of staked juror addresses.

    mapping(address => uint256) indexOfJurors – Fast membership check for jurors.

    mapping(address => uint8) jurorStakesPercentagePenalty – Penalty percent (0–100) for missed votes.

Core Functions

    makeClaim(uint256 _claimId, uint256 _bettingDuration) external payable

        Creates a claim for a tweet if it doesn't already exist.

    makeBet(uint256 _claimId, Vote _option) external payable

        Places a bet on an outcome for a claim during the betting phase.

    initiateVoting(uint256 _claimId) external onlyOwner

        Triggered by our system, randomly selects jury onchain and starts the voting phase.

    castVote(uint256 _claimId, Vote _vote) external

        Casts a vote for a claim by a valid juror.

    tryResolveClaim(uint256 _claimId) external onlyOwner returns (bool)

        Triggered by our system when the voting ends, restarts the vote if not everyone voted,
        or finalizes the vote if everyone did.

    signupForJury() external payable

        Wth providing stake, allows user to be considered for future jury-duty.

    leaveJury() external

        Removes user from the set of possible jurors. Returns the stake (minus non-voting penalites).

    getMyRewards(uint256 _claimId) external returns (uint256)

        Sends the appropriate amount of native currency to the bettor after the voting is done.

5. Deployment

    Compile

npx hardhat compile

Deploy via script

npx hardhat run scripts/deploy.js --network coston2

or

npx hardhat run scripts/deploy.js --network arbitrum_sepolia

Sample Output

⛓  Deploying to network: COSTON2
🚀 Deploying ZkPlaceholder...
✅ ZkPlaceholder deployed to: 0x…
🚀 Deploying RandomNumberSource...
✅ RandomNumberSource deployed to: 0x…
🚀 Deploying Fidora...
✅ Fidora deployed to: 0x…
🔄 Transferring ownership of helper contracts to Fidora...
✅ Ownership of RandomNumberSource and ZkPlaceholder transferred to Fidora.
🖊️  Updating .env with network-specific addresses...
✅ .env file updated with network-specific addresses.
🎉 Deployment complete!

.env Updates
The script auto-writes:

    ZK_PLACEHOLDER_ADDRESS_COSTON2=0x…
    RANDOM_SOURCE_ADDRESS_COSTON2=0x…
    FIDORA_ADDRESS_COSTON2=0x…
    ENTROPY_ADDRESS_COSTON2=0x…

    And similarly for Arbitrum Sepolia, etc.

6. Interaction Examples



7. Frontend Integration Guidance

  


8. Configuration & Environment Variables
Variable	Description
OWNER_ADDRESS	Deployer EOA (contract owner)
ENTROPY_ADDRESS_<NETWORK>	On-chain entropy provider address
JUROR_BUYIN_FEE	Fee (in wei) to become a juror
CLAIM_FEE	Fee (in wei) to create a claim
VOTING_DURATION	Voting window length (in seconds)
MAX_BETTING_DURATION	Maximum betting window (in seconds)
MIN_BETTING_AMOUNT	Minimum bet amount (in wei)
SIGNIFICANT_VOTE_MULTIPLIER	Vote margin multiplier (wad)
RANDOM_SOURCE_INITIAL_FUND	Native tokens (wei) to fund Pyth RNG contract
COSTON2_RPC_URL	RPC URL for Flare Coston2
ARB_SEPOLIA_RPC_URL	RPC URL for Arbitrum Sepolia
DEPLOYER_PRIVATE_KEY	Private key for deployment (Hardhat)
10. Security Notes

    Secret Betting: Bets are recorded via ZkPlaceholder (a dummy zk implementation). Replace with a production zk system before mainnet.

    Randomness:

        If isFlare == true, ensure the Flare ContractRegistry is correctly pointed to a deployed registry on Coston2.

        If isPyth == true, fund RandomNumberSource with enough tokens to pay oracle fees.

    Juror Penalties: Jurors risk partial stake loss (20% per miss, up to 80%) before removal. Tune these parameters based on community size.

    Refund Paths: For “Unprovable” or “Undecided” outcomes, all staked funds (bets + juror stakes) are refunded.

    Account Rating: Track each tweet’s final outcome on-chain to compute a rolling “truth score” per Twitter account. Do not rely solely on a single claim—aggregate over many claims to avoid bias.