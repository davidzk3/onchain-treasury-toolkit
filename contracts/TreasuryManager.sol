// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error NotOwner();
error NotPendingOwner();
error ZeroAddress();
error InsufficientBalance();
error TokenTransferFailed();

contract TreasuryManager {
    address public owner;
    address public pendingOwner;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event TokenWithdraw(address indexed token, address indexed to, uint256 amount);

    event OwnershipTransferStarted(address indexed oldOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    function withdrawETH(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (address(this).balance < amount) revert InsufficientBalance();

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");

        emit Withdraw(to, amount);
    }

    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        bool ok = IERC20(token).transfer(to, amount);
        if (!ok) revert TokenTransferFailed();

        emit TokenWithdraw(token, to, amount);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
