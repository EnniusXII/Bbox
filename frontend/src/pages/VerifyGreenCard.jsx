import { useState } from "react";
import { verifyGreenCard } from "../services/BlockchainServices";
import { toast } from "react-toastify";

const VerifyGreenCard = () => {
  const [referenceId, setReferenceId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!referenceId) {
      toast.error("Please enter a Reference ID.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyGreenCard(referenceId);
      setVerificationResult(result);

      toast.success(result.message);
    } catch (error) {
      toast.error("Verification failed.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Verify Green Card</h2>
      <input
        type="text"
        placeholder="Enter Reference ID"
        value={referenceId}
        onChange={(e) => setReferenceId(e.target.value)}
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify Green Card"}
      </button>

      {verificationResult && (
        <div>
          <h3>Verification Result:</h3>
          <p><strong>Status:</strong> {verificationResult.verified ? "✅ Valid" : "❌ Invalid"}</p>
          <p><strong>Stored Hash:</strong> {verificationResult.storedHash}</p>
          <p><strong>Computed Hash:</strong> {verificationResult.computedHash}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyGreenCard;