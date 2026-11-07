require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load .env.local if present, else fallback to .env
if (fs.existsSync(path.resolve(__dirname, ".env.local"))) {
  dotenv.config({ path: path.resolve(__dirname, ".env.local") });
} else {
  dotenv.config();
}

const privateKey = process.env.PRIVATE_KEY
  ? process.env.PRIVATE_KEY.startsWith("0x")
    ? process.env.PRIVATE_KEY
    : `0x${process.env.PRIVATE_KEY}`
  : undefined;

const accounts = privateKey ? [privateKey] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "dummy-key",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
