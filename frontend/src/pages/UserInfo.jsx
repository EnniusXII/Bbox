import React, { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { getUserInfo, updateUserInfo } from '../services/HttpClient';

const UserInfo = () => {
	const [userInfo, setUserInfo] = useState(null);
	const [formData, setFormData] = useState({ phoneNumber: '', selfie: '' });
	const [loading, setLoading] = useState(true);
	const [successMessage, setSuccessMessage] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [videoRef, setVideoRef] = useState(null);
	const [streaming, setStreaming] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getUserInfo();
				setUserInfo(data);
				setFormData({
					phoneNumber: data.phoneNumber || '',
					selfie: data.selfie || '',
				});
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await updateUserInfo(formData.phoneNumber, formData.selfie);
			setSuccessMessage('User info updated successfully!');
		} catch (err) {
			alert('Error updating user info');
		}
	};

	const dataURLtoFile = (dataurl, filename) => {
		const arr = dataurl.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	};

	if (loading || !userInfo) return <p>Laddar användarinformation...</p>;

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			if (videoRef) {
				videoRef.srcObject = stream;
				setStreaming(true);
			}
		} catch (err) {
			console.error('Failed to access camera', err);
		}
	};

	const captureImage = async () => {
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.videoWidth;
		canvas.height = videoRef.videoHeight;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
		const imageData = canvas.toDataURL('image/png');

		try {
			const imageFile = dataURLtoFile(imageData, 'selfie.png');
			const compressed = await imageCompression(imageFile, {
				maxSizeMB: 0.2,
			});
			const compressedDataUrl = await imageCompression.getDataUrlFromFile(
				compressed
			);
			setFormData((prev) => ({ ...prev, selfie: compressedDataUrl }));
		} catch (err) {
			console.error('Image compression failed', err);
		}
	};

	return (
		<div className='container'>
			<h1>Din information</h1>

			<div className='profile-picture'>
				{userInfo.selfie ? (
					<img
						src={userInfo.selfie}
						alt='Selfie'
						style={{
							width: '150px',
							height: '150px',
							objectFit: 'cover',
							borderRadius: '50%',
						}}
					/>
				) : (
					<div className='placeholder'>Ingen selfie uppladdad</div>
				)}
			</div>
			<p>
				<strong>Email:</strong> {userInfo.email}
			</p>

			{userInfo.hasLicense ? (
				<>
					<p>
						<strong>Name:</strong> {userInfo.firstName}{' '}
						{userInfo.lastName}
					</p>
					<p>
						<strong>Phone Number:</strong>{' '}
						{userInfo.phoneNumber || 'Add your phone number'}
					</p>
				</>
			) : (
				<p>Du har ännu inte lagt till ditt körkort.</p>
			)}

			{!editMode && (
				<button
					onClick={() => setEditMode(true)}
					className='edit-button'
				>
					Redigera
				</button>
			)}

			{editMode && (
				<form onSubmit={handleSubmit} className='user-info-form'>
					<div className='form-group'>
						<label>Telefonnummer</label>
						<input
							type='tel'
							name='phoneNumber'
							value={formData.phoneNumber}
							onChange={handleChange}
							pattern='^\+\d{2}\d{9}$'
							placeholder='+46123456789'
							className='form-control'
							required
						/>
					</div>

					<div className='form-group'>
						<label>Ta en selfie direkt</label>
						<div>
							<video
								ref={(ref) => setVideoRef(ref)}
								autoPlay
								playsInline
								width='100%'
								style={{ maxWidth: '300px' }}
							/>
							{!streaming && (
								<button type='button' onClick={startCamera}>
									Starta Kamera
								</button>
							)}
							<button type='button' onClick={captureImage}>
								Ta Bild
							</button>
						</div>
					</div>

					{formData.selfie && (
						<div className='preview'>
							<img src={formData.selfie} alt='Selfie preview' />
						</div>
					)}

					<button type='submit' className='submit-button'>
						Spara ändringar
					</button>
				</form>
			)}

			{successMessage && (
				<p className='success-message'>{successMessage}</p>
			)}
		</div>
	);
};

export default UserInfo;
