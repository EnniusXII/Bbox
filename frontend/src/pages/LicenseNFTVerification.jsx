import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyLicenseNFT } from '../services/BlockchainServices';

const LicenseNFTVerification = () => {
	const { uniqueHash } = useParams();
	const [verificationData, setVerificationData] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const fetchVerification = async () => {
			try {
				const data = await verifyLicenseNFT(uniqueHash);
				setVerificationData(data);
			} catch (error) {
				setErrorMessage(
					'Verification failed. License is invalid or does not exist.'
				);
			}
		};
		fetchVerification();
	}, [uniqueHash]);

	return (
		<div className='container'>
			<h2>Driver's License Verification</h2>
			{verificationData ? (
				<div className='verification-details'>
					<p>
						<strong>Holder:</strong> {verificationData.firstName}{' '}
						{verificationData.lastName}
					</p>
					<p>
						<strong>Birthdate:</strong>{' '}
						{verificationData.birthDate.split('T')[0]}
					</p>
					<p>
						<strong>Reference number:</strong>{' '}
						{verificationData.referenceNumber}
					</p>
					<p>
						<strong>Status:</strong>{' '}
						{verificationData.valid ? 'Valid ✅' : 'Invalid ❌'}
					</p>
				</div>
			) : (
				<p>{errorMessage || 'Verifying...'}</p>
			)}
		</div>
	);
};

export default LicenseNFTVerification;
