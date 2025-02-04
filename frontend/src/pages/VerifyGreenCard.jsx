import React, { useState } from "react";
import { getStoredHash } from "../services/BlockchainServices";
import { useNavigate } from "react-router-dom";

const VerifyGreenCard = () => {
  const [insuranceId, setInsuranceId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const storedHash = await getStoredHash(insuranceId);
      alert(`Stored Hash Retrieved: ${storedHash}`);
      setVerificationResult("Verification Successful");
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult("Verification Failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Verify Green Card</h2>
      <input type="text" placeholder="Enter Insurance ID" value={insuranceId} onChange={(e) => setInsuranceId(e.target.value)} />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
      {verificationResult && <p>{verificationResult}</p>}
    </div>
  );
};

export default VerifyGreenCard;