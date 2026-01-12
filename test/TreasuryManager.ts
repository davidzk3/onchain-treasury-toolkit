import { expect } from "chai";
import { ethers } from "hardhat";

describe("TreasuryManager", function () {
  it("sets deployer as owner", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();

    expect(await treasury.owner()).to.equal(owner.address);
  });

  it("accepts ETH deposits", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await treasury.balance()).to.equal(
      ethers.utils.parseEther("1")
    );
  });

  it("only owner can withdraw ETH", async function () {
    const [owner, attacker] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1"),
    });

    await expect(
      treasury
        .connect(attacker)
        .withdrawETH(attacker.address, ethers.utils.parseEther("0.1"))
    ).to.be.reverted;
  });

  it("owner can withdraw ETH", async function () {
    const [owner, recipient] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1"),
    });

    const before = await ethers.provider.getBalance(recipient.address);

    await treasury.withdrawETH(
      recipient.address,
      ethers.utils.parseEther("0.4")
    );

    const after = await ethers.provider.getBalance(recipient.address);
    expect(after.sub(before)).to.equal(
      ethers.utils.parseEther("0.4")
    );
  });
});
