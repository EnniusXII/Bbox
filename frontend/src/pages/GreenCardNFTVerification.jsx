import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyGreenCardNFT } from "../services/BlockchainServices";

const GreenCardNFTVerification = () => {
    const { hash } = useParams();
    const [verificationData, setVerificationData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                const data = await verifyGreenCardNFT(hash);
                setVerificationData(data);
            } catch (error) {
                setErrorMessage("Verification failed. Green Card is invalid or does not exist.");
            }
        };
        fetchVerification();
    }, [hash]);

    return (
        <div className="container">
            <h2>Green Card Verification</h2>
            {verificationData ? (
                <div className="verification-details">
                    <p><strong>Holder:</strong> {verificationData.insured}</p>
                    <p><strong>Vehicle Registration:</strong> {verificationData.vehicle.registrationNumber}</p>
                    <p><strong>Status:</strong> {verificationData.valid ? "Valid ✅" : "Invalid ❌"}</p>
                </div>
            ) : (
                <p>{errorMessage || "Verifying..."}</p>
            )}
        </div>
    );
};

export default GreenCardNFTVerification;