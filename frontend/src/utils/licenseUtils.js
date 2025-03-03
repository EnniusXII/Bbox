import Tesseract from 'tesseract.js';

export const extractLicenseData = async (image) => {
	try {
		const { data } = await Tesseract.recognize(image, 'swe', {
			logger: (m) => console.log(m),
		});

		const extractedText = data.text;
		return filterLicenseText(extractedText);
	} catch (error) {
		console.error('❌ Error processing image with Tesseract.js:', error);
		return null;
	}
};

// ✅ Filters and structures the extracted text into a readable format
const filterLicenseText = (text) => {
	const formattedData = {
		title: extractField(text, /Körkort Sverige/), // Checks if "Körkort Sverige" exists
		name: extractField(text, /1\. ([^\n]+)/), // First name
		fullName: extractField(text, /2\. ([^\n]+)/), // Full name
		birthDate: extractField(text, /3\. ([^\n]+)/), // Birthdate
		issueDate: extractField(text, /4a\. ([^\n]+)/), // Issue date
		expiryDate: extractField(text, /4b\. ([^\n]+)/), // Expiry date
		authority: extractField(text, /4c\. ([^\n]+)/), // Issuing authority
		licenseNumber: extractField(text, /4d\. ([^\n]+)/), // License number
		personalNumber: extractField(text, /5\. ([^\n]+)/), // Personal number
		categories: extractField(text, /9\. ([^\n]+)/), // License categories
	};

	return formattedData;
};

// ✅ Extracts a specific field using regex
const extractField = (text, regex) => {
	const match = text.match(regex);
	return match ? match[1].trim() : '';
};
