// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const myToken = await MyToken.deploy();
    await myToken.deployed();
    const nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();
    const { chainId } = hre.config.networks[hre.network.name];
    const myTokenData = {
        address: myToken.address,
        chainId,
        abi: JSON.parse(myToken.interface.format('json'))
    };
    const nftMarketplaceData = {
        address: nftMarketplace.address,
        chainId,
        abi: JSON.parse(nftMarketplace.interface.format('json'))
    };
    fs.writeFileSync("src/abi/NFTMarketplace.json", JSON.stringify(nftMarketplaceData));
    fs.writeFileSync("src/abi/MyToken.json", JSON.stringify(myTokenData));
    console.log("NFT Marketplace deployed to:", nftMarketplace.address);
    console.log("MyToken deployed to:", myToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
