import React, { useEffect, useState } from 'react'
import { getRequests } from '../services/HttpClient';
import { Link } from 'react-router-dom';

export const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchRequests = async () => {
        try {
            const response = await getRequests();

            const sortedRequests = response.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setRequests(sortedRequests);
            setFilteredRequests(sortedRequests);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "You need to log in");
            console.error("Error fetching requests:", error);
        } finally {
            setIsLoading(false);
        }
        };

        fetchRequests();
    }, []);

    // Filter requests based on search query
    useEffect(() => {
        if (searchQuery === "") {
            setFilteredRequests(requests); // Show all requests if search is empty
        } else {
            setFilteredRequests(
                requests.filter((request) =>
                    request._id.includes(searchQuery) || 
                    (request.transactionHash && request.transactionHash.includes(searchQuery))
                )
            );
        }
    }, [searchQuery, requests]); // Re-run whenever searchQuery or requests change

  return (
    <div className='container'>

        <div className='flex'>
            <h1>Requests</h1>

            <input
                    type="text"
                    placeholder="Search by Request ID or Transaction Hash"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
            />
        </div>

        {filteredRequests.map((request, index) => (
            <div className='card' key={request._id}>
                <div className='card-header'>#{filteredRequests.length - index} - Request Id: {request._id}</div>
                <div className='card-body'>
                    <p>Status: {request.status}</p>
                    <p>Transaction Hash: {request.transactionHash || "Pending"}</p>
                    <p>{request.message}</p>
                    <p>User: {request.user}</p>
                    <br />
                    <p>
                        <Link to={`/requests/${request._id}`} className='button'>Log in as user to show full data</Link>
                    </p>
                </div>
            </div>
        ))}

        {/* Show a message if no results match the search */}
        {filteredRequests.length === 0 && (
                <p>No requests match your search.</p>
            )}
        
        <p>{errorMessage}</p>

        {isLoading && (
            <p>Loading...</p>
        )}


    </div>
  )
}
