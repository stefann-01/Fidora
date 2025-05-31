// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../general/Types.sol";

interface IZkProofs {
    /**
    *@dev makeBet is called when a user makes a bet on the Fidora contract.
    * Internally, zk contract needs to keep count per claim of
    a) Who bet on which outcome and with how much eth
    b) How much eth total is in both "yes" and "no" pools.
    * If bet is already made, this call overwrites it. - WILL THIS WORK?
    */
    function makeBet(address user, uint256 claimId, Vote option, uint256 amount) external;

    /**
    *@dev declareJury is called by the backend after the betting phase
    * is over and jurors selected.
    *@param jurors Randomly selected jurors from the pool of jurors
    */
    function declareJury(uint256 claimId, address[] memory jurors) external;

    /**
    @dev Returns true if the specified juror is selected for the specified claim. 
    Returns otherwise, or if the "juror" is not juror at all.
    */
    function isValidJuror(address juror, uint256 claimId) external returns (bool);

    /**
    @dev Casts a vote.
    * Fidora contract already checked if the juror is valid.
    * Initiated by the user (juror).
    */
    function castVote(address juror, uint256 claimId, Vote vote) external;

    /**
    *@dev Called by the Fidora contract after the voting is done.
    * If the list is not empty, the voting will be restarted.
    *@return jurorsVoted list of jurors who cast a vote
    *@return jurorsNotVoted list of jurors who didn't cast a vote
    */
    function getJurorsAfterVote(uint256 claimId) external returns (address[] memory jurorsVoted, address[] memory jurorsNotVoted);

    /**
    *@dev Called by the Fidora contract after successful voting to determine the outcome.
    *@return votes is filled with votes[Agree], votes[Disagree], votes[Unprovable]
    */
    function getVotes(uint256 claimId) external returns (uint16[3] memory votes);

    /**
    *@dev Resets voting state
    */
    function resetVoting(uint256 claimId) external;

    /**
    *@dev Called by the Fidora contract after the final vote has been decided.
    */
    function declareFinalVote(uint256 claimId, Vote finalVote) external;

    /**
    @dev Called by the Fidora contract after the vote has been finalized
    when determening how much rewards to send to user.
    * If the final vote is Undecided or Unprovable, rewards are equal to his bet amount.
    * If the final vote is Agree or Disagree, return:
    *   a) 0 if the user voted for the losing choice
    *   b) betAmount + (betAmount / winningPool) * losingPool if the user voted for the winning choice
    */
    function getTotalRewardAmount(uint256 claimId, address user) external returns (uint256);
}