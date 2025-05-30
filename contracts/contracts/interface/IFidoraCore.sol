// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IFidoraCore {
    // Maybe tweet link as param?
    function makeClaim() external payable;

    function makeBet(uint256 claimId, uint256 amount, bool option) external;

    function signupForJury() external payable;
    function leaveJury() external;
    function castVote(uint256 claimId, bool vote) external;

    // Called by user after claim is finalized to get their portion of the losing pool
    function getMyRewards(uint256 claimId) external;
}