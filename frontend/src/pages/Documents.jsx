import React, { useEffect, useState } from 'react';
import '../styles/Documents.css';
import { Licenses } from './Licenses';
import { GreenCards } from '../components/GreenCards';
import { getGreenCards, getDriversLicenses } from '../services/HttpClient';
import axios from 'axios';
import { toast } from 'react-toastify';
import { generateGreenCardNFT } from '../services/BlockchainServices';

export const Documents = () => {
  const [driversLicenses, setDriversLicenses] = useState([]);
  const [greenCards, setGreenCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [nftLoading, setNftLoading] = useState(null);
  const [nftImages, setNftImages] = useState({});

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Fetch licenses
      const licensesResponse = await getDriversLicenses();
      setDriversLicenses(licensesResponse?.data || []);
      // Fetch green cards
      const greenCardsResponse = await getGreenCards();
      setGreenCards(greenCardsResponse?.data || []);
    } catch (error) {
      setErrorMessage('Failed to fetch documents');
      console.error(' Documents Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleGenerateNFT = async (greenCardId) => {
    setNftLoading(greenCardId);
    toast.info("Generating Green Card NFT...");
    try {
      const response = await generateGreenCardNFT(greenCardId);
      toast.success(`NFT created successfully! TX Hash: ${response.transactionHash}`);
      // Refresh green cards after NFT generation
      const greenCardsResponse = await getGreenCards();
      setGreenCards(greenCardsResponse?.data || []);
    } catch (error) {
      let errMsg = "Failed to create Green Card NFT. Please try again.";
      if (error?.response?.data?.error) {
        errMsg = error.response.data.error;
      } else if (error.reason) {
        errMsg = error.reason;
      } else if (error.data?.message) {
        errMsg = error.data.message;
      } else if (error.message.includes("revert")) {
        errMsg = `Transaction reverted: ${error.message.split("revert")[1]}`;
      }
      toast.error(errMsg);
    } finally {
      setNftLoading(null);
    }
  };

  const handleViewNFT = async (greenCardId, metadataUrl) => {
    try {
      const metadataResponse = await axios.get(metadataUrl);
      const imageUrl = metadataResponse.data.image;
      setNftImages((prevImages) => ({ ...prevImages, [greenCardId]: imageUrl }));
    } catch (error) {
      toast.error("Unable to fetch NFT image.");
      console.error(error);
    }
  };

  return (
    <div className='documents-page'>
      <h2>Documents</h2>
      {loading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p>{errorMessage}</p>
      ) : (
        <>
          {driversLicenses.length === 0 && greenCards.length === 0 ? (
            <p>No documents found</p>
          ) : (
            <>
              {driversLicenses.length > 0 && (
                <Licenses driversLicenses={driversLicenses} />
              )}
              {greenCards.length > 0 && (
                <GreenCards
                  greenCards={greenCards}
                  onGenerateNFT={handleGenerateNFT}
                  nftLoading={nftLoading}
                  onViewNFT={handleViewNFT}
                  nftImages={nftImages}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};