import { expect } from "chai";
import hre from "hardhat";

describe('GreenCard', () => {
  async function deployCardsFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const GreenCard = await hre.ethers.getContractFactory('GreenCardHashes');
    const contract = await GreenCard.deploy();

    return { contract, owner, addr1, addr2 };
  }

  describe('Deployment', () => {
    it('Should deploy the contract', async () => {
      const { contract } = await deployCardsFixture();
      expect(contract.getAddress()).to.not.be.undefined;
    });
  });

  describe('Store Hashes', () => {
    it('Should store a hash successfully', async () => {
      const { contract } = await deployCardsFixture();

      const id = '12345';
      const hash = 'hashValue123';

      const tx = await contract.storeHash(id, hash);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null - transaction may have failed.");

      if (!receipt.logs || receipt.logs.length === 0) {
        throw new Error("No logs found in transaction receipt");
      }

      const log = receipt.logs[0];
      if (!log) throw new Error("Log is null");

      let parsedLog;
      try {
        parsedLog = contract.interface.parseLog(log);
      } catch (error) {
        console.error("Failed to parse log:", error);
        throw new Error("Error parsing event log");
      }

      if (!parsedLog || !parsedLog.args) {
        throw new Error("Parsed log is null or missing arguments");
      }

      expect(parsedLog.args?.id).to.equal(id);
      expect(parsedLog.args?.hash).to.equal(hash);

      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      if (!block) throw new Error("Block not found");

      const blockTimestamp = block.timestamp;
      expect(parsedLog.args?.timestamp).to.be.closeTo(blockTimestamp, 1);
    });

    it('Should not allow to store a duplicate hash', async () => {
      const { contract } = await deployCardsFixture();

      const id = '12345';
      const hash = 'hashValue123';

      await contract.storeHash(id, hash);

      await expect(contract.storeHash(id, hash)).to.be.revertedWith('Hash already exists.');
    });

    it('Should not allow to store a hash with empty hash', async () => {
      const { contract } = await deployCardsFixture();

      const id = '12345';
      const hash = '';

      await expect(contract.storeHash(id, hash)).to.be.revertedWith('Hash cannot be empty.');
    });
  });

  describe('Get Hashes', () => {
    it('Should get a hash successfully', async () => {
      const { contract } = await deployCardsFixture();

      const id = "12345";
      const hash = "hashValue123";

      const tx = await contract.storeHash(id, hash);
      const receipt = await tx.wait();

      if (!receipt) throw new Error("Transaction receipt is null");

      const storedHash = await contract.getHash(id);

      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      if (!block) throw new Error("Block not found");

      const blockTimestamp = block.timestamp;

      expect(storedHash[0]).to.equal(hash);
      expect(storedHash[1]).to.equal(blockTimestamp);
    });

    it("Should revert when getting a non-existent hash", async () => {
      const { contract } = await deployCardsFixture();
    
      const nonExistentId = "99999";
    
      await expect(contract.getHash(nonExistentId))
        .to.be.revertedWith("Hash does not exist.");
    });
  });

  describe('Verify Hashes', () => {
    it('Should verify a hash successfully', async () => {
      const {contract} = await deployCardsFixture();

      const id = "12345";
      const hash = "hashValue123";

      await contract.storeHash(id, hash);

      const isValid = await contract.verifyHash(id, hash);
      expect(isValid).to.be.true;

      const isInvalid = await contract.verifyHash(id, "wrongHash");
      expect(isInvalid).to.be.false;
    })

    it("Should revert when verifying a non-existent hash", async () => {
      const { contract } = await deployCardsFixture();
    
      const nonExistentId = "99999";
      const fakeHash = "fakehash123";
    
      await expect(contract.verifyHash(nonExistentId, fakeHash))
        .to.be.revertedWith("Hash not found for this ID.");
    });
  })
});