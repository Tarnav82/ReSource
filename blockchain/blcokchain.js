const hre = require("hardhat");

async function main() {
  const [admin, seller, buyer] = await hre.ethers.getSigners();

  // 🔴 REPLACE THIS WITH YOUR DEPLOYED ADDRESS
  const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const contract = await hre.ethers.getContractAt(
    "IndustrialWasteExchange",
    CONTRACT_ADDRESS
  );

  console.log("Admin:", admin.address);
  console.log("Seller:", seller.address);
  console.log("Buyer:", buyer.address);

  // 1️⃣ Admin creates a waste batch for seller
  const tx1 = await contract.createWasteBatch(
    "fly_ash",
    100,
    seller.address
  );
  await tx1.wait();
  console.log("✔ Waste batch created");

  // 2️⃣ Buyer commits to purchase
  const buyerContract = contract.connect(buyer);
  const tx2 = await buyerContract.commitToPurchase(1);
  await tx2.wait();
  console.log("✔ Buyer committed");

  // 3️⃣ Seller transfers ownership
  const sellerContract = contract.connect(seller);
  const tx3 = await sellerContract.transferWasteBatch(1);
  await tx3.wait();
  console.log("✔ Ownership transferred");

  // 4️⃣ Read final state (auditor-style)
  const batch = await contract.getWasteBatch(1);
  console.log("Final owner:", batch.currentOwner);
}

main().catch(console.error);