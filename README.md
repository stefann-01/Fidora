<!--  Fidora Web3 Project – Rich-text (HTML) version  -->
<h1>Fidora Web3 Project</h1>

<p>
<strong>Fidora</strong> is a decentralized truth-verification platform built around Twitter claims.
Users can turn a tweet into a <em>claim</em>, secretly bet on whether it’s true or false, and let a randomly
selected jury resolve the outcome. Over time, Fidora becomes a community-driven truth oracle, allowing us to
rate how often individual Twitter accounts post claims proven true or false.
</p>

<hr>

<h2>README Covers</h2>
<ol>
  <li>Project Overview</li>
  <li>Prerequisites</li>
  <li>Installation &amp; Setup</li>
  <li>Smart Contract Details</li>
  <li>Deployment</li>
  <li>Interaction Examples</li>
  <li>Frontend Integration Guidance</li>
  <li>Testing</li>
  <li>Configuration &amp; Environment Variables</li>
  <li>Security Notes</li>
</ol>

<hr>

<h2 id="overview">1. Project Overview</h2>

<h3>Decentralized Truth Oracle</h3>
<ul>
  <li>Turn any tweet into a verifiable <strong>claim</strong>.</li>
  <li>Bettors stake native currency on <strong>Agree</strong> or <strong>Disagree</strong>.</li>
  <li>Secret bets + cryptographic randomness remove herd mentality.</li>
</ul>

<h3>Jury-Based Resolution</h3>
<ul>
  <li>Jurors pre-stake to join a pool.</li>
  <li>After betting ends, a random subset of jurors votes: <em>Agree</em>, <em>Disagree</em>, or <em>Unprovable</em>.</li>
  <li>Winners share losing bets; jurors earn rewards. Absent jurors are penalized and voting restarts.</li>
</ul>

<h3>Rating Twitter Accounts Over Time</h3>
<p>Every resolved claim is stored on-chain, enabling Fidora to compute a rolling truth-score for each account.</p>

<h3>Randomness Sources</h3>
<ul>
  <li><strong>Flare RNG</strong> &mdash; <code>isFlare = true</code>: uses Flare’s on-chain <code>RandomNumberV2</code>.</li>
  <li><strong>Pyth RNG</strong> &mdash; <code>isPyth = true</code>: custom <code>RandomNumberSource</code> querying Pyth randomness.</li>
</ul>

<hr>

<h2 id="prereq">2. Prerequisites</h2>
<ul>
  <li>Node.js v16+</li>
  <li>npm or yarn</li>
  <li>Hardhat v2.14+</li>
  <li>Solidity v0.8.28</li>
  <li>Metamask (or another EOA)</li>
  <li>.env file (see <a href="#config">Section 8</a>)</li>
</ul>

<hr>

<h2 id="install">3. Installation &amp; Setup</h2>

<h3>Clone &amp; Install</h3>
<pre><code>git clone https://github.com/yourusername/fidora.git
cd fidora

# install deps
npm install   # or yarn install
</code></pre>

<h3>Compile Contracts</h3>
<pre><code>npx hardhat compile
</code></pre>

<h3>Create <code>.env</code></h3>
<pre><code># .env
OWNER_ADDRESS=0xYourDeployerAddress
ENTROPY_ADDRESS_COSTON2=0xFlareEntropyOnCoston2
ENTROPY_ADDRESS_ARBITRUM_SEPOLIA=0xEntropyOnArbSepolia

JUROR_BUYIN_FEE=1000000000000000000         # 1 token (wei)
CLAIM_FEE=500000000000000000                # 0.5 token
VOTING_DURATION=86400                       # 24 h
MAX_BETTING_DURATION=43200                  # 12 h
MIN_BETTING_AMOUNT=10000000000000000        # 0.01 token
SIGNIFICANT_VOTE_MULTIPLIER=1500000000000000000  # 1.5×

RANDOM_SOURCE_INITIAL_FUND=2000000000000000000   # 2 tokens

COSTON2_RPC_URL=https://coston2-rpc.flare.network
ARB_SEPOLIA_RPC_URL=https://arb1-sepolia.g.alchemy.com/v2/your-key
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey
</code></pre>

<h3>Configure <code>hardhat.config.js</code></h3>
<pre><code class="language-js">require("dotenv").config();
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
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY || "" }
};
</code></pre>

<hr>

<h2 id="contracts">4. Smart Contract Details</h2>

<h3>4.1 <code>Fidora.sol</code></h3>

<p><strong>Purpose:</strong> decentralized truth verification via juror votes &amp; secret bets.</p>

<h4>Constructor Parameters</h4>
<table border="1" cellspacing="0" cellpadding="4">
<thead>
<tr><th>Param</th><th>Type</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td>_owner</td><td>address</td><td>Contract owner</td></tr>
<tr><td>_zkProofsAddress</td><td>address</td><td>ZK-Proof implementation</td></tr>
<tr><td>_randomNumberSourceAddress</td><td>address</td><td>Pyth RNG contract</td></tr>
<tr><td>_jurorBuyInFee</td><td>uint256</td><td>Stake to join jury</td></tr>
<tr><td>_claimFee</td><td>uint256</td><td>Fee to create claim</td></tr>
<tr><td>_votingDuration</td><td>uint256</td><td>Voting window (sec)</td></tr>
<tr><td>_maxBettingDuration</td><td>uint256</td><td>Max betting window (sec)</td></tr>
<tr><td>_minBettingAmount</td><td>uint256</td><td>Minimum bet (wei)</td></tr>
<tr><td>_significantVoteMultiplier</td><td>uint256</td><td>Vote-margin multiplier</td></tr>
<tr><td>_isFlare</td><td>bool</td><td>Use Flare RNG</td></tr>
<tr><td>_isPyth</td><td>bool</td><td>Use Pyth RNG</td></tr>
</tbody>
</table>

<h4>Core Functions</h4>
<ul>
  <li><code>makeClaim(_claimId, _bettingDuration)</code></li>
  <li><code>makeBet(_claimId, _option)</code></li>
  <li><code>initiateVoting(_claimId)</code></li>
  <li><code>castVote(_claimId, _vote)</code></li>
  <li><code>tryResolveClaim(_claimId)</code></li>
  <li><code>signupForJury()</code> / <code>leaveJury()</code></li>
  <li><code>getMyRewards(_claimId)</code></li>
</ul>

<hr>

<h2 id="deploy">5. Deployment</h2>

<h3>Compile</h3>
<pre><code>npx hardhat compile
</code></pre>

<h3>Deploy via script</h3>
<pre><code># Flare Coston2
npx hardhat run scripts/deploy.js --network coston2

# Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrum_sepolia
</code></pre>

<details>
<summary>Sample Output</summary>
<pre><code>⛓  Deploying to network: COSTON2
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
</code></pre>
</details>

<p><em>.env Auto-Updates (per network):</em></p>
<pre><code>ZK_PLACEHOLDER_ADDRESS_COSTON2=0x…
RANDOM_SOURCE_ADDRESS_COSTON2=0x…
FIDORA_ADDRESS_COSTON2=0x…
ENTROPY_ADDRESS_COSTON2=0x…
</code></pre>

<hr>

<h2 id="examples">6. Interaction Examples</h2>
<p><em>Coming soon…</em></p>

<hr>

<h2 id="frontend">7. Frontend Integration Guidance</h2>
<p>Use <code>ethers.js</code> or <code>viem</code> for on-chain calls, listen for <code>ClaimResolved</code> events, and batch reads via multicall.</p>

<hr>

<h2 id="config">8. Configuration &amp; Environment Variables</h2>

<table border="1" cellspacing="0" cellpadding="4">
<thead>
<tr><th>Variable</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td>OWNER_ADDRESS</td><td>Deployer EOA (owner)</td></tr>
<tr><td>ENTROPY_ADDRESS_&lt;NETWORK&gt;</td><td>On-chain entropy provider</td></tr>
<tr><td>JUROR_BUYIN_FEE</td><td>Stake to join jury</td></tr>
<tr><td>CLAIM_FEE</td><td>Fee to create claim</td></tr>
<tr><td>VOTING_DURATION</td><td>Voting window (sec)</td></tr>
<tr><td>MAX_BETTING_DURATION</td><td>Max betting window (sec)</td></tr>
<tr><td>MIN_BETTING_AMOUNT</td><td>Minimum bet (wei)</td></tr>
<tr><td>SIGNIFICANT_VOTE_MULTIPLIER</td><td>Vote-margin multiplier</td></tr>
<tr><td>RANDOM_SOURCE_INITIAL_FUND</td><td>Initial fund for Pyth RNG (wei)</td></tr>
<tr><td>COSTON2_RPC_URL</td><td>RPC URL – Flare Coston2</td></tr>
<tr><td>ARB_SEPOLIA_RPC_URL</td><td>RPC URL – Arbitrum Sepolia</td></tr>
<tr><td>DEPLOYER_PRIVATE_KEY</td><td>Private key for deployment</td></tr>
</tbody>
</table>

<hr>

<h2 id="security">9. Security Notes</h2>
<ul>
  <li><strong>Secret Betting</strong> – current <code>ZkPlaceholder</code> is a stub; replace before mainnet.</li>
  <li><strong>Randomness</strong> – ensure correct Flare registry or fund Pyth RNG fees.</li>
  <li><strong>Juror Penalties</strong> – each missed vote burns 20 % stake (up to 80 %).</li>
  <li><strong>Refund Paths</strong> – “Unprovable” or “Undecided” ⇒ full refunds.</li>
  <li><strong>Account Rating</strong> – aggregate many claims for unbiased truth scores.</li>
</ul>

<hr>

<p style="text-align:center;"><em>© 2025 Fidora Contributors · MIT License</em></p>
