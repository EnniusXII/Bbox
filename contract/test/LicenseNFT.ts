import { expect } from 'chai';
import hre from 'hardhat';

describe('LicenseNFT', () => {
	async function deployNFTFixture() {
		const [owner, addr1, addr2] = await hre.ethers.getSigners();
		const mintingFee = hre.ethers.parseEther('0.01');
		const LicenseNFT = await hre.ethers.getContractFactory('LicenseNFT');
		const contract = await LicenseNFT.deploy(mintingFee);

		return { contract, owner, addr1, addr2, mintingFee };
	}

	describe('Depoloyment', () => {
		it('Should deploy the contract correctly', async () => {
			const { contract } = await deployNFTFixture();

			expect(contract.getAddress()).to.not.be.undefined;
		});

		it('Should set the correct owner', async () => {
			const { contract, owner } = await deployNFTFixture();

			expect(await contract.owner()).to.equal(owner.address);
		});

		it('Should initialize minting fee correctly', async () => {
			const { contract, mintingFee } = await deployNFTFixture();
			const contractFee = await contract.mintingFee();
			const expectedFee = hre.ethers.parseEther('0.01');

			expect(contractFee.toString()).to.equal(expectedFee.toString());
		});
	});

	describe('Minting NFTs', () => {
		it('Should allow users to mint their own NFT with the correct fee', async () => {
			const { contract, addr1, mintingFee } = await deployNFTFixture();

			const metadataURI = 'ipfs://example-metadata-uri';
			const uniqueHash = 'unique-hash-123';

			const tx = await contract
				.connect(addr1)
				.mintNFT(metadataURI, uniqueHash, {
					value: mintingFee,
				});
			const receipt = await tx.wait();
			expect(receipt).to.not.be.undefined;

			expect(await contract.ownerOf(1)).to.equal(addr1.address);
		});

		it('Should not allow duplicate hashes', async () => {
			const { contract, addr1, mintingFee } = await deployNFTFixture();

			const metadataURI = 'ipfs://example-metadata-uri';
			const uniqueHash = 'unique-hash-123';

			await contract.connect(addr1).mintNFT(metadataURI, uniqueHash, {
				value: mintingFee,
			});

			await expect(
				contract
					.connect(addr1)
					.mintNFT(metadataURI, uniqueHash, { value: mintingFee })
			).to.be.revertedWith('NFT already exists for this document');
		});

		it('Should not allow minting without the correct fee', async () => {
			const { contract, addr1 } = await deployNFTFixture();

			const metadataURI = 'ipfs://example-metadata-uri';
			const uniqueHash = 'unique-hash-123';

			await expect(
				contract.connect(addr1).mintNFT(metadataURI, uniqueHash)
			).to.be.revertedWith('Insufficient ETH for minting');
		});
	});

	describe('setMintingFee()', () => {
		it('Should allow the owner to set the minting fee', async () => {
			const { contract, owner } = await deployNFTFixture();

			const newFee = hre.ethers.parseEther('0.02');

			await contract.connect(owner).setMintingFee(newFee);

			const contractFee = await contract.mintingFee();

			expect(contractFee.toString()).to.equal(newFee.toString());
		});

		it('Should not allow non-owners to set a new minting fee', async () => {
			const { contract, addr1 } = await deployNFTFixture();

			const newFee = hre.ethers.parseEther('0.02');

			await expect(contract.connect(addr1).setMintingFee(newFee))
				.to.be.revertedWithCustomError(
					contract,
					'OwnableUnauthorizedAccount'
				)
				.withArgs(addr1.address);
		});
	});

	describe('withdrawFunds()', () => {
		it('Should allow the owner to withdraw funds', async () => {
			const { contract, owner, addr1, mintingFee } =
				await deployNFTFixture();

			const metadataURI = 'ipfs://example-metadata-uri';
			const uniqueHash = 'unique-hash-123';

			await contract.connect(addr1).mintNFT(metadataURI, uniqueHash, {
				value: mintingFee,
			});

			const initialBalance = await hre.ethers.provider.getBalance(
				owner.address
			);

			await contract.connect(owner).withdrawFunds();

			const finalBalance = await hre.ethers.provider.getBalance(
				owner.address
			);

			expect(finalBalance).to.be.gt(initialBalance);
		});

		it('Should not allow non-owners to withdraw funds', async () => {
			const { contract, addr1 } = await deployNFTFixture();

			await expect(contract.connect(addr1).withdrawFunds())
				.to.be.revertedWithCustomError(
					contract,
					'OwnableUnauthorizedAccount'
				)
				.withArgs(addr1.address);
		});
	});
});
