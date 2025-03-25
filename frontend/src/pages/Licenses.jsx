import React, { useState } from 'react';

export const Licenses = ({ driversLicenses = [] }) => {
	return (
		<div className='container flex flex-column'>
			<h2>Driver's Licenses</h2>
			{driversLicenses.length > 0 ? (
				driversLicenses.map((license, index) => (
					<div className='card' key={license._id}>
						<div className='card-header'>
							{license.licenseType} License
						</div>
						<div className='card-body'>
							<p>Last Name: {license.lastName}</p>
							<p>First Name: {license.firstName}</p>
							<p>Birthdate: {license.birthDate.split('T')[0]}</p>
							<p>
								Effective Period:{' '}
								{license.issueDate.split('T')[0]} -{' '}
								{license.expiryDate.split('T')[0]}
							</p>
							<p>Issuer: {license.issuer}</p>
							<p>Reference Number: {license.referenceNumber}</p>
							<p>License Number: {license.licenseNumber}</p>
							<p>
								License Categories:{' '}
								{license.licenseTypes.join(', ')}
							</p>
						</div>
					</div>
				))
			) : (
				<p>No Driver's Licenses found.</p>
			)}
		</div>
	);
};
