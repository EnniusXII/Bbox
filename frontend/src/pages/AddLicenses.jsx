import React, { useState } from 'react';
import { addDriversLicense } from '../services/HttpClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

export const AddLicenses = () => {
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [licenseAdded, setLicenseAdded] = useState(false);
	const [showNFTPrompt, setShowNFTPrompt] = useState(false);
	const [licenseId, setLicenseId] = useState(null);
	const [licenseData, setLicenseData] = useState({
		lastName: '',
		firstName: '',
		birthDate: '',
		issueDate: '',
		expiryDate: '',
		issuer: '',
		referenceNumber: '',
		licenseNumber: '',
		licenseTypes: [],
	});

	const navigate = useNavigate();

	const handleTypeChange = (type) => {
		setLicenseData((prevData) => {
			const isSelected = prevData.licenseTypes.includes(type);
			return {
				...prevData,
				licenseTypes: isSelected
					? prevData.licenseTypes.filter((item) => item !== type)
					: [...prevData.licenseTypes, type],
			};
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (loading) return;
		setLoading(true);

		if (
			!licenseData.birthDate ||
			!licenseData.issueDate ||
			!licenseData.expiryDate ||
			!licenseData.lastName ||
			!licenseData.firstName ||
			!licenseData.issuer ||
			!licenseData.referenceNumber ||
			!licenseData.licenseNumber ||
			licenseData.licenseTypes.length === 0
		) {
			toast.error('All fields are required before submission!');
			setLoading(false);
			return;
		}

		try {
			const response = await addDriversLicense(licenseData);
			console.log('License API response:', response);
			const addedLicense = response?.license;
			const licenseIdFromResponse = addedLicense?._id || addedLicense?.id;
			const success = response?.success;

			if (success && licenseIdFromResponse) {
				toast.success(`Driver's License successfully added!`);
				setLicenseId(licenseIdFromResponse);
				setLicenseAdded(true);
				setIsFormVisible(false);
				setShowNFTPrompt(true);
			} else {
				const errorMessage =
					response?.error ||
					response?.data?.error ||
					'Unknown error occurred!';
				toast.error(`${errorMessage}`);
			}
		} catch (error) {
			console.error('Axios Error:', error);
			const errorMessage =
				error.response?.data?.error || 'An unexpected error occurred!';
			toast.error(`${errorMessage}`);
		} finally {
			setLoading(false);
		}
	};

	const toggleForm = () => setIsFormVisible(!isFormVisible);

	return (
		<div className='container flex flex-column'>
			<h1 className='pageheader'>Add Driver's License</h1>

			<button onClick={toggleForm}>Add Driver's License</button>

			{isFormVisible && (
				<form className='forms' onSubmit={handleSubmit}>
					<ImageUpload setLicenseData={setLicenseData} />

					{loading && <p>Extracting data... Please wait.</p>}

					<label>Last Name:</label>
					<input
						type='text'
						value={licenseData.lastName}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								lastName: e.target.value,
							})
						}
						required
					/>

					<label>First Name:</label>
					<input
						type='text'
						value={licenseData.firstName}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								firstName: e.target.value,
							})
						}
						required
					/>

					<label>Birthdate:</label>
					<input
						type='date'
						value={licenseData.birthDate}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								birthDate: e.target.value,
							})
						}
						required
					/>

					<label>Issue Date (4a):</label>
					<input
						type='date'
						value={licenseData.issueDate}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								issueDate: e.target.value,
							})
						}
						required
					/>

					<label>Expiry Date (4b):</label>
					<input
						type='date'
						value={licenseData.expiryDate}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								expiryDate: e.target.value,
							})
						}
						required
					/>

					<label>Issuer (4c):</label>
					<input
						type='text'
						value={licenseData.issuer}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								issuer: e.target.value,
							})
						}
						required
					/>

					<label>Reference Number (4d):</label>
					<input
						type='text'
						value={licenseData.referenceNumber}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								referenceNumber: e.target.value,
							})
						}
						required
					/>

					<label>License Number (5):</label>
					<input
						type='text'
						value={licenseData.licenseNumber}
						onChange={(e) =>
							setLicenseData({
								...licenseData,
								licenseNumber: e.target.value,
							})
						}
						required
					/>

					<label>License Types:</label>
					<div className='license-type-container'>
						{[
							'AM',
							'A1',
							'A2',
							'A',
							'B1',
							'B',
							'C1',
							'C',
							'D1',
							'D',
							'BE',
							'C1E',
							'CE',
							'D1E',
							'DE',
						].map((type) => (
							<label key={type} className='type-option'>
								<input
									type='checkbox'
									checked={licenseData.licenseTypes.includes(
										type
									)}
									onChange={() => handleTypeChange(type)}
								/>
								{type}
							</label>
						))}
					</div>

					{errorMessage && (
						<div className='error'>
							<ul>
								{errorMessage.split(',').map((error, index) => (
									<li key={index}>{error}</li>
								))}
							</ul>
						</div>
					)}

					<button type='submit'>Add</button>
				</form>
			)}
			{showNFTPrompt && (
				<div className='nft-prompt'>
					<h2>Do you wish to create an NFT for your license?</h2>
					<div className='btn-controller'>
						<button
							onClick={() => {
								navigate('/documents');
							}}
						>
							No
						</button>
						<button
							onClick={async () => {
								try {
									setLoading(true);

									const { mintLicenseNFT } = await import(
										'../services/BlockchainServices'
									);
									const {
										uniqueHash,
										nftMetadataUri,
										nftTransactionHash,
									} = await mintLicenseNFT(licenseData);

									const { updateLicenseNFT } = await import(
										'../services/HttpClient'
									);
									await updateLicenseNFT(licenseId, {
										uniqueHash,
										nftMetadataUri,
										nftTransactionHash,
									});

									toast.success(
										'NFT successfully created and saved!'
									);
								} catch (err) {
									console.error('Error creating NFT: ', err);
									toast.error('Failed to create NFT!');
								} finally {
									setLoading(false);
									navigate('/documents');
								}
							}}
						>
							Yes
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
