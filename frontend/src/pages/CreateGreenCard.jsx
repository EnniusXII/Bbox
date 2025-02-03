import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CreateGreenCard = () => {
  const [insuredName, setInsuredName] = useState("");
  const [validityFrom, setValidityFrom] = useState("");
  const [validityTo, setValidityTo] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/green-card/addGreenCard`, {
        insured: { name: insuredName },
        validity: { from: validityFrom, to: validityTo },
      });

      setInsuranceId(response.data.insuranceId);
      setHash(response.data.hash);
      alert("Green Card created! Proceed to store hash on blockchain.");
      setLoading(false);
    } catch (error) {
      console.error("Error creating Green Card:", error);
      alert("Failed to create Green Card.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Green Card</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Insured Name" value={insuredName} onChange={(e) => setInsuredName(e.target.value)} required />
        <input type="date" value={validityFrom} onChange={(e) => setValidityFrom(e.target.value)} required />
        <input type="date" value={validityTo} onChange={(e) => setValidityTo(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Generate Insurance ID"}</button>
      </form>

      {insuranceId && (
        <div>
          <p><strong>Insurance ID:</strong> {insuranceId}</p>
          <p><strong>Hash:</strong> {hash}</p>
          <button onClick={() => navigate(`/green-card/confirm?insuranceId=${insuranceId}&hash=${hash}`)}>
            Proceed to Confirm on Blockchain
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateGreenCard;