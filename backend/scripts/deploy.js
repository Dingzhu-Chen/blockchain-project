// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    // deploy hasher
    const Hasher = await hre.ethers.getContractFactory("Hasher");
    const hasher = await Hasher.deploy();
    await hasher.waitForDeployment();
    console.log("Hasher deployed at:", await hasher.getAddress());
    const hasherAddress = await hasher.getAddress();

    // deploy verifier
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment(); // 修改此处
    console.log("Verifier deployed at:", await verifier.getAddress());
    const verifierAddress = await verifier.getAddress();

    // deploy tornado
    const Tornado = await hre.ethers.getContractFactory("Tornado");
    const tornado = await Tornado.deploy(hasherAddress, verifierAddress);
    await tornado.waitForDeployment();
    console.log("Tornado deployed at:", await tornado.getAddress());
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});