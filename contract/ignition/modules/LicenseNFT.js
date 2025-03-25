import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('LicenseNFTModule', (m) => {
	const mintingFee = m.getParameter('mintingFee', 0);

	const licenseNFT = m.contract('LicenseNFT', [mintingFee]);

	return { licenseNFT };
});
