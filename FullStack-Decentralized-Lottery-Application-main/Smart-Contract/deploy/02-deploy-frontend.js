const fs = require("fs");
const { ethers, network } = require("hardhat");
const FRONTEND_ADDRESSES_FILE = "../frontend/constants/contractAddresses.json";
const FRONTEND_ABI_FILE = "../frontend/constants/abi.json";

const updateContractAddress = async () => {
  const chainId = network.config.chainId.toString();
  const BlockchainLottery = await ethers.getContract("BlockchainLottery");
  const currentAddress = JSON.parse(
    fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf-8")
  );
  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(BlockchainLottery.address)) {
    }
  } else {
    currentAddress[chainId] = [BlockchainLottery.address];
  }
  fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddress));
};

const updateAbi = async () => {
  const BlockchainLottery = await ethers.getContract("BlockchainLottery");
  fs.writeFileSync(
    FRONTEND_ABI_FILE,
    BlockchainLottery.interface.format(ethers.utils.FormatTypes.json)
  );
};

module.exports = async () => {
  if (process.env.UPDATE_FRONTEND) {
    updateContractAddress();
    updateAbi();
    console.log("updating frontend......");
  }
};

module.exports.tags = ["all", "frontend"];
