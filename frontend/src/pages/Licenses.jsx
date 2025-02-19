import React from 'react';

export const Licenses = ({ driversLicenses = [] }) => {
	console.log('Drivers Licenses Data:', driversLicenses); // 🔍 Debug log

	return (
		<div>
			<h2>Driver's Licenses</h2>
			{driversLicenses.length > 0 ? (
				driversLicenses.map((license) => {
					console.log('License Entry:', license); // 🔍 Debug log for each license

					return (
						<div className='card' key={license._id}>
							<p>License Type: {license.licenseType}</p>
							<p>Name: {license.name}</p>
							<p>Last Name: {license.lastName}</p>
							<p>
								Birthdate:{' '}
								{license.birthdate &&
								typeof license.birthdate === 'string'
									? license.birthdate.split('T')[0]
									: 'N/A'}
							</p>
						</div>
					);
				})
			) : (
				<p>No licenses found</p>
			)}
		</div>
	);
};
