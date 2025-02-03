import React, { useState, useEffect } from "react";
import { storeGreenCardHash, confirmGreenCard } from "../utils/blockchainServices";
import { useSearchParams, useNavigate } from "react-router-dom";

const ConfirmGreenCard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const insuranceId = searchParams.get("insuranceId");
  const hash = searchParams.get("hash");
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!insuranceId || !hash) {
      alert("Missing Insurance ID or Hash");
      navigate("/green-card/create");
    }
  }, [insuranceId, hash, navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const txHash = await storeGreenCardHash({ insuranceId, hash });
      setTransactionHash(txHash);

      await confirmGreenCard({ insuranceId, transactionHash: txHash, hash });

      alert("Green Card confirmed!");
      navigate("/green-card/verify");
    } catch (error) {
      console.error("Error storing hash:", error);
      alert("Failed to confirm Green Card.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Confirm Green Card on Blockchain</h2>
      <p><strong>Insurance ID:</strong> {insuranceId}</p>
      <p><strong>Hash:</strong> {hash}</p>
      <button onClick={handleConfirm} disabled={loading}>
        {loading ? "Confirming..." : "Store Hash & Confirm"}
      </button>

      {transactionHash && <p><strong>Transaction Hash:</strong> {transactionHash}</p>}
    </div>
  );
};

export default ConfirmGreenCard;