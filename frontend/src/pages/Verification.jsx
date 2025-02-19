import React, { useState } from 'react';
import { LicenseVerification } from '../components/LicenseVerification';
import { GreenCardVerification } from '../components/GreenCardVerification';
import '../styles/Verification.css';

export const Verification = () => {
  const [activeTab, setActiveTab] = useState('license');

  return (
    <div className='verification-page'>
      <h2>Verification</h2>

      <div>
        <button 
          onClick={() => setActiveTab("license")} 
          className={activeTab === "license" ? "active" : ""}
        >
          License Verification
        </button>

        <button 
          onClick={() => setActiveTab("greenCard")} 
          className={activeTab === "greenCard" ? "active" : ""}
        >
          Green Card Verification
        </button>
      </div>

      {activeTab === "license" && <LicenseVerification />}
      {activeTab === "greenCard" && <GreenCardVerification />}
    </div>
  );
};