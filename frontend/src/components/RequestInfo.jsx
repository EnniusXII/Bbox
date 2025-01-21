import React, { useEffect, useState } from 'react';
import { getRequestInfo, getUserDetails } from '../services/HttpClient';
import { useNavigate, useParams } from 'react-router-dom';

export const RequestInfo = () => {
    const { requestId } = useParams();
    const [requestInfo, setRequestInfo] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequestInfo = async () => {
            try {
                const response = await getRequestInfo(requestId);
                setRequestInfo(response.data);
                console.log('Reponse.data.user:', response.data.user);

                const userResponse = await getUserDetails();
                setLoggedInUserId(userResponse.data.id);
                console.log('UserResponse:', userResponse);
                console.log('UserResponse.data.id:', userResponse.data._id);

                if (userResponse.data._id === response.data.user) {
                    setIsOwner(true);
                }
            } catch (error) {
                console.error('Error fetching request info:', error);
                setError('Failed to load request info. You need to log in to see info.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequestInfo();
    }, [requestId]);

    const handleLogin = () => {
        navigate('/login', { state: { returnTo: `/requests/${requestId}` } });
    };

    if (loading) return <p>Loading request info...</p>;

    return (
        <div className="container">
            <h1>Request Info</h1>
            {error ? (
                <p>{error}</p>
            ) : requestInfo ? (
                isOwner ? (
                    <div>
                        <p><strong>Message:</strong> {requestInfo.message}</p>
                        <p><strong>Transaction Hash:</strong> {requestInfo.transactionHash}</p>
                        <p><strong>Request ID:</strong> {requestInfo.requestId}</p>
                        <p><strong>User:</strong> {requestInfo.user}</p>
                        <p><strong>First Name:</strong> {requestInfo.name}</p>
                        <p><strong>Last Name:</strong> {requestInfo.lastName}</p>
                        <p><strong>License Type:</strong> {requestInfo.licenseType}</p>
                        <p><strong>Status:</strong> {requestInfo.status}</p>
                        <p><strong>Created At:</strong> {new Date(requestInfo.createdAt).toLocaleString()}</p>
                    </div>
                ) : (
                    <div>
                        <p>{requestInfo.message}</p>
                        <p>Status: {requestInfo.status}</p>
                    </div>
                )
            ) : null}
            <button onClick={handleLogin}>Log in as user to view data</button>
        </div>
    );
};