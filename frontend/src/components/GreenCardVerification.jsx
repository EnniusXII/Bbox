import React, { useState } from 'react';
import { requestGreenCardVerification } from '../services/BlockchainServices';
import { useNavigate } from 'react-router-dom';

export const GreenCardVerification = () => {
	const [referenceId, setReferenceId] = useState('');
	const [statusMessage, setStatusMessage] = useState('');
	const navigate = useNavigate();

	const handleVerify = async (e) => {
		e.preventDefault();

		try {
			const response = await requestGreenCardVerification(referenceId);
			if (response.requestId) {
				navigate(`/verification-status/${response.requestId}`);
			}
		} catch (error) {
			console.error('Error during verification:', error);
			setStatusMessage(
				error.response?.data?.message ||
					'An error occurred during verification.'
			);
		}
	};

	return (
		<div className='container flex flex-column'>
			<h2>Verify Green Card</h2>
			<form className='forms' onSubmit={handleVerify}>
				<label>Reference ID: </label>
				<input
					type='text'
					value={referenceId}
					onChange={(e) => setReferenceId(e.target.value)}
				/>

				<button type='submit'>Verify</button>
			</form>

			{statusMessage && <p>{statusMessage}</p>}
		</div>
	);
};
