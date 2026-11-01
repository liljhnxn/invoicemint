const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying InvoiceMint smart contract...");
  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deployer address:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH/BHR");
  }

  const InvoiceMint = await hre.ethers.getContractFactory("InvoiceMint");
  const invoiceMint = await InvoiceMint.deploy();
  await invoiceMint.waitForDeployment();

  const contractAddress = await invoiceMint.getAddress();
  console.log("✅ InvoiceMint deployed successfully at:", contractAddress);
  console.log("Network:", hre.network.name, "(Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString() + ")");

  // Write contract address and deployment info to a config file for frontend usage
  const deploymentDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Saved deployment configuration to src/config/deployment.json");

  // Also update .env.local if present
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_INVOICEMINT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_INVOICEMINT_ADDRESS=.*/,
        `NEXT_PUBLIC_INVOICEMINT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_INVOICEMINT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated NEXT_PUBLIC_INVOICEMINT_ADDRESS in .env.local");
  }
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

