import React, { useEffect, useState } from 'react';
import { Licenses } from './Licenses';
import { GreenCards } from '../components/GreenCards';
import { getGreenCards, getDriversLicenses } from '../services/HttpClient';

export const Documents = () => {
	const [driversLicenses, setDriversLicenses] = useState([]);
	const [greenCards, setGreenCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const fetchDocuments = async () => {
			try {
				// Fetch licenses
				const licensesResponse = await getDriversLicenses();
				setDriversLicenses(licensesResponse?.data || []);

				// Fetch green cards
				const greenCardsResponse = await getGreenCards();
				setGreenCards(greenCardsResponse?.data || []);
			} catch (error) {
				setErrorMessage('Failed to fetch documents');
				console.error('❌ Documents Fetch Error:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchDocuments();
	}, []);

	return (
		<div className='documents-page'>
			<h2>Documents</h2>
			{loading ? (
				<p>Loading...</p>
			) : errorMessage ? (
				<p>{errorMessage}</p>
			) : (
				<>
					{driversLicenses.length === 0 && greenCards.length === 0 ? (
						<p>No documents found</p>
					) : (
						<>
							{driversLicenses.length > 0 && (
								<Licenses driversLicenses={driversLicenses} />
							)}
							{greenCards.length > 0 && (
								<GreenCards greenCards={greenCards} />
							)}
						</>
					)}
				</>
			)}
		</div>
	);
};
