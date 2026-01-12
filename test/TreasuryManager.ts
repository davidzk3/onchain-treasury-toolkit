import { expect } from "chai";
import { ethers } from "hardhat";

describe("TreasuryManager", function () {
  it("sets deployer as owner", async function () {
    const [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    expect(await treasury.owner()).to.equal(owner.address);
  });

  it("accepts ETH deposits and tracks balance", async function () {
    const [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0"),
    });

    expect(await treasury.balance()).to.equal(ethers.utils.parseEther("1.0"));
  });

  it("only owner can withdraw ETH", async function () {
    const [owner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0"),
    });

    await expect(
      treasury.connect(attacker).withdrawETH(attacker.address, ethers.utils.parseEther("0.1"))
    ).to.be.reverted;
  });

  it("owner can withdraw ETH to recipient", async function () {
    const [owner, recipient] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    await owner.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0"),
    });

    const before = await ethers.provider.getBalance(recipient.address);

    await treasury.withdrawETH(recipient.address, ethers.utils.parseEther("0.4"));

    const after = await ethers.provider.getBalance(recipient.address);
    expect(after.sub(before)).to.equal(ethers.utils.parseEther("0.4"));
  });

  it("owner can withdraw ERC20 tokens from treasury", async function () {
    const [owner, recipient] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Mock USD", "mUSD");
    await token.deployed();

    const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
    const treasury = await TreasuryManager.deploy();
    await treasury.deployed();

    // Mint tokens to owner, then transfer into treasury (simulate deposit)
    await token.mint(owner.address, ethers.utils.parseUnits("1000", 18));
    await token.transfer(treasury.address, ethers.utils.parseUnits("250", 18));

    // Withdraw from treasury to recipient
    await treasury.withdrawToken(token.address, recipient.address, ethers.utils.parseUnits("40", 18));

    const recipientBal = await token.balanceOf(recipient.address);
    expect(recipientBal).to.equal(ethers.utils.parseUnits("40", 18));
  });

  it("non-owner cannot withdraw ERC20 tokens", async function () {
    const [owner, attacker] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Mock USD", "mUSD");
    await token.deployed();

    const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
    const treasury = await TreasuryManager.deploy();
    await treasury.deployed();

    await token.mint(owner.address, ethers.utils.parseUnits("100", 18));
    await token.transfer(treasury.address, ethers.utils.parseUnits("10", 18));

    await expect(
      treasury.connect(attacker).withdrawToken(token.address, attacker.address, ethers.utils.parseUnits("1", 18))
    ).to.be.reverted;
  });

  it("supports two-step ownership transfer (Safe-friendly)", async function () {
    const [owner, newOwner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    // Owner proposes a new owner (e.g. a Safe)
    await treasury.transferOwnership(newOwner.address);
    expect(await treasury.pendingOwner()).to.equal(newOwner.address);

    // New owner accepts ownership
    await treasury.connect(newOwner).acceptOwnership();
    expect(await treasury.owner()).to.equal(newOwner.address);
    expect(await treasury.pendingOwner()).to.equal(ethers.constants.AddressZero);
  });

  it("prevents non-pending owner from accepting ownership", async function () {
    const [owner, newOwner, attacker] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TreasuryManager");
    const treasury = await Factory.deploy();
    await treasury.deployed();

    // Owner proposes new owner
    await treasury.transferOwnership(newOwner.address);

    // Attacker cannot accept ownership
    await expect(treasury.connect(attacker).acceptOwnership()).to.be.reverted;
  });
});
