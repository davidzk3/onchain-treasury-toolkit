import { ethers } from "hardhat";

const TREASURY_ADDRESS = "REPLACE_AFTER_DEPLOY";

const TOKENS = [
  {
    symbol: "USDC",
    address: "0x0000000000000000000000000000000000000000", // placeholder
    decimals: 6,
  },
];

async function main() {
  const provider = ethers.provider;

  console.log("=== Treasury Report ===");

  // ETH balance
  const ethBalance = await provider.getBalance(TREASURY_ADDRESS);
  console.log(`ETH balance: ${ethers.utils.formatEther(ethBalance)}`);

  // ERC20 balances
  for (const token of TOKENS) {
    const erc20 = await ethers.getContractAt("IERC20", token.address);
    const bal = await erc20.balanceOf(TREASURY_ADDRESS);

    console.log(
      `${token.symbol} balance: ${ethers.utils.formatUnits(bal, token.decimals)}`
    );
  }

  console.log("=======================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
