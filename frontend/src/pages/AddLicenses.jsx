import React, { useState } from "react";
import { addDriversLicense, getLicenseData, addGreenCard } from "../services/HttpClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AddLicenses = () => {
    const [activeForm, setActiveForm] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const [license, setLicense] = useState({
        name: "",
        birthdate: "",
        issueDate: "",
        expiryDate: "",
        licenseType: "",
    });

    // Green Card State
    const [greenCard, setGreenCard] = useState({
        cardNumber: "",
        vehicleInfo: { registrationNumber: "", category: "" },
        policyholder: { name: "", address: "" },
        insuranceCompany: { name: "", address: "", contact: "", code: "" },
        validity: { from: "", to: "" },
        coveredCountries: "",
    });

    const toggleForm = (form) => {
        setActiveForm(activeForm === form ? null : form);
    };

    const handleLicenseChange = (e) => {
        const { name, value } = e.target;
        setLicense((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmitLicense = async (e) => {
        e.preventDefault();
        try {
            const response = await addDriversLicense(license);

            if (response.success) {
                setLicense({
                    name: "",
                    birthdate: "",
                    issueDate: "",
                    expiryDate: "",
                    licenseType: "",
                });
                setErrorMessage("");

                toast.success("Driver's License has been added!");
                navigate("/menu");
            }
        } catch (error) {
            console.error("Error while adding driver's license:", error);
            setErrorMessage(error.response?.data?.error || "An unexpected error occurred. Please try again.");
        }
    };

    // Handle Green Card Input Changes
    const handleGreenCardChange = (e) => {
        const { name, value } = e.target;
    
        setGreenCard((prevState) => {
            // Handle nested properties dynamically
            const keys = name.split("."); // Split nested properties by "."
            if (keys.length === 1) {
                // Direct property (e.g., "cardNumber")
                return { ...prevState, [name]: value };
            } else {
                // Nested property (e.g., "vehicleInfo.registrationNumber")
                return {
                    ...prevState,
                    [keys[0]]: {
                        ...prevState[keys[0]],
                        [keys[1]]: value,
                    },
                };
            }
        });
    };
  
    // Handle Green Card Submission
    const handleSubmitGreenCard = async (e) => {
        e.preventDefault();
        try {
            await addGreenCard(greenCard);
            setGreenCard({
                cardNumber: "",
                vehicleInfo: { registrationNumber: "", category: "" },
                policyholder: { name: "", address: "" },
                insuranceCompany: { name: "", address: "", contact: "", code: "" },
                validity: { from: "", to: "" },
                coveredCountries: "",
            });

            toast.success("Green Card has been added!");
            navigate("/menu");
        } catch (error) {
            setErrorMessage("Failed to add Green Card.");
        }
    };

    const startUiPathJob = async () => {
        try {
            const response = await getLicenseData(); // Calls the backend API
    
            if (response.success) {
                alert("UiPath process started successfully!");
            } else {
                alert("Failed to start process: " + JSON.stringify(response));
            }
        } catch (error) {
            console.error("Error triggering UiPath job:", error);
            alert("An error occurred while triggering the UiPath process.");
        }
    };

    return (
        <div className="container flex flex-column">
            <h1 className="pageheader">Add Licenses</h1>


            <p>Step 1. Log in to Transportstyrelsens "Mina Sidor"</p>
            <a href="https://minasidor.transportstyrelsen.se/" target="_blank" rel="noopener noreferrer">
              <button>Log in to Transportstyrelsen</button>
            </a>
            <br />
            <p>Step 2. Click "Get License Data" to retrieve data automatically</p>
            <button onClick={startUiPathJob}>Get License Data</button>
            <br />
            <button onClick={() => toggleForm("license")}>Add Driver's License</button>
            <button onClick={() => toggleForm("greenCard")}>Add Green Card</button>

            {activeForm === "license" && (
                <form className="forms" onSubmit={handleSubmitLicense}>
                    <label>Name: </label>
                    <input type="text" name="name" value={license.name} onChange={handleLicenseChange} required />

                    <label>Personal Identity Number: </label>
                    <input type="text" name="birthdate" value={license.birthdate} onChange={handleLicenseChange} required />

                    <label>Issue Date: </label>
                    <input type="text" name="issueDate" value={license.issueDate} onChange={handleLicenseChange} required />

                    <label>Expiry Date: </label>
                    <input type="text" name="expiryDate" value={license.expiryDate} onChange={handleLicenseChange} required />

                    <label>License Type: </label>
                    <input type="text" name="licenseType" value={license.licenseType} onChange={handleLicenseChange} required />

                    {errorMessage && <p className="error">{errorMessage}</p>}

                    <button type="submit">Add</button>
                </form>
            )}

            {/* Green Card Form */}
            {activeForm === "greenCard" && (
                <form className="forms" onSubmit={handleSubmitGreenCard}>
                <label>Card Number:</label>
                <input type="text" name="cardNumber" value={greenCard.cardNumber} onChange={handleGreenCardChange} required />
            
                <label>Vehicle Registration Number:</label>
                <input type="text" name="vehicleInfo.registrationNumber" value={greenCard.vehicleInfo.registrationNumber} onChange={handleGreenCardChange} required />
            
                <label>Vehicle Category:</label>
                <input type="text" name="vehicleInfo.category" value={greenCard.vehicleInfo.category} onChange={handleGreenCardChange} required />
            
                <label>Policyholder Name:</label>
                <input type="text" name="policyholder.name" value={greenCard.policyholder.name} onChange={handleGreenCardChange} required />
            
                <label>Policyholder Address:</label>
                <input type="text" name="policyholder.address" value={greenCard.policyholder.address} onChange={handleGreenCardChange} required />
            
                <label>Insurance Company Name:</label>
                <input type="text" name="insuranceCompany.name" value={greenCard.insuranceCompany.name} onChange={handleGreenCardChange} required />
            
                <label>Insurance Company Address:</label>
                <input type="text" name="insuranceCompany.address" value={greenCard.insuranceCompany.address} onChange={handleGreenCardChange} required />
            
                <label>Insurance Company Contact:</label>
                <input type="text" name="insuranceCompany.contact" value={greenCard.insuranceCompany.contact} onChange={handleGreenCardChange} required />
            
                <label>Insurance Code:</label>
                <input type="text" name="insuranceCompany.code" value={greenCard.insuranceCompany.code} onChange={handleGreenCardChange} required />
            
                <label>Validity From:</label>
                <input type="date" name="validity.from" value={greenCard.validity.from} onChange={handleGreenCardChange} required />
            
                <label>Validity To:</label>
                <input type="date" name="validity.to" value={greenCard.validity.to} onChange={handleGreenCardChange} required />
            
                <label>Covered Countries (comma-separated):</label>
                <input type="text" name="coveredCountries" value={greenCard.coveredCountries} onChange={handleGreenCardChange} required />
            
                <button type="submit">Add Green Card</button>
            </form>
            )}
        </div>
    );
};
