import React, { useState } from "react";
import { generateGreenCardNFT, getDriversLicenses, getGreenCards } from "../services/HttpClient";
import { toast } from "react-toastify";
import axios from 'axios';

export const Licenses = () => {
  const [driversLicenses, setDriversLicenses] = useState([]);
  const [greenCards, setGreenCards] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [nftLoading, setNftLoading] = useState(null); // Store Green Card ID for NFT Loading
  const [nftImages, setNftImages] = useState({});

  // Fetch Driver's Licenses
  const fetchDriversLicenses = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getDriversLicenses();
      setDriversLicenses(data.data);
    } catch (error) {
      setDriversLicenses([]);
      setErrorMessage(error.message || "Failed to fetch Driver's Licenses.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Green Cards
  const fetchGreenCards = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getGreenCards();
      setGreenCards(data.data);
    } catch (error) {
      setGreenCards([]);
      setErrorMessage(error.message || "Failed to fetch Green Cards.");
    } finally {
      setLoading(false);
    }
  };

  // Generate NFT for Green Card
  const handleGenerateNFT = async (greenCardId) => {
    setNftLoading(greenCardId); // Set loading state for specific card
    toast.info("Generating Green Card NFT...");

    try {
        const response = await generateGreenCardNFT(greenCardId);
        toast.success(`NFT created successfully! TX Hash: ${response.transactionHash}`);

        await fetchGreenCards();
    } catch (error) {
        console.error("NFT Generation Error:", error);

        // Extract smart contract revert message
        let errorMessage = "Failed to create Green Card NFT. Please try again.";
        
        if (error?.response?.data?.error) {
            // Backend error response (if applicable)
            errorMessage = error.response.data.error;
        } else if (error.reason) {
            // Ethers.js contract error (explicit revert message)
            errorMessage = error.reason;
        } else if (error.data?.message) {
            // Some Ethereum errors include 'data.message'
            errorMessage = error.data.message;
        } else if (error.message.includes("revert")) {
            // General transaction revert message
            errorMessage = `Transaction reverted: ${error.message.split("revert")[1]}`;
        }

        toast.error(errorMessage);
    } finally {
        setNftLoading(null); // Reset loading state
    }
};

const handleViewNFT = async (greenCardId, metadataUrl) => {
  try {
    const metadataResponse = await axios.get(metadataUrl);
    const imageUrl = metadataResponse.data.image;

    setNftImages((prevImages) => ({
      ...prevImages,
      [greenCardId]: imageUrl,
    }));
  } catch (error) {
    toast.error("Unable to fetch NFT image.");
    console.error(error);
  }
};

  return (
    <div className="container flex flex-column">
      <h1 className="pageheader">Licenses</h1>

      {/* Fetch Buttons */}
      <button onClick={fetchDriversLicenses}>Show Driver's Licenses</button>
      <button onClick={fetchGreenCards}>Show Green Cards</button>

      {/* Loading State */}
      {loading ? <p>Loading...</p> : (
        <>
          {/* Display Driver's Licenses */}
          {driversLicenses.length > 0 ? (
            <div>
              <h2>Driver's Licenses</h2>
              {driversLicenses.map((license) => (
                <div className="card" key={license._id}>
                  <div className="card-header">{license.licenseType} License</div>
                  <div className="card-body">
                    <p>First Name: {license.name}</p>
                    <p>Last Name: {license.lastName}</p>
                    <p>Birthdate: {license.birthdate?.split("T")[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>{errorMessage}</p>}

          {/* Display Green Cards */}
          {greenCards.length > 0 ? (
            <div>
              <h2>Green Cards</h2>
              {greenCards.map((card) => (
                <div className="card" key={card._id}>
                  <div className="card-header">Green Card #{card.cardNumber}</div>
                  <div className="card-body">
                    <p><strong>Registration Number:</strong> {card.vehicleInfo?.registrationNumber || "N/A"}</p>
                    <p><strong>Category:</strong> {card.vehicleInfo?.category || "N/A"}</p>
                    <p><strong>Policyholder:</strong> {card.policyholder?.name || "N/A"}</p>
                    <p><strong>Policyholder Address:</strong> {card.policyholder?.address || "N/A"}</p>
                    <p><strong>Insurance Company:</strong> {card.insuranceCompany?.name || "N/A"}</p>
                    <p><strong>Insurance Contact:</strong> {card.insuranceCompany?.contact || "N/A"}</p>
                    <p><strong>Validity:</strong> 
                      {card.validity?.from ? card.validity.from.split("T")[0] : "N/A"} 
                      {" to "} 
                      {card.validity?.to ? card.validity.to.split("T")[0] : "N/A"}
                    </p>
                    <p><strong>Covered Countries:</strong> {card.coveredCountries?.length ? card.coveredCountries.join(", ") : "N/A"}</p>
                  </div>

                  {/* NFT Button with Loading State */}
                  <button onClick={() => handleGenerateNFT(card._id)} disabled={nftLoading === card._id}>
                    {nftLoading === card._id ? "Generating NFT..." : "Create Green Card NFT"}
                  </button>

                  {card.nftMetadataUrl && (
                    <>
                      <button onClick={() => handleViewNFT(card._id, card.nftMetadataUrl)}>
                        View NFT
                      </button>
                      
                      {nftImages[card._id] && (
                        <img 
                          src={nftImages[card._id]} 
                          alt="Green Card NFT" 
                          style={{ width: "200px", marginTop: "10px" }}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : <p>{errorMessage}</p>}
        </>
      )}
    </div>
  );
};