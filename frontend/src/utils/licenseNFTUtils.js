import SHA256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import QRCode from 'qrcode';
import axios from 'axios';

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecret = import.meta.env.VITE_PINATA_SECRET;

export const generateLicenseHash = (licenseData) => {
	const {
		firstName,
		lastName,
		birthDate,
		issueDate,
		expiryDate,
		issuer,
		licenseNumber,
		referenceNumber,
		licenseTypes,
	} = licenseData;
	const hashString = `${firstName}${lastName}${birthDate}${issueDate}${expiryDate}${issuer}${licenseNumber}${referenceNumber}${licenseTypes}`;
	return SHA256(hashString).toString(encHex);
};

export const uploadQRToIPFS = async (uniqueHash) => {
	const qrData = `${window.location.origin}/verification/${uniqueHash}`;
	const qrImage = await QRCode.toDataURL(qrData);
	const blob = await (await fetch(qrImage)).blob();
	const formData = new FormData();
	formData.append('file', blob, qrData.png);

	const res = await axios.post(
		'https://api.pinata.cloud/pinning/pinFileToIPFS',
		formData,
		{
			headers: {
				pinata_api_key: pinataApiKey,
				pinata_secret_api_key: pinataSecret,
			},
		}
	);

	return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};

export const uploadMetadataToIPFS = async (metadata) => {
	const res = await axios.post(
		'https://api.pinata.cloud/pinning/pinJSONToIPFS',
		metadata,
		{
			headers: {
				pinata_api_key: pinataApiKey,
				pinata_secret_api_key: pinataSecret,
			},
		}
	);

	return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};
