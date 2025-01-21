import { ethers } from 'ethers';
import abi from '../../contract-abi.json';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CONTRACT_ADDRESS = "0xc761F8E6Cb9af69C49ef3EaA1140b07AAd8056e9";

export const connectToMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to use this feature.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    console.log("Connected Accounts:", accounts);

    // Create a provider connected to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Use the first account returned by MetaMask
    const signer = await provider.getSigner(accounts[0]);

    console.log("Signer Address:", await signer.getAddress());

    // Return the contract instance with the signer
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  } catch (error) {
    console.error("MetaMask connection failed:", error);
    throw error;
  }
};

export const recordVerification = async ({requestId, userAddress, licenseType, isVerified}) => {
  try {
    const contract = await connectToMetaMask();

    // Interact with the contract
    const tx = await contract.recordVerification(requestId, userAddress, licenseType, isVerified);
    await tx.wait();

    const transactionHash = tx.hash;

    // Send transactionHash to the backend to update the notification
    await axios.post(`${BACKEND_URL}/api/v1/notifications/updateNotification`, {
      requestId,
      transactionHash,
    });

    return transactionHash; // Return transaction hash
  } catch (error) {
    console.error("Failed to record verification:", error);
    throw error;
  }
};

export const getVerificationStatus = async (requestId) => {
  try {
    const contract = await connectToMetaMask();
    const [isVerified, licenseType, timestamp, userAddress] = await contract.getVerificationStatus(requestId);

    // Return an object with descriptive keys for better clarity
    return {
      isVerified,
      licenseType,
      timestamp,
      userAddress,
    };
  } catch (error) {
    console.error("Failed to get verification status:", error);
    throw error;
  }
};