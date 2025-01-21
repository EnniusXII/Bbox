import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNotificationStatus } from '../services/HttpClient';

export const VerificationPage = () => {
    const { requestId } = useParams(); // Get requestId from URL
    const [status, setStatus] = useState("Awaiting response...");

    useEffect(() => {
        let pollCount = 0;

        const fetchStatus = async () => {
            try {
                const response = await getNotificationStatus(requestId);
                console.log('API Response:', response); // Log the response

                if (response && response.success) {
                    // Update status based on response
                    if (response.data.isAccepted) {
                        setStatus("Verification accepted.");
                        clearInterval(intervalId); // Stop polling
                    } else if (response.data.isDeclined) {
                        setStatus("Verification declined.");
                        clearInterval(intervalId); // Stop polling
                    }
                }
            } catch (error) {
                console.error("Error fetching notification status:", error);
            }

            // Increment the counter and stop polling if it exceeds the limit
            pollCount += 1;
            if (pollCount >= 24) {
                clearInterval(intervalId);
                console.log("Polling stopped after 24 attempts. (2 minutes)");
            }
        };

        // Fetch status immediately
        fetchStatus();

        // Polling for status updates every 5 seconds
        const intervalId = setInterval(fetchStatus, 5000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [requestId]);

    return (
        <div className='container'>
            <h2>Verification Status</h2>
            <p>{status}</p>
            <br />
            <p>Your Request ID: {requestId}</p>
            <Link to={`/requests`}>
                See Requests
            </Link>
        </div>
    );
};