import { zkit } from "hardhat";
import { expect } from "chai";
import { Vote } from "../generated-types/zkit";
import { VoteGroth16Verifier__factory } from "../typechain-types";
import { VoteGroth16Verifier } from "../typechain-types";
import hre from "hardhat";
import {
  generateCommitment,
  pedersenHash,
  bigIntToBuffer,
} from "../utils/utils";
import { createTree } from "../utils/tree";
import { PrivateVoteGroth16 } from "../generated-types/zkit";

describe("Vote Test", () => {
  let circuit: Vote;
  let verifier: VoteGroth16Verifier;
  let externalNullifier = hre.ethers.Wallet.createRandom().address;

  beforeEach(async () => {
    circuit = await zkit.getCircuit("Vote");
    const VerifierFactory: VoteGroth16Verifier__factory =
      await hre.ethers.getContractFactory("VoteGroth16Verifier");
    verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
  });

  it("should verify witness generation and proof with correct vote", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();
    const tree = await createTree();
    tree.insert(commitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(commitment.toString())
    );

    const input: PrivateVoteGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      vote: vote,
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      pathIndices,
      externalNullifier: BigInt(externalNullifier),
    };

    // Verify witness generation
    await expect(circuit).with.witnessInputs(input).to.have.witnessOutputs({
      voteout: vote
    });

    // Generate and verify proof
    const proof = await circuit.generateProof(input);
    await expect(circuit)
      .to.useSolidityVerifier(verifier)
      .and.verifyProof(proof);
  });

  it("should fail with incorrect nullifier hash", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();
    const tree = await createTree();
    tree.insert(commitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(commitment.toString())
    );

    const input: PrivateVoteGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      vote: vote,
      nullifierHash: BigInt(0), // Wrong nullifier hash
      pathElements: pathElements.map((el) => BigInt(el)),
      pathIndices,
      externalNullifier: BigInt(externalNullifier),
    };

    await expect(expect(circuit).with.witnessInputs(input)).to.be.rejectedWith(
      "Error in template Vote",
      "Wrong nullifier hash validation"
    );
  });

  it("should fail with incorrect commitment", async () => {
    const { nullifier, secret, vote } = await generateCommitment();
    const tree = await createTree();

    const invalidCommitment = BigInt(1000);
    tree.insert(invalidCommitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(invalidCommitment.toString())
    );

    const input: PrivateVoteGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      vote: vote,
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      pathIndices,
      externalNullifier: BigInt(externalNullifier),
    };

    await expect(expect(circuit).with.witnessInputs(input)).to.be.rejectedWith(
      "Error in template MerkleTreeChecker"
    );
  });
});
