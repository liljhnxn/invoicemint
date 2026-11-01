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
    botchain: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life",
      chainId: 968,
      accounts: process.env.PRIVATE_KEY
        ? [
            process.env.PRIVATE_KEY.startsWith("0x")
              ? process.env.PRIVATE_KEY
              : `0x${process.env.PRIVATE_KEY}`,
          ]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      botchain: "dummy-key",
    },
    customChains: [
      {
        network: "botchain",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
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

