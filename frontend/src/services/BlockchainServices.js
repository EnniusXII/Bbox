import { ethers } from 'ethers';
import bboxAbi from '../../contract-abi.json';
import greenCardAbi from '../../greenCard-abi.json';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BBOX_CONTRACT = "0xc761F8E6Cb9af69C49ef3EaA1140b07AAd8056e9";
const GREEN_CARD_CONTRACT = "0xE3D49AD6C419A03da46e338607AAd3de788da27d";

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

    let contractAddress;
    if(contractType === 'GREEN_CARD') {
      contractAddress = GREEN_CARD_CONTRACT;
      abi = greenCardAbi;
    } else {
      contractAddress = BBOX_CONTRACT;
      abi = bboxAbi;
    }

    // Return the contract instance with the signer
    return new ethers.Contract(contractAddress, abi, signer);
  } catch (error) {
    console.error("MetaMask connection failed:", error);
    throw error;
  }
};

export const recordVerification = async ({requestId, userAddress, licenseType, isVerified}) => {
  try {
    const contract = await connectToMetaMask(BBOX_CONTRACT);

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
    const contract = await connectToMetaMask(BBOX_CONTRACT);
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

export const storeGreenCardHash = async ({insuranceID, hash}) => {
  try {
    const contract = await connectToMetaMask('GREEN_CARD');

    const tx = await contract.storeHash(insuranceID, hash);
    await tx.wait();

    console.log('Transaction hash: ', tx.hash);
    return tx.hash;
  } catch (err) {
    console.error('Failed to store Green Card hash on-chain: ', err);
    throw err;
  }
};

export const confirmGreenCrard = async ({insuranceId, txHash}) => {
  try {
    const contract = await connectToMetaMask('GREEN_CARD');
    const [storedHash] = await contract.getHash(insuranceId);

    if(!storedHash || storedHash === ''){
      throw new Error('Green Card hash not found on-chain');
    }

    const response = await axios.post(`${BACKEND_URL}/api/v1/green-card/confirmGreenCard`, {
      insuranceId, txHash
    });

    console.log('Green Card confirmed: ', response.data);
    return response.data;
  } catch (err) {
    console.error('Error confirming Green Card: ', err);
    throw err;
  }
}

export const getStoredHash = async (insuranceId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/green-card/verify/${insuranceId}`);
    return response.data.hash;
  } catch (err) {
    console.error('Failed to get stored hash: ', err);
    throw err;
  }
}