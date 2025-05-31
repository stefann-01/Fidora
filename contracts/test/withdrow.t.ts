import { zkit } from "hardhat";
import { expect } from "chai";
import { CalldataWithdrawGroth16, Withdraw } from "../generated-types/zkit";
import { WithdrawGroth16Verifier__factory } from "../typechain-types";
import { WithdrawGroth16Verifier } from "../typechain-types";
import hre from "hardhat";
import {
  generateCommitment,
  pedersenHash,
  bigIntToBuffer,
} from "../utils/utils";
import { createTree } from "../utils/tree";
import { PrivateWithdrawGroth16 } from "../generated-types/zkit";

describe("Withdraw Test", () => {
  let circuit: Withdraw;
  let verifier: WithdrawGroth16Verifier;
  let recipient = hre.ethers.Wallet.createRandom().address;

  beforeEach(async () => {
    circuit = await zkit.getCircuit("Withdraw");
    const VerifierFactory: WithdrawGroth16Verifier__factory =
      await hre.ethers.getContractFactory("WithdrawGroth16Verifier");
    verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
  });

  it("should verify witness generation and proof", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();
    const tree = await createTree();
    tree.insert(commitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(commitment.toString())
    );

    const input: PrivateWithdrawGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      correctAnswer: vote,
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      pathIndices,
      recipient: BigInt(recipient),
    };

    await expect(circuit).with.witnessInputs(input).to.have.witnessOutputs({});
    await expect(circuit).to.generateProof(input);

    const proof = await circuit.generateProof(input);
    await expect(circuit)
      .to.useSolidityVerifier(verifier)
      .and.verifyProof(proof);
  });

  it("should fail with wrong vote", async () => {
    const { nullifier, secret, commitment, vote } = await generateCommitment();
    const tree = await createTree();
    tree.insert(commitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(commitment.toString())
    );

    const input: PrivateWithdrawGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      correctAnswer: 1-vote,  // Using wrong vote value
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      pathIndices,
      recipient: BigInt(recipient),
    };

    // The witness generation should fail because we're using the wrong vote
    await expect(expect(circuit).with.witnessInputs(input)).to.be.rejectedWith(
      "Error in template Withdraw",
      "Wrong vote validation"
    );

    // Now test with correct vote
    const correctInput: PrivateWithdrawGroth16 = {
      ...input,
      correctAnswer: vote,  // Using correct vote value
    };

    // Should generate witness successfully
    await expect(circuit).with.witnessInputs(correctInput).to.have.witnessOutputs({
      voteout: vote
    });
  });

  it("should fail with incorrect nullifier", async () => {
    const { nullifier, secret, commitment } = await generateCommitment();
    const tree = await createTree();
    tree.insert(commitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(commitment.toString())
    );

    const input: PrivateWithdrawGroth16 = {
      secret,
      nullifier: BigInt(0),
      root: BigInt(tree.root),
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      correctAnswer: 0, // Assuming this is a required field
      pathIndices,
      recipient: BigInt(recipient),
    };

    await expect(expect(circuit).witnessInputs(input)).to.be.rejectedWith(
      "Error in template Withdraw",
      "Wrong nullifier hash validation"
    );
  });

  it("should fail with incorrect commitment", async () => {
    const { nullifier, secret } = await generateCommitment();
    const tree = await createTree();

    const invalidCommitment = BigInt(1000);
    tree.insert(invalidCommitment.toString());

    const { pathElements, pathIndices } = tree.path(
      tree.indexOf(invalidCommitment.toString())
    );

    const input: PrivateWithdrawGroth16 = {
      secret,
      nullifier,
      root: BigInt(tree.root),
      nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
      pathElements: pathElements.map((el) => BigInt(el)),
      correctAnswer: 0, // Assuming this is a required field
      pathIndices,
      recipient: BigInt(recipient),
    };

    await expect(expect(circuit).with.witnessInputs(input)).to.be.rejectedWith(
      "Error in template MerkleTreeChecker"
    );
  });

//   it("should fail with tampered proof", async () => {
//     const { nullifier, secret, commitment } = await generateCommitment();
//     const tree = await createTree();
//     tree.insert(commitment.toString());

//     const { pathElements, pathIndices } = tree.path(
//       tree.indexOf(commitment.toString())
//     );

//     const input: PrivateWithdrawGroth16 = {
//       secret,
//       nullifier,
//       root: BigInt(tree.root),
//       correctAnswer: 0, // Assuming this is a required field
//       nullifierHash: await pedersenHash(bigIntToBuffer(nullifier, 31)),
//       pathElements: pathElements.map((el) => BigInt(el)),
//       pathIndices,
//       recipient: BigInt(recipient),
//     };

//     const proof = await circuit.generateProof(input);
//     const calldata = await circuit.generateCalldata(proof);

    // Create tampered proof by swapping elements in the first array
    // const tamperedCalldata = [
    //   [calldata[0][1], calldata[0][0]],  // Swap the elements to actually tamper with the proof
    //   calldata[1],
    //   calldata[2],
    //   calldata[3],
    // ];

    // // Verify original proof
    // const validResult = await verifier.verifyProof(...calldata);
    // expect(validResult).to.be.true;

    // // Verify tampered proof
    // const invalidResult = await verifier.verifyProof(...tamperedCalldata);
    // expect(invalidResult).to.be.false;
//   });
});