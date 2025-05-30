// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RNGInterface.sol";

contract Fidora is Ownable {

    // __________________ ** TYPES ** ___________________________________________________________
    struct Claim {
        uint256 timestamp;
        address owner;
        // TODO
    }

    // __________________ ** PROPERTIES ** ___________________________________________________________
    uint256 private constant scale = 10 ** 18;

    uint256 private immutable votingDuration;
    uint256 private immutable jurySignupFee_wad;
    mapping(address => uint8) jurorStakesPercentage;

    uint256 private immutable bettingDuration;
    uint256 private immutable claimFee_wad;
    uint256 private nextClaimId;
    mapping(uint256 => Claim) claims;

    ZkInterface private zkInterface;
    RNGInterface private rngInterface;

    uint256 private profits;
    // __________________ ** EVENTS ** ___________________________________________________________

    event NewJuror(address adr);
    event JurorWithdrawal(address adr);

    event NewClaim(uint256 id, address owner);
    event ClaimCanceled(uint256 id);
    event ClaimVoteFinished(uint256 id, bool finalVote);

    // __________________ ** MODIFIERS ** ___________________________________________________________

    error ExistentJuror();
    error ExistentClaim();
    error NonExistentClaim();
    error NotJuror();
    error NotJurorForClaim();
    error NotVotingPhase();
    error NotBettingPhase();
    error IncorrectStakeAmount();
    error NotClaimOwner();

    // __________________ ** MODIFIERS ** ___________________________________________________________

    // __________________ ** FUNCTIONS ** ___________________________________________________________

    constructor(address _owner,
                address _zkInterfaceAddress,
                address _rngInterfaceAddress,
                uint256 _jurorBuyInFee,
                uint256 _claimFee,
                uint256 _votingDuration,
                uint256 _bettingDuration
    ) Ownable(_owner) {
        zkInterface = ZkInterface(_zkInterfaceAddress);
        rngInterface = RNGInterface(_rngInterfaceAddress);

        jurySignupFee_wad = _jurorBuyInFee;
        claimFee_wad = _claimFee;

        votingDuration = _votingDuration;
        bettingDuration = _bettingDuration;

        nextClaimId = 0;
    }

    function jurySignUp() external payable {
        require(!isCallerJuror(), ExistentJuror());
        require(msg.value == jurySignupFee_wad, IncorrectStakeAmount());

        jurorStakesPercentage[msg.sender] = 100;

        emit NewJuror(msg.sender);
    }

    function leaveJury() external {
        require(isCallerJuror(), NotJuror());

        uint256 stakeToReturn = (jurorStakesPercentage[msg.sender] * scale) / 100;
        payable(msg.sender).transfer(stakeToReturn);

        emit JurorWithdrawal(msg.sender);
    }

    function castVote(uint256 _claimId, bool vote) external view {
        require(isExistingClaim(_claimId), NonExistentClaim());
        require(isCallerJuror(), NotJuror());
        require(isCallerJurorForClaim(_claimId), NotJurorForClaim());
        require(isVotingPhase(_claimId), NotVotingPhase());

        // TODO
    }

    function makeClaim() external payable {
        require(msg.value == claimFee_wad, IncorrectStakeAmount());

        // TODO

        claims[nextClaimId++] = Claim({
            owner: msg.sender,
            timestamp: block.timestamp    
        });
    }

    function cancelClaim(uint256 _claimId) external {
        require(isExistingClaim(_claimId), NonExistentClaim());
        require(isCallerClaimOwner(_claimId), NotClaimOwner());
        require(isBettingPhase(_claimId), NotBettingPhase());

        // TODO

        delete claims[_claimId];
        emit ClaimCanceled(_claimId);
    }

    function betOnClaim(uint256 _claimId, bool vote) external payable {
        require(isExistingClaim(_claimId), NonExistentClaim());
        require(isBettingPhase(_claimId), NotBettingPhase());

        // TODO
    }

    function isCallerJuror() internal view returns (bool) {
        return jurorStakesPercentage[msg.sender] > 0;
    }

    function isCallerJurorForClaim(uint256 _claimId) internal view returns (bool) {
        // TODO
        return zkInterface.IsJuror(msg.sender, _claimId);
    }

    function isCallerClaimOwner(uint256 _claimId) internal view returns (bool) {
        return claims[_claimId].owner == msg.sender;
    }

    function isExistingClaim(uint256 _claimId) internal view returns (bool) {
        return claims[_claimId].timestamp > 0;
    }

    function isBettingPhase(uint256 _claimId) internal view returns (bool) {
        return claims[_claimId].timestamp + bettingDuration < block.timestamp;
    }

    function isVotingPhase(uint256 _claimId) internal view returns (bool) {
        return claims[_claimId].timestamp + bettingDuration + votingDuration < block.timestamp;
    }

    function pullProfits() external onlyOwner {
        payable(owner()).transfer(profits);
        profits = 0;
    }

    receive() external payable{}
}