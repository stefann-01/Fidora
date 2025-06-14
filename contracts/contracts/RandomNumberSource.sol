// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IEntropyConsumer } from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import { IEntropy } from "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RandomNumberSource is IEntropyConsumer, Ownable {
    IEntropy private entropy;
    uint256 private currentSequenceNumber;
    uint256 private currentRandomNumber;

    // Needs to be created with some msg.value to cover the initial request
    constructor(address _owner, address _entropyAddress) payable Ownable(_owner) {
        entropy = IEntropy(_entropyAddress);

        bytes32 myRandomNumber = keccak256(abi.encodePacked(block.timestamp, address(this)));
        currentRandomNumber = uint256(myRandomNumber);
        requestRandomNumber(myRandomNumber);
    }

    // @param userRandomNumber The random number generated by the user.
    function requestRandomNumber(bytes32 userRandomNumber) onlyOwner public payable {
        // Get the default provider and the fee for the request
        address entropyProvider = entropy.getDefaultProvider();
        uint256 fee = entropy.getFee(entropyProvider);
    
        // Request the random number with the callback
        uint64 sequenceNumber = entropy.requestWithCallback{ value: fee }(
            entropyProvider,
            userRandomNumber
        );

        currentSequenceNumber = sequenceNumber;
    }
    
    // @param sequenceNumber The sequence number of the request.
    // @param provider The address of the provider that generated the random number. If your app uses multiple providers, you can use this argument to distinguish which one is calling the app back.
    // @param randomNumber The generated random number.
    // This method is called by the entropy contract when a random number is generated.
    // This method **must** be implemented on the same contract that requested the random number.
    // This method should **never** return an error -- if it returns an error, then the keeper will not be able to invoke the callback.
    // If you are having problems receiving the callback, the most likely cause is that the callback is erroring.
    // See the callback debugging guide here to identify the error https://docs.pyth.network/entropy/debug-callback-failures
    function entropyCallback(
        uint64 sequenceNumber,
        address,
        bytes32 randomNumber
    ) internal override {
        if (sequenceNumber != currentSequenceNumber) {
            // Do something
        }
        currentSequenceNumber = 0;
        currentRandomNumber = uint256(randomNumber);
    }
    
    // This method is required by the IEntropyConsumer interface.
    // It returns the address of the entropy contract which will call the callback.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function consumeRandomUint256() external onlyOwner returns (uint256) { 
        uint256 randomNumber = currentRandomNumber;

        bytes32 seed = keccak256(abi.encodePacked(block.timestamp, address(this)));
        requestRandomNumber(seed);

        return uint256(keccak256(abi.encodePacked(block.timestamp, tx.origin, randomNumber)));
    }
}