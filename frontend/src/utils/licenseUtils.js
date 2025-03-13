import Tesseract from 'tesseract.js';

export const extractLicenseData = async (imageDataUrl) => {
	try {
		const { data } = await Tesseract.recognize(imageDataUrl, 'swe');

		const extractedData = filterLicenseText(data.text);

		return extractedData;
	} catch (error) {
		console.error('❌ Error processing image with Tesseract.js:', error);
		return null;
	}
};

const filterLicenseText = (text) => {
	const extracted = {
		lastName: extractField(text, /1[.:]? ([^\n]+)/, ''),
		firstName: extractFullName(text),
		birthDate: extractDate(text, '3'),
		issueDate: extractDate(text, '4a'),
		expiryDate: extractDate(text, '4b'),
		issuer: extractIssuer(text, /4c[.:]? ([^\n]+)/, ''),
		referenceNumber: extractField(text, /4d[.:]? (\d+)/, ''),
		licenseNumber: extractLicenseNumber(text),
		licenseTypes: extractLicenseTypes(text),
	};

	return extracted;
};

const extractField = (text, regex, fallback = '') => {
	const match = text.match(regex);
	if (!match) return fallback;

	let extracted = match[1].trim();

	extracted = extracted.replace(/-$/, '').trim();

	return extracted;
};

const extractIssuer = (text) => {
	let extracted = extractField(text, /4c[.:]? ([^\n]+)/, '');

	return extracted.replace(
		/Tronsportstyrelsen|Tronsportstyreslen|Tronsportstyrlesen|Transportstyrelser/gi,
		'Transportstyrelsen'
	);
};

const extractDate = (text, fieldLabel) => {
	const regex = new RegExp(
		`${fieldLabel}[.,]?[ ]?(\\d{2})[.:,-](\\d{2})[.:,-](\\d{4})`
	);
	const match = text.match(regex);
	if (!match) return '';

	return `${match[3]}-${match[2]}-${match[1]}`.replace(/-$/, '');
};

const extractLicenseNumber = (text) => {
	const match = text.match(/5[.:]? (\d{6}[-]?\d{4})/);
	return match ? match[1].replace('-', '') : '';
};

const extractLicenseTypes = (text) => {
	const match = text.match(/9[.:]? ([A-Z0-9 /-]+)/);
	if (!match || !match[1]) return [];

	return match[1]
		.replace(/[^A-Z0-9/ ]/g, '')
		.split(/[ /]+/)
		.map((type) => type.trim())
		.filter(Boolean);
};

const extractFullName = (text) => {
	const regex = /2[.:]?\s*([\s\S]+?)(?:\n\d[.:]?|\n4a[.:]?)/g;

	const match = [...text.matchAll(regex)];

	if (!match || match.length === 0) return '';

	return match[0][1].replace(/\n/g, ' ').trim();
};
