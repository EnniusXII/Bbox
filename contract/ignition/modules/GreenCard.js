const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');
const { ethers } = require('ethers');

const LicenseNFTModule = buildModule('LicenseNFTModule', (m) => {
	const mintingFee = m.getParameter('mintingFee', ethers.parseEther('0'));

	const licenseNFT = m.contract('LicenseNFT', [mintingFee]);

	return { licenseNFT };
});

module.exports = LicenseNFTModule;
