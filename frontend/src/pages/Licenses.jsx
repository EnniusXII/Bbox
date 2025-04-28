import React, { useState } from 'react';
import { getLicenseData } from "../services/HttpClient";
import { toast } from "react-toastify";

export const Licenses = ({ driversLicenses = [] }) => {
	const [openIndexes, setOpenIndexes] = useState({});

	const toggleVerifySection = (index) => {
		setOpenIndexes((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const startUiPathJob = async () => {
        try {
            const response = await getLicenseData();
    
            if (response.success) {
                toast.success("UiPath process started successfully!");
            } else {
                toast.error("Failed to start process: " + JSON.stringify(response));
            }
        } catch (error) {
            console.error("Error triggering UiPath job:", error);
            alert("An error occurred while triggering the UiPath process.");
        }
    };

	return (
		<div className="container flex flex-column">
			<h2>Driver's Licenses</h2>
			{driversLicenses.length > 0 ? (
				driversLicenses.map((license, index) => (
					<div className="card" key={license._id}>
						<div className="card-header">
							{license.licenseType} License
						</div>
						<div className="card-body">
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
							<button onClick={() => toggleVerifySection(index)}>
								{openIndexes[index] ? 'Close Verification' : 'Verify License'}
							</button>

							{openIndexes[index] && (
								<div className="verify-section">
									<p>Step 1. Log in to Transportstyrelsens "Mina Sidor"</p>
									<a
										href="https://minasidor.transportstyrelsen.se/"
										target="_blank"
										rel="noopener noreferrer"
									>
										<button>Log in to Transportstyrelsen</button>
									</a>
									<p>Step 2. Click Verify to trigger automatic verification</p>
									<button onClick={startUiPathJob}>Verify</button>
								</div>
							)}
						</div>
					</div>
				))
			) : (
				<p>No Driver's Licenses found.</p>
			)}
		</div>
	);
};