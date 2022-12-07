// SPDX-License-Identifier: Unlicensed

pragma solidity >=0.7.0;

contract paypal {
    event transactions(address indexed from, address to, uint amount, string symbol);
    event recipients(address indexed recipientOf, address recipient, string recipientName);

    function _transfer(address payable _to, string memory symbol) public payable {
        _to.transfer(msg.value);
        emit transactions(msg.sender, _to, msg.value, symbol);
    }

    function saveTx(address from, address to, uint amount, string memory symbol) public {
        emit transactions(from, to, amount, symbol);
    }

    function addRecipient(address recipient, string memory name) public {
        emit recipients(msg.sender, recipient, name);
    }
}

//0xf49ea756C90147d17F64F4068134dBA71F7381E7 - goerli 
//0x7899Fd3DF04000Fa6CdD6D36eB5904637A38bb40 - sepolia 

//0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 - UniSwap address
//0x326C977E6efc84E512bB9C30f76E30c160eD06FB - ChainLink address
