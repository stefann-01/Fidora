import type { HardhatUserConfig } from "hardhat/config";
require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });
import "@nomicfoundation/hardhat-toolbox-viem";
import "@solarity/hardhat-zkit";
import "@solarity/chai-zkit";
require("@nomiclabs/hardhat-ethers");

const ARBITRUM_SEPOLIA_RPC_URL_HTTPS = process.env.ARBITRUM_SEPOLIA_RPC_URL_HTTPS || "";
const FLOW_TESTNET_RPC = process.env.FLOW_TESTNET_RPC || "";
const FLARE_TESTNET_RPC = process.env.FLARE_TESTNET_RPC || "";
const ROOTSTOCK_TESTNET_RPC = process.env.ROOTSTOCK_TESTNET_RPC || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: "0.8.28",
  networks: {
    arbitrum_sepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL_HTTPS,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    flow_testnet: {
      url: FLOW_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    flare_testnet: {
      url: FLARE_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    rootstock_testnet: {
      url: ROOTSTOCK_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

const config: HardhatUserConfig = {
  solidity: "0.8.28",
};

export default config;