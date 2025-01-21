import React, { useState } from 'react';
import { verifyDriverLicense } from '../services/HttpClient';
import { useNavigate } from 'react-router-dom';

export const Verification = () => {
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await verifyDriverLicense({lastName, name, licenseType});
      if (response.requestId) {
        navigate(`/verification-status/${response.requestId}`);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setStatusMessage(error.response?.data?.error || "An error occurred during verification.");
    }
  };

  return (
    <div className='container flex flex-column'>
      <h2>Verify Driver's License</h2>
      <form className='forms' onSubmit={handleVerify}>
        <label>Last Name: </label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <label>Name: </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

        <label>License Type: </label>
        <input type="text" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} />

        <button type="submit">Verify</button>
      </form>

      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};