import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGreenCard } from "../services/HttpClient";
import { toast } from "react-toastify";

const CreateGreenCard = () => {
  const [insuredName, setInsuredName] = useState("");
  const [validityFrom, setValidityFrom] = useState("");
  const [validityTo, setValidityTo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Get the JWT token

    if (!token) {
      toast.error("You must be logged in to create a Green Card.");
      return;
    }

    try {
      const greenCardData = {
        insured: { name: insuredName },
        validity: { from: validityFrom, to: validityTo },
      };

      const response = await createGreenCard(greenCardData, token);
      toast.success("Green Card created successfully!");
      navigate(`/green-card/confirm?insuranceId=${response.insuranceId}&hash=${response.hash}`);
    } catch (error) {
      console.error("Error creating Green Card:", error);
      toast.error(error);
    }
  };

  return (
    <div>
      <h2>Create Green Card</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Insured Name" value={insuredName} onChange={(e) => setInsuredName(e.target.value)} required />
        <input type="date" value={validityFrom} onChange={(e) => setValidityFrom(e.target.value)} required />
        <input type="date" value={validityTo} onChange={(e) => setValidityTo(e.target.value)} required />
        <button type="submit">Generate Insurance ID</button>
      </form>
    </div>
  );
};

export default CreateGreenCard;