import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	getNotificationStatus,
	approveGreenCardVerification,
	declineGreenCardVerification,
} from '../services/HttpClient';

const ApproveGreenCardVerification = () => {
	const { requestId } = useParams();
	const [notificationStatus, setNotificationStatus] = useState('');
	const [statusMessage, setStatusMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchNotificationStatus = async () => {
			try {
				console.log(
					`📡 Fetching notification status for: ${requestId}`
				);

				const response = await getNotificationStatus(
					requestId,
					'greenCard'
				);

				console.log('✅ Notification status:', response);
				setNotificationStatus(response.data);
			} catch (error) {
				console.error('❌ Failed to fetch notification status:', error);
			}
		};

		fetchNotificationStatus();
	}, [requestId]);

	const handleAccept = async () => {
		setIsLoading(true);
		try {
			const response = await approveGreenCardVerification(requestId);
			setStatusMessage(response.message);
			const updatedStatus = await getNotificationStatus(
				requestId,
				'greenCard'
			);
			setNotificationStatus(updatedStatus.data);
		} catch (error) {
			setStatusMessage(
				error.response?.data?.error ||
					'An error occurred during approval.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDecline = async () => {
		setIsLoading(true);
		try {
			const response = await declineGreenCardVerification(requestId);
			setStatusMessage(response.message);
			const updatedStatus = await getNotificationStatus(
				requestId,
				'greenCard'
			);
			setNotificationStatus(updatedStatus.data);
		} catch (error) {
			setStatusMessage(
				error.response?.data?.error ||
					'An error occurred during decline.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='container flex flex-column'>
			<h2>Approve Green Card Verification</h2>
			<p>Status: {notificationStatus?.status}</p>

			<button onClick={handleAccept}>Accept Verification</button>
			<button onClick={handleDecline}>Decline Verification</button>

			{isLoading && <p>Awaiting response...</p>}
			{statusMessage && <p className='statusmessage'>{statusMessage}</p>}
		</div>
	);
};

export default ApproveGreenCardVerification;
