import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKGROUND_URL;

const RequestGreenCardVerification = () => {
  const [referenceId, setReferenceId] = useState("");

  const handleRequestVerification = async () => {
    if (!referenceId) {
      toast.error("Please enter a reference ID.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/api/v1/green-card/verify`,
        { referenceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Verification request sent successfully!");
    } catch (error) {
      toast.error("Failed to request verification.");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Request Green Card Verification</h2>
      <input
        type="text"
        placeholder="Enter Reference ID"
        value={referenceId}
        onChange={(e) => setReferenceId(e.target.value)}
      />
      <button onClick={handleRequestVerification}>Request Verification</button>
    </div>
  );
};

export default RequestGreenCardVerification;