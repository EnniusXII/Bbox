import { useState } from "react";
import { createGreenCard, confirmGreenCard } from "../services/BlockchainServices";
import { toast } from "react-toastify";

const CreateGreenCard = () => {
  const [formData, setFormData] = useState({
    insured: { name: "", address: "" },
    vehicle: { registrationNumber: "", category: "" },
    insurance: { companyName: "" },
    validity: { from: "", to: "" },
    countriesCovered: "",
  });

  const [referenceId, setReferenceId] = useState(null);
  const [hash, setHash] = useState(null);
  const [created, setCreated] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Handle input changes (nested objects and array fields)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "countriesCovered") {
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Store as a comma-separated string
      }));
    } else {
      const keys = name.split(".");
      setFormData((prev) => {
        let updatedForm = { ...prev };
        let ref = updatedForm;

        for (let i = 0; i < keys.length - 1; i++) {
          ref = ref[keys[i]];
        }

        ref[keys[keys.length - 1]] = value;
        return { ...updatedForm };
      });
    }
  };

  const handleCreateGreenCard = async () => {
    try {
      const formattedData = {
        insured: {
          name: formData.insured.name,
          address: formData.insured.address,
        },
        vehicle: {
          registrationNumber: formData.vehicle.registrationNumber,
          category: formData.vehicle.category,
        },
        insurance: {
          companyName: formData.insurance.companyName,
        },
        validity: {
          from: formData.validity.from,
          to: formData.validity.to,
        },
        countriesCovered: formData.countriesCovered
          ? formData.countriesCovered.split(",").map((c) => c.trim())
          : [],
      };

      const response = await createGreenCard(formattedData);
      setReferenceId(response.referenceId);
      setHash(response.hash);
      setCreated(true);
      toast.success("✅ Green Card created successfully!");
    } catch (error) {
      toast.error("❌ Failed to create Green Card.");
      console.error("Error:", error);
    }
  };

  const handleConfirmGreenCard = async () => {
    if (!referenceId || !hash) {
      toast.error("❌ Reference ID and hash are missing.");
      return;
    }

    try {
      setConfirming(true);
      const txHash = await confirmGreenCard(referenceId, hash);
      toast.success(`✅ Green Card confirmed! TX: ${txHash}`);
    } catch (error) {
      toast.error("❌ Failed to confirm Green Card.");
      console.error("Error:", error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <h2>Create Green Card</h2>
      
      {/* Insured Details */}
      <input type="text" name="insured.name" value={formData.insured.name} onChange={handleChange} placeholder="Insured Name" />
      <input type="text" name="insured.address" value={formData.insured.address} onChange={handleChange} placeholder="Address" />
      
      {/* Vehicle Details */}
      <input type="text" name="vehicle.registrationNumber" value={formData.vehicle.registrationNumber} onChange={handleChange} placeholder="Registration Number" />
      <input type="text" name="vehicle.category" value={formData.vehicle.category} onChange={handleChange} placeholder="Vehicle Category" />
      
      {/* Insurance Company */}
      <input type="text" name="insurance.companyName" value={formData.insurance.companyName} onChange={handleChange} placeholder="Insurance Company" />
      
      {/* Validity Period */}
      <input type="date" name="validity.from" value={formData.validity.from} onChange={handleChange} />
      <input type="date" name="validity.to" value={formData.validity.to} onChange={handleChange} />
      
      {/* Countries Covered */}
      <input
        type="text"
        name="countriesCovered"
        value={formData.countriesCovered}
        onChange={handleChange}
        placeholder="Countries Covered (comma separated)"
      />

      <button onClick={handleCreateGreenCard}>Create Green Card</button>

      {created && (
        <button onClick={handleConfirmGreenCard} disabled={confirming}>
          {confirming ? "Confirming..." : "Confirm & Store on Blockchain"}
        </button>
      )}
    </div>
  );
};

export default CreateGreenCard;