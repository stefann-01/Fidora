import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@solarity/hardhat-zkit";
import "@solarity/chai-zkit";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
};

export default config;