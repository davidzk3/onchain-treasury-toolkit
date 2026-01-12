// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotOwner();
error ZeroAddress();
error InsufficientBalance();

contract TreasuryManager {
    address public owner;

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

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

    function setOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnerUpdated(owner, newOwner);
        owner = newOwner;
    }

    function withdrawETH(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (address(this).balance < amount) revert InsufficientBalance();

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");

        emit Withdraw(to, amount);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }
}
