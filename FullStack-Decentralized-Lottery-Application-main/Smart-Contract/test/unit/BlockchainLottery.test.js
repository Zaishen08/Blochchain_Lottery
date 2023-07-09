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
      vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      entranceFee = await blockchainLottery.getEntranceFee();
      interval = await blockchainLottery.getInterval();
    });

    // Checks for the values are assigned correctly in constructor;
    describe("constructor", () => {
      it("Check lottery state", async () => {
        const lotteryState = await blockchainLottery.getLotteryState();
        assert.equal(lotteryState.toString(), "0");
      });
      it("Check lottery interval", async () => {
        assert.equal(interval, networkConfig[chainId]["interval"]);
      });
    });

    describe("enterLottery", () => {
      it("Check if it reverts successfully if the amount is less then the entrance fee.", async () => {
        await expect(blockchainLottery.enterLottery()).to.be.revertedWith(
          "Lottery__NotEnoughEthEntered"
        );
      });

      it("push the players address if they enter lottery with entrance fee", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        const playerFromContract = await blockchainLottery.getPlayer(0);
        assert.equal(playerFromContract, deployer);
      });

      it("emits the event when entering lottery", async () => {
        await expect(
          blockchainLottery.enterLottery({ value: entranceFee })
        ).to.emit(blockchainLottery, "lotteryEnter");
      });

      it("dosen't allow the lottery to enter when in calculating state", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        // await network.provider.request({method: "evm_mine", params: []})
        await blockchainLottery.drawNumber([]);
        await expect(
          blockchainLottery.enterLottery({ value: entranceFee })
        ).to.be.revertedWith("Lottery__NotOpen");
      });
    });

    describe("checkUpKeep", () => {
      it("return false if there is no users who have paid.", async () => {
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        const { upkeepNeeded } =
          await blockchainLottery.callStatic.checkUpkeep([]);
        assert(!upkeepNeeded);
      });

      it("returns false if raffle is not open", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        await blockchainLottery.drawNumber([]);
        const lotteryState = await blockchainLottery.getLotteryState();
        const { upkeepNeeded } =
          await blockchainLottery.callStatic.checkUpkeep([]);
        assert.equal(lotteryState.toString(), "1");
        assert.equal(upkeepNeeded, false);
      });

      it("returns false if enough time has not passed", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });

        // await network.provider.send("evm_increaseTime", [
        //   interval.toNumber() - 1,
        // ]);
        await network.provider.send("evm_mine", []);
        const { upkeepNeeded } =
          await blockchainLottery.callStatic.checkUpkeep("0x");
        assert(!upkeepNeeded);
      });

      it("returns true if interval and all necessary things are true and has passed", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });

        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        const { upkeepNeeded } =
          await blockchainLottery.callStatic.checkUpkeep("0x");
        assert(upkeepNeeded);
      });
    });

    describe("drawNumber", () => {
      it("It only runs if checkupkeep function returns true", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        const tx = await blockchainLottery.drawNumber([]);
        assert(tx);
      });
      it("revert if the checkupkeep is false", async () => {
        await expect(blockchainLottery.drawNumber([])).to.be.revertedWith(
          "Lottery__UpKeepNotNeeded"
        );
      });

      it("updates the lottery state and calls the drawNumber", async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        const txResponse = await blockchainLottery.drawNumber([]);
        const txReceipt = await txResponse.wait(1);
        const requestId = txReceipt.events[1].args.requestId;
        const lotteryState = await blockchainLottery.getLotteryState();
        assert(requestId.toNumber() > 0);
        assert(lotteryState.toString() == "1");
      });
    });

    describe("selectWinnerAndTransferFunds", () => {
      beforeEach(async () => {
        await blockchainLottery.enterLottery({ value: entranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
      });

      it("Should be called only after drawNumber", async () => {
        await expect(
          vrfCoordinatorV2Mock.selectWinnerAndTransferFunds(
            0,
            blockchainLottery.address
          )
        ).to.be.revertedWith("nonexistent request");
        await expect(
          vrfCoordinatorV2Mock.selectWinnerAndTransferFunds(
            1,
            blockchainLottery.address
          )
        ).to.be.revertedWith("nonexistent request");
      });

      it("picks a winner, resets the lottery, and sends money", async () => {
        const extraUsers = 3;
        const startingUser = 1;
        const accounts = await ethers.getSigners();
        for (let i = startingUser; i < startingUser + extraUsers; i++) {
          const accountConnectedUsers = await blockchainLottery.connect(
            accounts[i]
          );
          await accountConnectedUsers.enterLottery({ value: entranceFee });
        }
        const startingTimeStamp = await blockchainLottery.getLastTimeStamp();

        await new Promise(async (resolve, reject) => {
          blockchainLottery.once("winnerPicked", async () => {
            resolve();
            try {
              console.log("This is account 1", accounts[0].address);
              console.log("This is account 1", accounts[1].address);
              console.log("This is account 2", accounts[2].address);
              console.log("This is account 3", accounts[3].address);
              const recentWinner = await blockchainLottery.getRecentWinner();
              console.log(recentWinner);
              const lotteryState = await blockchainLottery.getLotteryState();
              const endingTimeStamp =
                await blockchainLottery.getLastTimeStamp();
              const numPlayers =
                await blockchainLottery.getNumbersOfPlayers();
              const winnerEndingBalance = await accounts[1].getBalance();

              assert.equal(numPlayers.toString(), "0");
              assert.equal(lotteryState.toString(), "0");
              assert(endingTimeStamp > startingTimeStamp);
              assert.equal(
                winnerEndingBalance.toString(),
                winnerStartingBalance.add(
                  entranceFee.mul(extraUsers).add(entranceFee)
                )
              );
            } catch (error) {
              reject(error);
            }
          });

          const tx = await blockchainLottery.drawNumber([]);
          const txReceipt = await tx.wait(1);
          const winnerStartingBalance = await accounts[1].getBalance();
          await vrfCoordinatorV2Mock.selectWinnerAndTransferFunds(
            txReceipt.events[1].args.requestId,
            blockchainLottery.address
          );
        });
      });
    });
  });
}
