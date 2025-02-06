import { ethers } from 'ethers';
import bboxAbi from '../../contract-abi.json';
import greenCardAbi from '../../greenCard-abi.json';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BBOX_CONTRACT = "0xc761F8E6Cb9af69C49ef3EaA1140b07AAd8056e9";
const GREEN_CARD_CONTRACT = "0xE3D49AD6C419A03da46e338607AAd3de788da27d";

export const connectToMetaMask = async (contractType = 'BBOX') => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to use this feature.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    // Create a provider connected to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Use the first account returned by MetaMask
    const signer = await provider.getSigner(accounts[0]);

    const walletAddress = await signer.getAddress();

    let contractAddress, abi;
    if(contractType === 'GREEN_CARD') {
      contractAddress = GREEN_CARD_CONTRACT;
      abi = greenCardAbi;
    } else if (contractType === 'BBOX'){
      contractAddress = BBOX_CONTRACT;
      abi = bboxAbi;
    } else {
      throw new Error(`Invalid contractType: ${contractType}. Expected 'BBOX' or 'GREEN_CARD'.`);
    }

    // Return the contract instance with the signer
    return new ethers.Contract(contractAddress, abi, signer), walletAddress;
  } catch (error) {
    console.error("MetaMask connection failed:", error);
    throw error;
  }
};

export const recordVerification = async ({requestId, userAddress, licenseType, isVerified}) => {
  try {
    const contract = await connectToMetaMask('BBOX');

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
    const contract = await connectToMetaMask('BBOX');
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

export const createGreenCard = async (greenCardData) => {
  try {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (!token) {
      throw new Error("No authentication token found.");
    }

    const response = await axios.post(`${BACKEND_URL}/api/v1/green-card/create`, greenCardData, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach token
      },
    });

    console.log("✅ Green Card created successfully:", response.data);
    return response.data; // Contains `insuranceId` and `hash`
  } catch (error) {
    console.error("❌ Failed to create Green Card:", error);
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

export const confirmGreenCard = async (referenceId, initialHash) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(GREEN_CARD_CONTRACT, greenCardAbi, signer);

    console.log(`📡 Storing hash on-chain: referenceId=${referenceId}, hash=${initialHash}`);

    // Call smart contract function with the initial hash
    const tx = await contract.storeHash(referenceId, initialHash);
    const receipt = await tx.wait();

    console.log("✅ Transaction successful:", receipt);

    // Extract the transaction hash from the receipt
    const transactionHash = receipt.hash; // This is the correct field for the TX hash

    console.log("✅ Transaction hash:", transactionHash);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found.");

    // Send referenceId and transactionHash to backend for storage
    const response = await axios.post(`${BACKEND_URL}/api/v1/green-card/confirm`, {
      referenceId, // Make sure this is correctly passed
      transactionHash, // Make sure this is correctly passed
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log("✅ Green Card confirmed in backend:", response.data);
    
    return transactionHash;
  } catch (error) {
    console.error("❌ Error storing Green Card hash on-chain:", error);
    throw error;
  }
};

export const verifyGreenCard = async (referenceId) => {
  try {
    console.log(`📌 Retrieving stored hash from blockchain for referenceId=${referenceId}`);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(GREEN_CARD_CONTRACT, greenCardAbi, signer);

    // Retrieve stored hash from blockchain
    const [storedHash, timestamp] = await contract.getHash(referenceId);

    console.log("✅ Stored Hash from Blockchain:", storedHash);

    // Fetch expected hash from backend (stored during Green Card creation)
    const backendResponse = await axios.post(`${BACKEND_URL}/api/v1/green-card/verify`, {referenceId});

    if (!backendResponse.data.success) {
      console.error("❌ Failed to retrieve expected hash from backend.");
      return { success: false, message: "Failed to retrieve expected hash." };
    }

    const expectedHash = backendResponse.data.hash;

    console.log("✅ Expected Hash from Initial Creation:", expectedHash);

    // Compare blockchain stored hash with expected hash
    const isValid = storedHash === expectedHash;

    return {
      success: true,
      verified: isValid,
      storedHash,
      expectedHash,
      message: isValid ? "✅ Green Card is valid." : "❌ Green Card is invalid."
    };

  } catch (error) {
    console.error("❌ Error verifying Green Card:", error);
    return { success: false, message: "Verification failed." };
  }
};

export const getStoredHash = async (insuranceId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/green-card/verify`);
    return response.data.hash;
  } catch (err) {
    console.error('Failed to get stored hash: ', err);
    throw err;
  }
}