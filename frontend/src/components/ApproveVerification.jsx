import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useParams
import { approveLicenseVerification, declineLicenseVerification, getNotificationStatus } from '../services/HttpClient';
import { getVerificationStatus, recordVerification } from '../services/BlockchainServices';
import { ethers } from 'ethers';

const ApproveVerification = () => {
  const { requestId } = useParams();  // Get requestId from URL parameters
  const location = useLocation();  // Get location object
  const notification = location.state?.notification; // Access notification from state
  const [statusMessage, setStatusMessage] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        const response = await getNotificationStatus(requestId);
        setNotificationStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch notification status:", error);
      }
    };
  
    fetchNotificationStatus();
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // Send additional license details in the request
      const response = await approveLicenseVerification(requestId, {
        lastName: notification.lastName,
        licenseType: notification.licenseType
      });
      
      setStatusMessage(response.message);

      // Trigger status update
      const updatedStatus = await getNotificationStatus(requestId);
      setNotificationStatus(updatedStatus.data);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || "An error occurred during approval.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      const response = await declineLicenseVerification(requestId);  // Pass requestId here
      setStatusMessage(response.message);

      const updatedStatus = await getNotificationStatus(requestId);
      setNotificationStatus(updatedStatus.data);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || "An error occurred during approval.");
    } finally {
      setIsLoading(false);
    }
  };


const handleVerification = async () => {
  setIsLoading(true);
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setStatusMessage("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    // Request account access and get the currently connected wallet address
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const userAddress = accounts[0]; // The first account connected to MetaMask

    // Record verification with the dynamic user address
    const transactionHash  = await recordVerification({
      requestId,
      userAddress,
      licenseType: notification.licenseType,
      isVerified: true,
    });

    setStatusMessage(`Verification recorded successfully. Transaction Hash: ${transactionHash}`);
  } catch (error) {
    // Handle errors gracefully
    if (error.response && error.response.data && error.response.data.error) {
      const fullErrorMessage = error.response.data.error;

      const reasonMatch = fullErrorMessage.match(/reason="(.+?)"/);
      if (reasonMatch && reasonMatch[1]) {
        setStatusMessage(`Verification failed: ${reasonMatch[1]}`);
      } else {
        setStatusMessage("Verification failed: Unknown error.");
      }
    } else {
      setStatusMessage("Verification failed: Unknown error.");
    }
  } finally {
    setIsLoading(false);
  }
};

const checkStatus = async () => {
  setIsLoading(true);
  try {
    const status = await getVerificationStatus(requestId);

    const formattedDate = new Date(Number(status.timestamp) * 1000).toLocaleString();
    
    setStatusMessage(`
      Status: ${status.isVerified ? "Verified" : "Not Verified"}
      License Type: ${status.licenseType}
      Timestamp: ${formattedDate}
      User Address: ${status.userAddress}
    `);
  } catch (error) {
    console.error("Error retrieving status:", error);
    setStatusMessage("Failed to retrieve verification status.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className='container flex flex-column'>
      <h2 className='pageheader'>{notification?.message}</h2>
      <p>Status: {notificationStatus?.status}</p>

      <button onClick={handleAccept}>Accept Verification</button>
      <button onClick={handleDecline}>Decline Verification</button>
      <button onClick={handleVerification}>Record Verification on Blockchain</button>
      <button onClick={checkStatus}>Check Verification Status on Blockchain</button>

      {isLoading && (
        <p>Awaiting response...</p>
      )}

      {statusMessage && <p className='statusmessage'>{statusMessage}</p>}
    </div>
  );
};

export default ApproveVerification;