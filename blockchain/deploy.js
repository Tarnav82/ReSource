const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const IndustrialWasteExchange = await hre.ethers.getContractFactory(
    "IndustrialWasteExchange"
  );

  const contract = await IndustrialWasteExchange.deploy();

  await contract.waitForDeployment();

  console.log("IndustrialWasteExchange deployed to:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });