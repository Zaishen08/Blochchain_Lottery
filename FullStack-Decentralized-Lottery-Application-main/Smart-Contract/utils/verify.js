const { run } = require("hardhat")
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("Already verified")) {
            console.log("Already verified!")
        } else {
            console.log("not verify", e)
        }
    }
}

module.exports = {
    verify,
}