// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../general/Types.sol";

interface IFidoraCore {
    // __________________ ** FRONTENT ** ___________________________________________________________
    /**
    @param claimId Tweet id from the tweet URL is the claimId
    */
    function makeClaim(uint256 claimId, uint256 bettingDuration) external payable;

    function makeBet(uint256 claimId, Vote option) external payable;

    function signupForJury() external payable;
    function leaveJury() external;
    function castVote(uint256 claimId, Vote vote) external;

    // Called by user after claim is finalized to get their portion of the losing pool
    function getMyRewards(uint256 claimId) external returns (uint256);

    // __________________ ** BACKEND ** ___________________________________________________________
    // initiateVoting selects the jury randomly and passes it to zkontract
    function initiateVoting(uint256 claimId) external;

    // tryResolveClaim checks if all jurors voted:
    // If not, restart the vote
    // If yes, reward the jurors
    // Called every time voting is ended until it succeeds
    function tryResolveClaim(uint256 claimId) external returns (bool);
}