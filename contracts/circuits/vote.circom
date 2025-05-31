pragma circom 2.2.0;

include "./commitment_hasher.circom";
include "./merkletree_checker.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template Vote(levels) {
    // PUBLIC INPUTS
    signal input root;
    signal input nullifierHash;
    signal input vote;
    signal input externalNullifier;

    // PRIVATE INPUTS
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    signal output voteout;

    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    hasher.vote <== vote;
    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    voteout <== vote;
}

component main { public [root, nullifierHash, vote, externalNullifier] } = Vote(20);
