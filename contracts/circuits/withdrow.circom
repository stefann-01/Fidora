pragma circom 2.2.0;

include "./commitment_hasher.circom";
include "./merkletree_checker.circom";

template Withdraw(levels) {
    // PUBLIC INPUTS
    signal input root;              // Merkle tree root
    signal input nullifierHash;     // Prevent double-spending
    signal input recipient;         // Output recipient
    signal input correctAnswer;     // Correct answer to the question

    // PRIVATE INPUTS
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Identity commitment + nullifierHash
    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    hasher.vote <== correctAnswer;
    hasher.nullifierHash === nullifierHash;

    // Merkle proof of inclusion in the YES voters tree
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== root;

    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // Use recipient to satisfy compiler
    signal recipientSquared;
    recipientSquared <== recipient * recipient;
}

component main { public [root, nullifierHash, recipient, correctAnswer] } = Withdraw(20);
