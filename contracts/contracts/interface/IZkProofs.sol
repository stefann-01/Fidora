// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;



interface IZkProofs {
    /**
    *@dev Internally, zk contract needs to keep count per claim of
    a) Who bet on which outcome and with how much eth
    b) How much eth total is in both "yes" and "no" pools.
    * Called by the user.
    * If bet is already made, this call overwrites it.
    */
    function makeBet(address user, uint256 claimId, bool side, uint256 amount) external payable;
    
    /**
    *@dev Return the bet amount to the user.
    * Called by the user.
    */
    function cancelBet(address user, uint256 claimId) external;

    /**
    *@dev Returns the amount a user bet on an outcome for a claim.
    * Called by the Fidora contract after the voting is finished to 
    calculate the amount owed to a betting user if he won.
    * Returns the amount if everything OK, otherwise 0.
    */
    function getBetAmount(uint256 claimId, address user, bool vote) external returns (uint256);

    /**
    @dev
    */
    // function getBetPools

    /**
    *@dev Randomly pick specified number of jurors for the claim.
    * Called by Fidora contract when the betting phase is over.
    */
    function pickJurors(uint256 claimId, uint256 numberOfJurors, uint256 randomNumber) external;

    /**
    @dev If a valid juror for the claim, casts a vote.
    * Called by the user (juror).
    */
    function castVote(uint256 juror, uint256 claimId, bool vote) external;
}