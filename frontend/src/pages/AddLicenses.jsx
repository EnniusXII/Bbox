import React, { useState } from "react";
import { addDriversLicense, getLicenseData } from "../services/HttpClient";
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
        </div>
    );
};
