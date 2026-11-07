const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying InvoiceMint smart contract to BOT Chain...");
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Please check PRIVATE_KEY in .env.local");
  }

  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const currencySymbol = "BOT";

  console.log("Network:", hre.network.name, `(Chain ID: ${chainId})`);
  console.log("Deployer address:", deployer.address);

  const initialBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Initial balance: ${hre.ethers.formatEther(initialBalance)} ${currencySymbol}`);

  // Fetch optimal fee data to avoid overpaying
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || hre.ethers.parseUnits("20", "gwei");
  console.log(`Current Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} Gwei`);

  const InvoiceMint = await hre.ethers.getContractFactory("InvoiceMint");

  // Deploy with exact optimized gas settings (no inflated priority fees)
  const invoiceMint = await InvoiceMint.deploy({
    gasPrice: gasPrice,
  });

  console.log("Transaction submitted, awaiting confirmation...");
  const deploymentTx = invoiceMint.deploymentTransaction();
  if (deploymentTx) {
    console.log("Transaction Hash:", deploymentTx.hash);
  }

  await invoiceMint.waitForDeployment();
  const contractAddress = await invoiceMint.getAddress();

  // Calculate actual gas used
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const gasSpent = initialBalance - finalBalance;

  console.log("----------------------------------------------------");
  console.log("✅ InvoiceMint deployed successfully at:", contractAddress);
  console.log(`Gas spent on deployment: ${hre.ethers.formatEther(gasSpent)} ${currencySymbol}`);
  console.log(`Remaining balance: ${hre.ethers.formatEther(finalBalance)} ${currencySymbol}`);
  console.log("----------------------------------------------------");

  // Save deployment info to frontend config
  const deploymentDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
    txHash: deploymentTx ? deploymentTx.hash : undefined,
  };

  fs.writeFileSync(
    path.join(deploymentDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Saved deployment configuration to src/config/deployment.json");

  // Update .env.local if present
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

    envContent = envContent.replace(
      /NEXT_PUBLIC_CHAIN_ID=.*/,
      `NEXT_PUBLIC_CHAIN_ID=677`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_RPC_URL=.*/,
      `NEXT_PUBLIC_RPC_URL=https://rpc.botchain.ai`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_EXPLORER_URL=.*/,
      `NEXT_PUBLIC_EXPLORER_URL=https://scan.botchain.ai`
    );

    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env.local with new contract address and chain configuration");
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
