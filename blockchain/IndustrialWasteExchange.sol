// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract IndustrialWasteExchange is Ownable, ReentrancyGuard {

    enum WasteStatus {
        CREATED,
        COMMITTED,
        TRANSFERRED
    }

    struct WasteBatch {
        uint256 batchId;
        string category;
        uint256 quantity;
        address currentOwner;
        address committedBuyer;
        WasteStatus status;
        uint256 createdAt;
    }

    uint256 public nextBatchId;

    mapping(uint256 => WasteBatch) public wasteBatches;

    event WasteBatchCreated(
        uint256 indexed batchId,
        address indexed seller,
        string category,
        uint256 quantity
    );

    event PurchaseCommitted(
        uint256 indexed batchId,
        address indexed buyer
    );

    event WasteBatchTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to
    );

   constructor() Ownable(msg.sender) {
    nextBatchId = 1;
}


    function createWasteBatch(
        string calldata category,
        uint256 quantity,
        address seller
    ) external onlyOwner returns (uint256) {

        require(quantity > 0, "Quantity must be > 0");
        require(seller != address(0), "Invalid seller address");

        uint256 batchId = nextBatchId;

        wasteBatches[batchId] = WasteBatch({
            batchId: batchId,
            category: category,
            quantity: quantity,
            currentOwner: seller,
            committedBuyer: address(0),
            status: WasteStatus.CREATED,
            createdAt: block.timestamp
        });

        nextBatchId++;

        emit WasteBatchCreated(batchId, seller, category, quantity);

        return batchId;
    }

    function commitToPurchase(uint256 batchId)
        external
        nonReentrant
    {
        WasteBatch storage batch = wasteBatches[batchId];

        require(batch.batchId != 0, "Batch does not exist");
        require(batch.status == WasteStatus.CREATED, "Not available");
        require(msg.sender != batch.currentOwner, "Owner cannot buy");

        batch.committedBuyer = msg.sender;
        batch.status = WasteStatus.COMMITTED;

        emit PurchaseCommitted(batchId, msg.sender);
    }

    function transferWasteBatch(uint256 batchId)
        external
        nonReentrant
    {
        WasteBatch storage batch = wasteBatches[batchId];

        require(batch.batchId != 0, "Batch does not exist");
        require(batch.status == WasteStatus.COMMITTED, "Buyer not committed");
        require(msg.sender == batch.currentOwner, "Not batch owner");

        address previousOwner = batch.currentOwner;
        address buyer = batch.committedBuyer;

        require(buyer != address(0), "No buyer committed");

        batch.currentOwner = buyer;
        batch.status = WasteStatus.TRANSFERRED;

        emit WasteBatchTransferred(batchId, previousOwner, buyer);
    }

    function getWasteBatch(uint256 batchId)
        external
        view
        returns (WasteBatch memory)
    {
        require(wasteBatches[batchId].batchId != 0, "Batch not found");
        return wasteBatches[batchId];
    }
}