// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum Vote {
    Undecided,
    Agree,
    Disagree,
    Unprovable
}

struct Claim {
    uint256 timestamp;
    uint256 bettingDuration;
    address owner;
    bool votingInitiated;
    uint256 votingDeadline;
    Vote finalVote;
    mapping(address => bool) paidOut;
}