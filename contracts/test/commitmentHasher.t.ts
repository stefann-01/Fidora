import { zkit } from "hardhat";
import { expect } from "chai";
import { CommitmentHasher } from "../generated-types/zkit";
import { bigIntToBuffer, generateCommitment, pedersenHash } from "../utils/utils";
import { PrivateCommitmentHasherGroth16 } from "../generated-types/zkit";

describe("CommitmentHasher Test", () => {
  let circuit: CommitmentHasher;

  beforeEach(async () => {
    circuit = await zkit.getCircuit("CommitmentHasher");
  });

  it("should correctly generate commitment and nullifier hash", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();

    const input: PrivateCommitmentHasherGroth16 = {
      nullifier,
      secret,
      vote,
    };

    const expectedNullifierHash = await pedersenHash(bigIntToBuffer(nullifier, 31));

    await expect(circuit)
      .with.witnessInputs(input)
      .to.have.witnessOutputs({
        commitment,
        nullifierHash: expectedNullifierHash,
      });
  });

  it("should fail with incorrect nullifier", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();

    const expectedNullifierHash = await pedersenHash(bigIntToBuffer(nullifier, 31));

    // Malicious input: swap nullifier with secret
    const input: PrivateCommitmentHasherGroth16 = {
      nullifier: secret,
      secret,
      vote,
    };

    const witness = await circuit.calculateWitness(input);

    const calculatedCommitment = witness[1];        // index 1 = commitment
    const calculatedNullifierHash = witness[2];     // index 2 = nullifierHash

    expect(calculatedCommitment.toString()).to.not.equal(commitment.toString());
    expect(calculatedNullifierHash.toString()).to.not.equal(expectedNullifierHash.toString());
  });
});
