import React, { useState, useEffect } from 'react';
import { confirmGreenCard } from '../services/HttpClient';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ConfirmGreenCard = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const insuranceId = searchParams.get('insuranceId');
	const hash = searchParams.get('hash');
	const [transactionHash, setTransactionHash] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!insuranceId || !hash) {
			toast.error('Missing Insurance ID or Hash');
			navigate('/green-card/create');
		}
	}, [insuranceId, hash, navigate]);

	const handleConfirm = async () => {
		setLoading(true);
		const token = localStorage.getItem('token');

		if (!token) {
			toast.error('You must be logged in to confirm the Green Card.');
			return;
		}

		try {
			// Simulating a transaction hash (this should be replaced with your blockchain integration)
			const blockchainTransactionHash = `0x${Math.random()
				.toString(16)
				.substr(2, 64)}`;

			await confirmGreenCard(
				insuranceId,
				blockchainTransactionHash,
				hash,
				token
			);
			setTransactionHash(blockchainTransactionHash);

			toast.success('Green Card confirmed!');
			navigate('/green-card/verify');
		} catch (error) {
			console.error('Error confirming Green Card:', error);
			toast.error(error);
		}
		setLoading(false);
	};

	return (
		<div>
			<h2>Confirm Green Card on Blockchain</h2>
			<p>
				<strong>Insurance ID:</strong> {insuranceId}
			</p>
			<p>
				<strong>Hash:</strong> {hash}
			</p>
			<button onClick={handleConfirm} disabled={loading}>
				{loading ? 'Confirming...' : 'Store Hash & Confirm'}
			</button>

			{transactionHash && (
				<p>
					<strong>Transaction Hash:</strong> {transactionHash}
				</p>
			)}
		</div>
	);
};

export default ConfirmGreenCard;
