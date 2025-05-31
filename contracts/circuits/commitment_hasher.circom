pragma circom 2.2.0;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";

template CommitmentHasher() {
    signal input nullifier;
    signal input secret;
    signal input vote;
    signal output commitment;
    signal output nullifierHash;

    // Ensure vote is boolean
    vote * (1 - vote) === 0;

    component nullifierBits = Num2Bits(248);
    component secretBits = Num2Bits(248);
    component voteBits = Num2Bits(1);
    nullifierBits.in <== nullifier;
    secretBits.in <== secret;
    voteBits.in <== vote;

    // Hash commitment: Pedersen([nullifierBits, secretBits, vote])
    component commitmentHasher = Pedersen(504); // 248 + 248 + 8 = 504 bits
    for (var i = 0; i < 248; i++) {
        commitmentHasher.in[i] <== nullifierBits.out[i];
        commitmentHasher.in[i + 248] <== secretBits.out[i];
    }

    commitmentHasher.in[496] <== voteBits.out[0];

    for (var i = 497; i < 504; i++) {
        commitmentHasher.in[i] <== 0;
    }

    // Hash nullifier separately (for nullifierHash, to prevent double-spending)
    component nullifierHasher = Pedersen(248);
    for (var i = 0; i < 248; i++) {
        nullifierHasher.in[i] <== nullifierBits.out[i];
    }

    commitment <== commitmentHasher.out[0];
    nullifierHash <== nullifierHasher.out[0];
}

// component main = CommitmentHasher();
