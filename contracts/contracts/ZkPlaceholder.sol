// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./interface/IZkProofs.sol";
import "./general/Types.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// This contract implements stuff badly that should be handled by zk
contract ZkPlaceholder is IZkProofs, Ownable {
    uint256 private constant scale = 10 ** 18;

    mapping(uint256 => mapping(address => Bet)) private bets;
    mapping(uint256 => mapping(Vote => uint256)) private betPools;
    mapping(uint256 => address[]) private jurors;
    mapping(uint256 => uint16[3]) private votes;
    mapping(uint256 => address[]) private jurorsVoted;
    mapping(uint256 => Vote) private finalVote;


    constructor(address _owner) Ownable(_owner) {

    }

    function makeBet(address user, uint256 claimId, Vote option, uint256 amount) external onlyOwner {
        bets[claimId][user] = Bet({
            vote: option,
            amount: amount
        });

        betPools[claimId][option] += amount;
    }

    function declareJury(uint256 claimId, address[] memory _jurors) external onlyOwner {
        jurors[claimId] = _jurors;
    }

    function isValidJuror(address juror, uint256 claimId) external view returns (bool) {
        address[] memory targetJurors = jurors[claimId];
        for (uint i = 0; i < targetJurors.length; i++) {
            if (targetJurors[i] == juror) return true;
        }

        return false;
    }

    function castVote(address, uint256 claimId, Vote vote) external {
        uint16[3] storage targetVotes = votes[claimId];
        targetVotes[uint(vote) - 1]++;
    }

    function getJurorsAfterVote(uint256 claimId) external view returns (address[] memory jurorsThatVoted, address[] memory jurorsNotVoted) {
        address[] memory selectedJurors = jurors[claimId];
        jurorsNotVoted = new address[](selectedJurors.length);
        jurorsThatVoted = jurorsVoted[claimId];

        uint ind = 0;
        for (uint i = 0; i < selectedJurors.length; i++) {
            for (uint j = 0; j < jurorsThatVoted.length; j++) {
                if (selectedJurors[i] == jurorsThatVoted[j]) break;
            }

            jurorsNotVoted[ind] = selectedJurors[i];
            ind++;
        }
    }

    function resetVoting(uint256 claimId) external {
        delete jurors[claimId];
        delete votes[claimId];
        delete jurorsVoted[claimId];
    }

    function getVotes(uint256 claimId) external view returns (uint16[3] memory castVotes) {
        return votes[claimId];
    }

    function declareFinalVote(uint256 claimId, Vote _finalVote) external {
        finalVote[claimId] = _finalVote;
    }

    function getTotalRewardAmount(uint256 claimId, address user) external view returns (uint256) {
        Vote decidedVote = finalVote[claimId];
        Bet memory userBet = bets[claimId][user];
        uint256 winningPool = betPools[claimId][decidedVote];
        uint256 losingPool = betPools[claimId][Vote(3 - uint(decidedVote))];
 
        if (decidedVote == Vote.Undecided || decidedVote == Vote.Unprovable) {
            return userBet.amount;
        }

        if (userBet.vote == decidedVote) {
            return userBet.amount + (((userBet.amount * scale) / winningPool) * losingPool) / scale;
        }

        return 0;
    }
}
