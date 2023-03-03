// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Token is ERC20{

uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    bytes32 private rootHash;

    mapping(address => bool) claimed;
    constructor(string memory name_, string memory symbol_)ERC20(name_, symbol_){
        _name = name_;
        _symbol = symbol_;
        rootHash = 0xca4f683386ca4456d3806fcc587d4728ee9d62b4e7724209a9491f3187049a02;
    }



    function claimAirdrop( bytes32[] memory proof, uint _amount) external {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, _amount))));
        require(MerkleProof.verify(proof, rootHash, leaf), "Invalid proof");
        require(claimed[msg.sender]==false, "already claimed");
        claimed[msg.sender] = true;
        _mint(msg.sender, _amount * (10**decimals()));
    }





}