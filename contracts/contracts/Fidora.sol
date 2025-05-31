// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IFidoraCore.sol";
import "./interface/IZkProofs.sol";
import "./RandomNumberSource.sol";
import "./general/Types.sol";

contract Fidora is IFidoraCore, Ownable {
    // __________________ ** TYPES ** ___________________________________________________________

    // __________________ ** PROPERTIES ** ___________________________________________________________
    uint256 private constant scale = 10 ** 18;

    uint256 private immutable significantVoteMultiplier_wad;

    uint256 private immutable votingDuration;
    uint256 private immutable jurySignupFee_wad;
    address[] private jurors;
    mapping(address => uint256) private indexOfJurors;
    mapping(address => uint8) private jurorStakesPercentagePenalty;

    uint256 private immutable maxBettingDuration;
    uint256 private immutable minBettingAmount;

    uint256 private immutable claimFee_wad;
    mapping(uint256 => Claim) private claims;

    IZkProofs private zkProofs;
    RandomNumberSource private randomNumberSource;

    uint256 private profits;

    // __________________ ** EVENTS ** ___________________________________________________________
    event NewJuror(address adr);
    event JurorWithdrawal(address adr);

    event NewClaim(uint256 claimId, address owner, uint256 bettingDuration);

    event VotingStarted(uint256 claimId);
    event VotingFinished(uint256 claimId, Vote outcome);

    // __________________ ** ERRORS ** ___________________________________________________________
    error ExistentJuror();
    error ExistentClaim();
    error NonExistentClaim();
    error NotJuror();
    error NotJurorForClaim();
    error NotVotingPhase();
    error NotBettingPhase();
    error IncorrectStakeAmount();
    error InsufficientBettingAmount();
    error NotClaimOwner();
    error VotingAlreadyInitiated();
    error VotingInProgress();

    // __________________ ** MODIFIERS ** ___________________________________________________________

    // __________________ ** FUNCTIONS ** ___________________________________________________________
    constructor(address _owner,
                address _zkProofsAddress,
                address _randomNumberSourceAddress,
                uint256 _jurorBuyInFee,
                uint256 _claimFee,
                uint256 _votingDuration,
                uint256 _maxBettingDuration,
                uint256 _minBettingAmount,
                uint256 _significantVoteMultiplier
    ) Ownable(_owner) {
        zkProofs = IZkProofs(_zkProofsAddress);
        randomNumberSource = RandomNumberSource(_randomNumberSourceAddress);

        jurySignupFee_wad = _jurorBuyInFee;
        claimFee_wad = _claimFee;

        votingDuration = _votingDuration;
        maxBettingDuration = _maxBettingDuration;

        minBettingAmount = _minBettingAmount;

        significantVoteMultiplier_wad = _significantVoteMultiplier;
    }

    function makeClaim(uint256 _claimId, uint256 _bettingDuration) external payable {
        require(claimExists(_claimId), ExistentClaim());
        require(msg.value == claimFee_wad, IncorrectStakeAmount());

        uint256 betDuration = _bettingDuration > maxBettingDuration ? maxBettingDuration : _bettingDuration;
        Claim storage newClaim = claims[_claimId];
        initializeNewClaim(newClaim, msg.sender, betDuration);

        emit NewClaim(_claimId, msg.sender, betDuration);
    }

    function makeBet(uint256 _claimId, Vote _option) external payable {
        require(claimExists(_claimId), NonExistentClaim());

        Claim storage claim = claims[_claimId];
        require(isBettingPhase(claim), NotBettingPhase());
        require(msg.value >= minBettingAmount, InsufficientBettingAmount());

        zkProofs.makeBet(msg.sender, _claimId, _option, msg.value);
    }

    function initiateVoting(uint256 _claimId) external onlyOwner {
        _initiateVoting(_claimId);
    }

    function _initiateVoting(uint256 _claimId) internal {
        require(claimExists(_claimId), NonExistentClaim());

        Claim storage claim = claims[_claimId];
        require(isVotingPhase(claim), NotVotingPhase());
        require(isVotingInitiated(claim), VotingAlreadyInitiated());

        uint16 juryCount = getJurySize(claim);
        address[] memory selectedJurors = selectJury(juryCount);

        zkProofs.declareJury(_claimId, selectedJurors);
    }

    function resetVoting(uint256 _claimId, Claim storage _claim) internal {
        _claim.votingInitiated = false;
        _claim.votingDeadline = block.timestamp + votingDuration;
        zkProofs.resetVoting(_claimId);
    }

    function castVote(uint256 _claimId, Vote _vote) external {
        require(claimExists(_claimId), NonExistentClaim());

        Claim storage claim = claims[_claimId];
        require(isVotingPhase(claim), NotVotingPhase());
        require(isVotingInitiated(claim), VotingAlreadyInitiated());
        require(isCallerSelectedJuror(_claimId), NotJurorForClaim());

        zkProofs.castVote(msg.sender, _claimId, _vote);
    }

    function tryResolveClaim(uint256 _claimId) external onlyOwner returns (bool) {
        require(claimExists(_claimId), NonExistentClaim());

        Claim storage claim = claims[_claimId];
        require(isVotingOver(claim), VotingInProgress());

        (address[] memory votingJurors, address[] memory nonVotingJurors) = zkProofs.getJurorsAfterVote(_claimId);
        if (nonVotingJurors.length == 0) {
            rewardJurors(_claimId, votingJurors);

            uint16[3] memory juryVotes = zkProofs.getVotes(_claimId);
            Vote finalVote = decideFinalVote(juryVotes);

            claim.finalVote = finalVote;

            return true;
        }
        else {
            penalizeJurors(nonVotingJurors);
            
            resetVoting(_claimId, claim);
            _initiateVoting(_claimId);
            emit VotingStarted(_claimId);

            return false;
        }
    }

    function signupForJury() external payable {
        require(!isCallerJuror(), ExistentJuror());
        require(msg.value == jurySignupFee_wad, IncorrectStakeAmount());

        jurors.push(msg.sender);
        indexOfJurors[msg.sender] = jurors.length;

        emit NewJuror(msg.sender);
    }

    function leaveJury() external {
        require(isCallerJuror(), NotJuror());

        uint256 stakeToReturn = ((100 - jurorStakesPercentagePenalty[msg.sender]) * jurySignupFee_wad) / 100;
        if (stakeToReturn > 0) payable(msg.sender).transfer(stakeToReturn);

        removeJuror(msg.sender);

        emit JurorWithdrawal(msg.sender);
    }

    function removeJuror(address juror) internal {
        uint256 idx = indexOfJurors[juror];
        // swap-and-pop
        uint256 last = jurors.length;
        if (idx != last) {
            address swapped = jurors[last - 1];
            jurors[idx - 1] = swapped;
            indexOfJurors[swapped] = idx;
        }
        jurors.pop();
        delete indexOfJurors[juror];
        delete jurorStakesPercentagePenalty[juror];
    }

    function getJurySize(Claim storage) internal pure returns (uint16) {
        // TODO
        return 11;
    }

    function selectJury(uint256 n) internal returns (address[] memory selected) {
        uint256 len = jurors.length;
        require(n <= len, "Not enough available jurors to select");

        // working copy of the indices [0,1,2,...,len-1]
        uint256[] memory idxs = new uint256[](len);
        for (uint i = 0; i < len; i++) {
            idxs[i] = i;
        }

        selected = new address[](n);
        uint256 seed = randomNumberSource.consumeRandomUint256();
        for (uint i = 0; i < n; i++) {
            // get a random j in [i .. len-1]
            uint256 rand = uint256(keccak256(abi.encodePacked(seed, i)));
            uint256 j = i + (rand % (len - i));

            // select the j-th remaining index
            uint256 chosenIndex = idxs[j];

            // swap idxs[i] <-> idxs[j] so we “remove” it from future picks
            idxs[j] = idxs[i];
            idxs[i] = chosenIndex;

            selected[i] = jurors[chosenIndex];
        }
    }

    function rewardJurors(uint256 _claimId, address[] memory _goodJurors) internal {
        // TODO
    }

    function penalizeJurors(address[] memory _badJurors) internal {
        for (uint i = 0; i < _badJurors.length; i++) {
            address badJuror = _badJurors[i];
            if (jurorStakesPercentagePenalty[badJuror] < 80) {
                jurorStakesPercentagePenalty[badJuror] += 20;
            }
            else { // Juror penalized too many times
                removeJuror(badJuror);
            }
            profits += (jurySignupFee_wad * 20) / 100;
        }
    }

    function decideFinalVote(uint16[3] memory _votes) internal view returns (Vote) {
        uint16 totalVotes = 0;
        for (uint i = uint(Vote.Agree) - 1; i <= uint(Vote.Unprovable) - 1; i++) {
            totalVotes += _votes[i];
        }

        // Vote is unprovable if more than half of the jurors votes it as such
        if (_votes[uint(Vote.Unprovable) - 1] > totalVotes / 2) return Vote.Unprovable;

        // Decide which option has more votes
        Vote popular = _votes[uint(Vote.Agree) - 1] >= _votes[uint(Vote.Disagree) - 1] ? Vote.Agree : Vote.Disagree;
        Vote unpopular = Vote(3 - uint(popular));

        // Vote is undecided if the difference between Agree and Disagree is small
        uint256 popularVotes_wad = _votes[uint(popular) - 1] * scale;
        uint256 unpopularVotes_wad = _votes[uint(unpopular) - 1] * scale;
        if (popularVotes_wad < ((unpopularVotes_wad * significantVoteMultiplier_wad) / scale)) {
            return Vote.Undecided;
        }

        return popular;
    }

    function getMyRewards(uint256 _claimId) external returns (uint256 amount) {
        require(claimExists(_claimId), NonExistentClaim());
        Claim storage claim = claims[_claimId];

        require(isVotingOver(claim), VotingInProgress());
        
        uint256 totalRewards = zkProofs.getTotalRewardAmount(_claimId, msg.sender);
        if (totalRewards == 0) return 0;

        amount = applyFeesToRewards(totalRewards, claim); 
        payable(msg.sender).transfer(amount);
        return amount;
    }

    function applyFeesToRewards(uint256 _rewards, Claim storage _claim) internal view returns (uint256) {
        if (_claim.finalVote == Vote.Undecided || _claim.finalVote == Vote.Unprovable) {
            // TODO
            return (_rewards * 95) / 100;
        }
        else {
            // TODO
            return (_rewards * 95) / 100;
        }
    }

    function initializeNewClaim(Claim storage _newClaim, address _owner, uint256 _bettingDuration) internal {
        _newClaim.timestamp = block.timestamp;
        _newClaim.bettingDuration = _bettingDuration;
        _newClaim.owner = _owner;
        _newClaim.votingInitiated = false;
        _newClaim.votingDeadline =  block.timestamp + _bettingDuration + votingDuration;
        _newClaim.finalVote = Vote.Undecided;
    }

    function isCallerPaidOut(Claim storage _claim) internal view returns (bool) {
        return _claim.paidOut[msg.sender];
    }

    function claimExists(uint256 _claimId) internal view returns (bool) {
        return claims[_claimId].timestamp > 0;
    }

    function isBettingPhase(Claim storage _claim) internal view returns (bool) {
        return _claim.timestamp + _claim.bettingDuration >= block.timestamp;
    }

    function isVotingPhase(Claim storage _claim) internal view returns (bool) {
        return _claim.votingDeadline >= block.timestamp;
    }

    function isVotingInitiated(Claim storage _claim) internal view returns (bool) {
        return _claim.votingInitiated;
    }

    function isVotingOver(Claim storage _claim) internal view returns (bool) {
        return _claim.votingDeadline < block.timestamp;
    }

    function isCallerJuror() internal view returns (bool) {
        return indexOfJurors[msg.sender] > 0;
    }

    function isCallerSelectedJuror(uint256 _claimId) internal returns (bool) {
        return zkProofs.isValidJuror(msg.sender, _claimId);
    }

    function pullProfits() external onlyOwner {
        payable(owner()).transfer(profits);
        profits = 0;
    }

    receive() external payable{}
}