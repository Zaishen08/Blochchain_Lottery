const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
} else {
  describe("BlockchainLottery", () => {
    let blockchainLottery,
      vrfCoordinatorV2Mock,
      entranceFee,
      interval,
      deployer;
    const chainId = network.config.chainId;

    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      blockchainLottery = await ethers.getContract(
        "BlockchainLottery",
        deployer
      );
    });

    describe("selectWinnerAndTransferFunds", function () {
      it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
        console.log("Setting up test...");
        const startingTimeStamp = await blockchainLottery.getLastTimeStamp();
        const accounts = await ethers.getSigners();

        console.log("Setting up Listener...");
        await new Promise(async (resolve, reject) => {


          blockchainLottery.once("WinnerPicked", async () => {
            console.log("WinnerPicked event fired!");
            try {
              // add our asserts here
              const recentWinner = await blockchainLottery.getRecentWinner();
              const lotteryState = await blockchainLottery.getLotteryState();
              const winnerEndingBalance = await accounts[0].getBalance();
              const endingTimeStamp = await blockchainLottery.getLastTimeStamp();

              await expect(blockchainLottery.getPlayer(0)).to.be.reverted;
              assert.equal(recentWinner.toString(), accounts[0].address);
              assert.equal(lotteryState, 0);
              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance.add(entranceFee).toString()
              );
              assert(endingTimeStamp > startingTimeStamp);
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          // Then entering the lottery 
          console.log("Entering blockchainLottery...");
          const tx = await blockchainLottery.enterLottery({ value: entranceFee });
          await tx.wait(1);
          console.log("Time to wait...");
          const winnerStartingBalance = await accounts[0].getBalance();

          // and this code WONT complete until our listener has finished listening!
        });
      });
    });
  });
}
