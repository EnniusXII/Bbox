import React, { useState } from 'react';
import heic2any from 'heic2any';
import { extractLicenseData } from '../utils/licenseUtils';

const ImageUpload = ({ setLicenseData }) => {
	const [loading, setLoading] = useState(false);

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setLoading(true);

		try {
			let convertedFile = file;

			// ✅ Detect HEIC and Convert to JPEG
			if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
				console.log('🔄 Converting HEIC to JPEG...');
				const blob = await heic2any({
					blob: file,
					toType: 'image/jpeg',
					quality: 0.8,
				});
				convertedFile = new File(
					[blob],
					file.name.replace('.heic', '.jpg'),
					{
						type: 'image/jpeg',
					}
				);
			}

			// ✅ Resize and Convert Any Image to JPEG
			const jpegImageDataUrl = await resizeImage(convertedFile, 800, 500);

			// ✅ Run OCR Extraction
			const extractedData = await extractLicenseData(jpegImageDataUrl);
			if (extractedData) {
				setLicenseData((prev) => {
					console.log('🔄 Updating UI with:', extractedData);
					return { ...prev, ...extractedData };
				});
			}
		} catch (error) {
			console.error('❌ Error processing image:', error);
		}

		setLoading(false);
	};

	const resizeImage = (file, maxWidth, maxHeight) => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.src = event.target.result;

				img.onload = () => {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');

					let width = img.width;
					let height = img.height;

					// **Maintain aspect ratio without cropping**
					if (width > maxWidth || height > maxHeight) {
						const aspectRatio = width / height;
						if (width > height) {
							width = maxWidth;
							height = Math.floor(width / aspectRatio);
						} else {
							height = maxHeight;
							width = Math.floor(height * aspectRatio);
						}
					}

					canvas.width = width;
					canvas.height = height;
					ctx.drawImage(img, 0, 0, width, height);

					// ✅ Convert to grayscale for better OCR accuracy
					const imageData = ctx.getImageData(
						0,
						0,
						canvas.width,
						canvas.height
					);
					const data = imageData.data;
					for (let i = 0; i < data.length; i += 4) {
						const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Convert to grayscale
						data[i] = avg;
						data[i + 1] = avg;
						data[i + 2] = avg;
					}
					ctx.putImageData(imageData, 0, 0);

					// ✅ Convert to JPEG with high quality
					resolve(canvas.toDataURL('image/jpeg', 1.0));
				};
			};
			reader.readAsDataURL(file);
		});
	};

	return (
		<div>
			<label>Upload Driver's License Image:</label>
			<input type='file' accept='image/*' onChange={handleImageUpload} />
			{loading && <p>Extracting data... Please wait.</p>}
		</div>
	);
};

export default ImageUpload;
