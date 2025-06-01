// scripts/deploy.js

// Load environment variables from the .env file
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const { ethers, network, run } = require("hardhat");

async function main() {
  // Use uppercase network name for environment‐variable keys
  const networkName = network.name.toUpperCase(); // e.g. "ARBITRUM_SEPOLIA" or "LOCALHOST"

  // Now read the entropy address from a network‐specific env var:
  // e.g. ENTROPY_ADDRESS_ARBITRUM_SEPOLIA, ENTROPY_ADDRESS_LOCALHOST, etc.
  const OWNER_ADDRESS = process.env.OWNER_ADDRESS || "";
  const ENTROPY_ENV_VAR = `ENTROPY_ADDRESS_${networkName}`;
  const ENTROPY_ADDRESS = process.env[ENTROPY_ENV_VAR] || "";
  const JUROR_BUYIN_FEE = process.env.JUROR_BUYIN_FEE || "";
  const CLAIM_FEE = process.env.CLAIM_FEE || "";
  const VOTING_DURATION = process.env.VOTING_DURATION || "";
  const MAX_BETTING_DURATION = process.env.MAX_BETTING_DURATION || "";
  const MIN_BETTING_AMOUNT = process.env.MIN_BETTING_AMOUNT || "";
  const SIGNIFICANT_VOTE_MULTIPLIER = process.env.SIGNIFICANT_VOTE_MULTIPLIER || "";
  const RANDOM_SOURCE_INITIAL_FUND = process.env.RANDOM_SOURCE_INITIAL_FUND || "";

  // Validate that the mandatory variables are set
  if (
    !OWNER_ADDRESS ||
    !ENTROPY_ADDRESS ||
    !JUROR_BUYIN_FEE ||
    !CLAIM_FEE ||
    !VOTING_DURATION ||
    !MAX_BETTING_DURATION ||
    !MIN_BETTING_AMOUNT ||
    !SIGNIFICANT_VOTE_MULTIPLIER ||
    !RANDOM_SOURCE_INITIAL_FUND
  ) {
    console.error("❌ One or more required environment variables are missing. Please check your .env file.");
    console.error("Required variables:");
    console.error("  OWNER_ADDRESS");
    console.error(`  ${ENTROPY_ENV_VAR}`);
    console.error("  JUROR_BUYIN_FEE");
    console.error("  CLAIM_FEE");
    console.error("  VOTING_DURATION");
    console.error("  MAX_BETTING_DURATION");
    console.error("  MIN_BETTING_AMOUNT");
    console.error("  SIGNIFICANT_VOTE_MULTIPLIER");
    console.error("  RANDOM_SOURCE_INITIAL_FUND");
    process.exit(1);
  }

  console.log("⛓  Deploying to network:", networkName);
  console.log("📝 Environment Variables:");
  console.log("  OWNER_ADDRESS:                     ", OWNER_ADDRESS);
  console.log(`  ${ENTROPY_ENV_VAR}:`, ENTROPY_ADDRESS);
  console.log("  JUROR_BUYIN_FEE (wei):              ", JUROR_BUYIN_FEE);
  console.log("  CLAIM_FEE (wei):                    ", CLAIM_FEE);
  console.log("  VOTING_DURATION (seconds):          ", VOTING_DURATION);
  console.log("  MAX_BETTING_DURATION (seconds):     ", MAX_BETTING_DURATION);
  console.log("  MIN_BETTING_AMOUNT (wei):           ", MIN_BETTING_AMOUNT);
  console.log("  SIGNIFICANT_VOTE_MULTIPLIER (wad):   ", SIGNIFICANT_VOTE_MULTIPLIER);
  console.log("  RANDOM_SOURCE_INITIAL_FUND (wei):    ", RANDOM_SOURCE_INITIAL_FUND);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Deploy ZkPlaceholder (implements IZkProofs)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n🚀 Deploying ZkPlaceholder...");
  const ZkPlaceholderFactory = await ethers.getContractFactory("ZkPlaceholder");
  const zkPlaceholder = await ZkPlaceholderFactory.deploy(OWNER_ADDRESS);
  await zkPlaceholder.deployed();
  const zkPlaceholderAddress = zkPlaceholder.address;
  console.log("✅ ZkPlaceholder deployed to:", zkPlaceholderAddress);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Deploy RandomNumberSource
  // ─────────────────────────────────────────────────────────────────────────────
  let randomNumberSource;
  if (!isObscureNetwork(networkName)) {
    console.log("\n🚀 Deploying RandomNumberSource...");
    const RandomNumberSourceFactory = await ethers.getContractFactory("RandomNumberSource");
    const randomNumberSource = await RandomNumberSourceFactory.deploy(
        OWNER_ADDRESS,
        ENTROPY_ADDRESS,
        { value: ethers.BigNumber.from(RANDOM_SOURCE_INITIAL_FUND) }
    );
    await randomNumberSource.deployed();
    randomNumberSourceAddress = randomNumberSource.address;
    console.log("✅ RandomNumberSource deployed to:", randomNumberSourceAddress);
  }
  else {
    randomNumberSourceAddress = zkPlaceholderAddress;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Deploy Fidora (core contract)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n🚀 Deploying Fidora...");
  const FidoraFactory = await ethers.getContractFactory("Fidora");
  const fidora = await FidoraFactory.deploy(
    OWNER_ADDRESS,
    zkPlaceholderAddress,                          // IZkProofs address
    randomNumberSourceAddress,                     // RandomNumberSource address
    ethers.BigNumber.from(JUROR_BUYIN_FEE),         // juror buy‐in fee (wad)
    ethers.BigNumber.from(CLAIM_FEE),               // claim fee (wad)
    parseInt(VOTING_DURATION, 10),                  // votingDuration (seconds)
    parseInt(MAX_BETTING_DURATION, 10),             // maxBettingDuration (seconds)
    ethers.BigNumber.from(MIN_BETTING_AMOUNT),      // minBettingAmount (wei)
    ethers.BigNumber.from(SIGNIFICANT_VOTE_MULTIPLIER), // significantVoteMultiplier (wad)
    { gasLimit: 8_000_000 }
  );
  await fidora.deployed();
  const fidoraAddress = fidora.address;
  console.log("✅ Fidora deployed to:", fidoraAddress);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Transfer Ownership of helper contracts to Fidora (optional)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n🔄 Transferring ownership of helper contracts to Fidora...");
  await (await zkPlaceholder.transferOwnership(fidoraAddress)).wait();
  if (!isObscureNetwork(networkName)) {
    await (await randomNumberSource.transferOwnership(fidoraAddress)).wait();
  }
  console.log("✅ Ownership of RandomNumberSource and ZkPlaceholder transferred to Fidora.");

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Update .env with newly deployed addresses (network‐specific keys)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n🖊️  Updating .env with deployed contract addresses...");
  const envPath = path.resolve(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");

  // Helper to replace or append a KEY=value line
  function upsertEnv(variable, value) {
    const pattern = new RegExp(`^${variable}=.*$`, "m");
    if (envContent.match(pattern)) {
      envContent = envContent.replace(pattern, `${variable}=${value}`);
    } else {
      envContent += `\n${variable}=${value}`;
    }
  }

  // Write network‐specific addresses:
  upsertEnv(`ZK_PLACEHOLDER_ADDRESS_${networkName}`, zkPlaceholderAddress);
  upsertEnv(`RANDOM_SOURCE_ADDRESS_${networkName}`, randomNumberSourceAddress);
  upsertEnv(`FIDORA_ADDRESS_${networkName}`, fidoraAddress);
  // Also persist the entropy address key we read above (so we know it for that network)
  upsertEnv(ENTROPY_ENV_VAR, ENTROPY_ADDRESS);

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated with network‐specific addresses.");

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) (Optional) Verify contracts on Etherscan
  // ─────────────────────────────────────────────────────────────────────────────
  // If you installed and configured @nomiclabs/hardhat-etherscan, you can verify:
  //
  // console.log("\n🔍 Verifying contracts on Etherscan...");
  // await verifyContract(zkPlaceholderAddress, [OWNER_ADDRESS]);
  // await verifyContract(randomNumberSourceAddress, [OWNER_ADDRESS, ENTROPY_ADDRESS]);
  // await verifyContract(
  //   fidoraAddress,
  //   [
  //     OWNER_ADDRESS,
  //     zkPlaceholderAddress,
  //     randomNumberSourceAddress,
  //     JUROR_BUYIN_FEE,
  //     CLAIM_FEE,
  //     VOTING_DURATION,
  //     MAX_BETTING_DURATION,
  //     MIN_BETTING_AMOUNT,
  //     SIGNIFICANT_VOTE_MULTIPLIER
  //   ]
  // );

  console.log("\n🎉 Deployment complete!");
}

function isObscureNetwork(networkName) {
    if (networkName == "FLOW_TESTNET") return true;
    if (networkName == "FLARE_TESTNET") return true;
    if (networkName == "ROOTSTOCK_TESTNET") return true;
    if (networkName == "LOCALHOST") return true;
    return false;
}

async function verifyContract(address, constructorArguments) {
  console.log(`⏳ Verifying contract at ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments
    });
    console.log(`✅ Verified: ${address}`);
  } catch (error) {
    console.warn(`⚠️  Verification failed for ${address}: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
