import React, { useState } from 'react';
import { addDriversLicense } from '../services/HttpClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { extractLicenseData } from '../utils/licenseUtils';

export const AddLicenses = () => {
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [licenseData, setLicenseData] = useState({
		name: '',
		fullName: '',
		birthDate: '',
		issueDate: '',
		expiryDate: '',
		licenseNumber: '',
		personalNumber: '',
		categories: '',
	});

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await addDriversLicense(
				licenseData.name,
				licenseData.fullName,
				licenseData.birthDate,
				licenseData.issueDate,
				licenseData.expiryDate,
				licenseData.authority,
				licenseData.licenseNumber,
				licenseData.personalNumber,
				licenseData.categories
			);

			if (response.success) {
				setLicenseData({
					name: '',
					fullName: '',
					birthDate: '',
					issueDate: '',
					expiryDate: '',
					authority: '',
					licenseNumber: '',
					personalNumber: '',
					categories: '',
				});
			}

			setErrorMessage('');
			toast.success("Driver's License has been added!");
		} catch (error) {
			console.error("Error while adding driver's license:", error);

			if (error.response && error.response.data.error) {
				setErrorMessage(error.response.data.error);
			} else {
				setErrorMessage(
					'An unexpected error occurred. Please try again.'
				);
			}
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = async () => {
			const imageDataUrl = reader.result;
			const extractedData = await extractLicenseData(imageDataUrl);
			if (extractedData) {
				setLicenseData(extractedData);
				toast.success('License data extracted successfully!');
			} else {
				toast.error('Failed to extract license data');
			}
		};
		reader.readAsDataURL(file);
	};

	const toggleForm = () => setIsFormVisible(!isFormVisible);

	return (
		<div className='container flex flex-column'>
			<h1 className='pageheader'>Add Licenses</h1>

			<button onClick={toggleForm}>Add Drivers License</button>

			{isFormVisible && (
				<form className='forms' onSubmit={handleSubmit}>
					<label>Last Name: </label>
					<input
						type='text'
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
					<label>First Name: </label>
					<input
						type='text'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<label>Birthdate: </label>
					<input
						type='date'
						value={birthdate}
						onChange={(e) => setBirthdate(e.target.value)}
					/>
					<label>License Type: </label>
					<select
						value={licenseType}
						onChange={(e) => setLicenseType(e.target.value)}
					>
						<option value='' disabled>
							Select License Type
						</option>
						<option value='AM'>AM</option>
						<option value='A1'>A1</option>
						<option value='A2'>A2</option>
						<option value='A'>A</option>
						<option value='B1'>B1</option>
						<option value='B'>B</option>
						<option value='C1'>C1</option>
						<option value='C'>C</option>
						<option value='D1'>D1</option>
						<option value='D'>D</option>
						<option value='BE'>BE</option>
						<option value='C1E'>C1E</option>
						<option value='CE'>CE</option>
						<option value='D1E'>D1E</option>
						<option value='DE'>DE</option>
					</select>

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
		</div>
	);
};
