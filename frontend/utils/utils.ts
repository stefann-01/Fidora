import { randomBytes } from "crypto";
import { bigint } from "hardhat/internal/core/params/argumentTypes";
import { buildPedersenHash, PedersenHash } from "circomlibjs";

const BYTES_SIZE = 31; // 248 bits, Whitepaper parameter

const pedersenHash = async (data: Buffer): Promise<bigint> => {
  // Create the Pedersen hasher
  const pedersen = await buildPedersenHash();

  // Hash the data to a point on BabyJub curve in compressed format
  const hashPoint = pedersen.hash(data);

  // Decompress the point and get x-coordinate
  const [xCoord] = pedersen.babyJub.unpackPoint(hashPoint);

  // Convert from Montgomery form
  const normalForm = pedersen.babyJub.F.fromMontgomery(xCoord);

  // Convert to bigint
  return bufferToBigInt(normalForm);
};

// Little endian
function bufferToBigInt(buffer: Buffer): bigint {
  let result = BigInt(0);
  for (let i = 0; i < buffer.length; i++) {
    let temp = BigInt(buffer[i]) << BigInt(i * 8);
    result = result + temp;
  }
  return result;
}

function bigIntToBuffer(int: bigint, length: number): Buffer {
  const requiredLength = Math.ceil(int.toString(2).length / 8);
  if (requiredLength > length)
    throw "Invalid number value, length is lower than required one";

  const buffer = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = Number(int & 0xffn);
    int >>= 8n;
  }
  return buffer;
}

function bigIntToHex(int: bigint, length = 32): string {
  return "0x" + int.toString(16).padStart(length * 2, "0");
}

function hexToBigint(value: string) {
  if (value.startsWith("0x")) {
    return BigInt(value);
  }
  return BigInt("0x" + value);
}

async function generateCommitment(): Promise<{
  nullifier: bigint;
  secret: bigint;
  commitment: bigint;
  vote: number;
}> {
  const nullifierBytes: Buffer = randomBytes(BYTES_SIZE);
  const nullifier = bufferToBigInt(nullifierBytes);

  const secretBytes: Buffer = randomBytes(BYTES_SIZE);
  const secret = bufferToBigInt(secretBytes);

  const vote = Math.random() < 0.5 ? 1 : 0; // Randomly assign 1 or 0

  const voteBit = Buffer.alloc(1);
  voteBit[0] = vote;

  // Concatenate the bytes and hash
  const commitmentBytes = Buffer.concat([nullifierBytes, secretBytes, voteBit]);
  
  const commitment = await pedersenHash(commitmentBytes);

  return { nullifier, secret, commitment, vote };
}

export {
  pedersenHash,
  bigIntToHex,
  bigIntToBuffer,
  hexToBigint,
  generateCommitment,
};
