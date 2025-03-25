import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const login = async (email, password) => {
	try {
		const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
			email,
			password,
		});

		return response.data;
	} catch (error) {
		console.error('Error logging in:', error);
	}
};

export const register = async (name, email, password) => {
	const registerData = { name, email, password };

	const response = await axios.post(
		`${BACKEND_URL}/api/v1/auth/register`,
		registerData
	);

	return response.data;
};

export const getUserDetails = async () => {
	const token = localStorage.getItem('token');

	const response = await axios.get(`${BACKEND_URL}/api/v1/auth/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return response.data;
};

export const addDriversLicense = async (licenseData) => {
	const response = await axios.post(
		`${BACKEND_URL}/api/v1/licenses/addDriversLicense`,
		licenseData,
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		}
	);

	return response.data; // 👈 fix: only return data
};

export const getDriversLicenses = async () => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.get(
			`${BACKEND_URL}/api/v1/licenses/getDriversLicense`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	} catch (error) {
		throw (
			error.response?.data?.message ||
			"An error occurred while fetching driver's licenses"
		);
	}
};

export const verifyDriverLicense = async ({ lastName, name, licenseType }) => {
	const response = await axios.post(`${BACKEND_URL}/api/v1/verify`, {
		lastName,
		name,
		licenseType,
	});

	return response.data;
};

export const approveLicenseVerification = async (
	requestId,
	{ lastName, licenseType }
) => {
	const token = localStorage.getItem('token');
	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/verify/approve/${requestId}`,
			{ lastName, licenseType }, // Send data in the request body
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error('Approval request error:', error.response || error);
		throw error;
	}
};

export const declineLicenseVerification = async (requestId) => {
	const token = localStorage.getItem('token');
	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/verify/decline/${requestId}`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`, // Include token in headers
				},
			}
		);
		console.log('Decline response:', response); // Log response to verify it's successful
		return response.data;
	} catch (error) {
		console.error('Decline request error:', error.response || error); // Log detailed error response
		throw error; // Propagate error to the calling function
	}
};

export const getNotifications = async () => {
	const token = localStorage.getItem('token');

	try {
		// Fetch License Notifications
		const licenseNotificationsResponse = await axios.get(
			`${BACKEND_URL}/api/v1/notifications`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		// Fetch Green Card Notifications
		const greenCardNotificationsResponse = await axios.get(
			`${BACKEND_URL}/api/v1/gc-notifications`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		// Merge notifications and sort by date (newest first)
		const mergedNotifications = [
			...licenseNotificationsResponse.data.data,
			...greenCardNotificationsResponse.data.data,
		].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return mergedNotifications;
	} catch (err) {
		console.error('Error fetching notifications:', err);
		throw err.response?.data?.message || 'Failed to fetch notifications';
	}
};

export const getNotificationStatus = async (requestId, type = 'license') => {
	const token = localStorage.getItem('token');

	try {
		const endpoint =
			type === 'greenCard'
				? `${BACKEND_URL}/api/v1/gc-notifications/${requestId}`
				: `${BACKEND_URL}/api/v1/notifications/${requestId}`;

		const response = await axios.get(endpoint, {
			headers: { Authorization: `Bearer ${token}` },
		});

		return response.data;
	} catch (err) {
		throw (
			err.response?.data?.message || 'Failed to fetch notification status'
		);
	}
};

export const getRequests = async () => {
	const token = localStorage.getItem('token');

	const response = await axios.get(`${BACKEND_URL}/api/v1/requests`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return response.data;
};

export const getRequestInfo = async (requestId) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.get(
			`${BACKEND_URL}/api/v1/requests/${requestId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error('Error fetching request info:', error);
		throw error;
	}
};

export const markNotificationAsRead = async (notificationId) => {
	const token = localStorage.getItem('token');

	const response = await axios.put(
		`${BACKEND_URL}/api/v1/notifications/${notificationId}/read`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	return response.data;
};

export const createGreenCard = async (greenCardData) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/green-card/create`,
			greenCardData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);
		return response.data;
	} catch (err) {
		console.error('Error creating Green Card: ', err);
		throw err.response?.data?.message || 'Failed to create Green Card';
	}
};

export const confirmGreenCard = async (insuranceId, transactionHash, hash) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/green-card/confirm`,
			{ insuranceId, transactionHash, hash },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);
		return response.data;
	} catch (err) {
		console.error('Error confirming Green Card: ', err);
		throw err.response?.data?.message || 'Failed to confirm Green Card';
	}
};

export const verifyGreenCard = async (referenceId) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/green-card/verify`,
			{ referenceId },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);
		return response.data;
	} catch (err) {
		console.error('Error verifying Green Card: ', err);
		throw err.response?.data?.message || 'Failed to verify Green Card';
	}
};

export const approveGreenCardVerification = async (requestId) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/gc-verification/approve/${requestId}`, // Verify if the URL is correct
			{}, // Ensure you're sending the expected body
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	} catch (err) {
		throw err.response?.data || 'Failed to approve Green Card verification';
	}
};

export const declineGreenCardVerification = async (requestId) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.post(
			`${BACKEND_URL}/api/v1/gc-verification/decline/${requestId}`,
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return response.data;
	} catch (err) {
		throw err.response?.data?.message || 'Failed to decline verification';
	}
};

export const downloadGreenCard = async (fileId) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.get(
			`${BACKEND_URL}/api/v1/green-card/download/${fileId}`,
			{
				responseType: 'blob',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `green_card_${fileId}.pdf`);
		document.body.appendChild(link);
		link.click();
		link.remove();
	} catch (err) {
		console.error('Failed downloading Green Card: ', err);
		throw err.response?.data?.message || 'Failed to download Green Card';
	}
};

export const getGreenCards = async () => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.get(
			`${BACKEND_URL}/api/v1/green-card/getGreenCard`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	} catch (err) {
		console.error('Error fetching Green Cards: ', err);

		if (err.response?.status === 404) {
			return { success: true, data: [] };
		}

		throw err.response?.data?.message || 'Failed to fetch Green Cards';
	}
};

export const updateLicenseNFT = async (licenseId, nftData) => {
	const token = localStorage.getItem('token');

	try {
		const response = await axios.patch(
			`${BACKEND_URL}/api/v1/licenses/nft/${licenseId}`,
			nftData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		return response.data;
	} catch (err) {
		console.error('Error updating license NFT data: ', err);
		throw (
			err.response?.data?.message || 'Failed to update license NFT data'
		);
	}
};
