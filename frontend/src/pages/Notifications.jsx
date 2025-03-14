import React, { useState, useEffect } from 'react';
import {
	getNotifications,
	markNotificationAsRead,
} from '../services/HttpClient';
import { Link } from 'react-router-dom';

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		const fetchNotifications = async () => {
			try {
				const mergedNotifications = await getNotifications();
				setNotifications(mergedNotifications);
			} catch (error) {
				console.error('Error fetching notifications:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNotifications();
	}, []);

	const handleMarkAsRead = async (id) => {
		try {
			await markNotificationAsRead(id);
			setNotifications(
				notifications.filter((notification) => notification._id !== id)
			);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	return (
		<div className='container'>
			<h2>Your Notifications</h2>

			{isLoading && <p>Loading Notifications...</p>}

			{notifications.map((notification, index) => (
				<div className='card' key={notification._id}>
					<div className='card-header'>
						#{notifications.length - index} - Id: {notification._id}
					</div>
					<div className='card-body'>
						<p>
							Created at:{' '}
							{new Date(notification.createdAt).toLocaleString()}
						</p>
						<p>{notification.message}</p>
						<p>Status: {notification.status}</p>
						<br />

						{/* Detect if it's a License or Green Card notification */}
						{notification.licenseType ? (
							<p>
								<Link
									to={`/approve/${notification._id}`}
									state={{ notification }}
								>
									Approve/Decline License Verification
								</Link>
							</p>
						) : notification.referenceId ? (
							<p>
								<Link
									to={`/approve-green-card/${notification._id}`}
									state={{ notification }}
								>
									Approve/Decline Green Card Verification
								</Link>
							</p>
						) : (
							<p>Unknown Notification Type</p>
						)}

						<button
							onClick={() => handleMarkAsRead(notification._id)}
						>
							Mark as Read
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default Notifications;
