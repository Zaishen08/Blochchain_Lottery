# Lottery-Application
Full Stack DApp (Decentralized Application) using solidity language, hardhat, and next.js framework for frontend. 
Connect wallet, Winner is picked automatically after 30 seconds if all conditions are true.


### How To Usage
1. You can send 0.001 ETH to contract and when the bet is still open
2. The manager can then start for requesting randomWords from VRF for choosing the winner
3. then the manager can do chooseWinner to pick the winner.
4. when the manager want to start next bid round, he can use startNewBid function to reset the settings.


## How to Setup in your local enviroment :-

### Frontend 
    1. cd frontend
    2. npm install
    3. npm run dev


### Blockchain
    1. cd Smart-Contract
    2. npm install
    3. setup env
    4. npx hardhat test
    5. npx hardhat deploy --network localhost

## Technologies/Frameworks Used :-

### Frontend
1. Next.js
2. Tailwind CSS (For styling)
3. Moralis (For web3 integration)
4. Web3uikit (For wallet connect button and notifications)
5. Ethers (For converting value into ethers)
6. Fleek IPFS (For deploying frontend)

## Blockchain
1. Solidity (To develop Smart Contract)
2. Javascript (For deploying scripts)
3. Chai (For testing Smart Contract)
4. Chain-Link (For getting random number and choosing winner after specific time)
5. Hardhat
