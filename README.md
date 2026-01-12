```md
# Onchain Treasury Toolkit

A production-style on-chain treasury manager plus off-chain ops toolkit demonstrating secure ETH and ERC20 custody, Safe-friendly ownership, and operational monitoring workflows.

This repository is intentionally designed to show real-world treasury engineering patterns rather than toy examples.

---

## What this repo demonstrates

### On-chain (Solidity)
TreasuryManager.sol
- Accepts ETH via receive()
- Owner-gated withdrawals for ETH and ERC20 tokens
- Safe-friendly two-step ownership transfer
  - transferOwnership(newOwner) proposes ownership
  - acceptOwnership() confirms ownership
- Prevents accidental ownership loss
- Custom Solidity errors for gas efficiency
- Explicit events for deposits, withdrawals, and ownership changes

### Off-chain Ops (TypeScript)
scripts/
- treasuryReport.ts
  - Reads ETH and ERC20 balances for a treasury address
- opsCheck.ts
  - Applies minimum balance thresholds
  - Emits human-readable operational actions such as top up, rebalance, unwind
- Environment-driven configuration via .env for production realism

---

## Project structure

contracts/
  TreasuryManager.sol
  MockERC20.sol

test/
  TreasuryManager.ts

scripts/
  treasuryReport.ts
  opsCheck.ts
  config.ts

.env.example
hardhat.config.ts
tsconfig.json

---

## Quickstart

Install dependencies
  npm install

Compile contracts
  npx hardhat compile

Run test suite
  npx hardhat test

The test suite covers:
- ETH deposits and withdrawals
- ERC20 treasury withdrawals
- Owner-only enforcement
- Safe-friendly two-step ownership transfer

---

## Ops scripts

Environment setup  
Create a local .env file and do not commit it.

Example .env contents
  TREASURY_ADDRESS=0x0000000000000000000000000000000000000001
  MIN_ETH=0.5

Run the ops check
  npx hardhat run scripts/opsCheck.ts

Example output
  === Treasury Ops Check ===
  Treasury: 0x...
  ETH: 0.0 | MIN: 0.5
  ACTION: Treasury ETH below threshold
  Suggested action: top up ETH from ops wallet or unwind positions

---

## Contract interface

Ownership (Safe-friendly)
- owner() returns the current owner
- pendingOwner() returns the proposed owner
- transferOwnership(address newOwner) proposes a new owner
- acceptOwnership() finalizes ownership transfer

Treasury actions
- withdrawETH(address to, uint256 amount)
- withdrawToken(address token, address to, uint256 amount)
- balance() returns ETH balance

---

## Security considerations

- All treasury actions are gated by onlyOwner
- Ownership changes use a two-step confirmation pattern
- Zero-address checks prevent misconfiguration
- ERC20 transfers validate return values
- Explicit revert reasons via custom errors

---

## Why this matters

This repository mirrors how real treasury systems are built:
- Safe-compatible ownership
- Clear separation between on-chain controls and off-chain ops
- Test-driven validation of critical flows
- Automation-ready design

It is intentionally scoped to be auditable, extensible, and operationally realistic.

---

## Future extensions
- Safe module integration
- On-chain policy modules such as recipient allowlists and spend limits
- Enforced ERC20 reserve minimums
- CI with coverage and static analysis
- Multichain treasury reporting

---

## Disclaimer
This repository is for demonstration and educational purposes only. It has not been audited and should not be used in production without proper security review.
```
