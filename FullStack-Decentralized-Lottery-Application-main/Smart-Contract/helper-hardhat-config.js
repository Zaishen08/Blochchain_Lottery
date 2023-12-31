const { ethers } = require("hardhat");

const networkConfig = {
  4: {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", //https://docs.chain.link/vrf/v2/subscription/supported-networks
    entranceFee: ethers.utils.parseEther("0.001"),
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "8114",
    callbackGasLimit: "500000",
    interval: '30'
},
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.001"),
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000",
    interval: '30'

  },
};

const developmentChains = ["hardhat", "localhost"];
module.exports = { networkConfig, developmentChains };
