import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL

const GreenCardNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${backendUrl}/api/v1/green-card/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications(response.data);
      } catch (error) {
        toast.error("Failed to fetch notifications.");
        console.error("Error:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>Green Card Verification Requests</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification) => (
            <li key={notification._id}>
              {notification.message}
              <button onClick={() => handleApprove(notification._id)}>Approve</button>
              <button onClick={() => handleDecline(notification._id)}>Decline</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending requests.</p>
      )}
    </div>
  );
};

export default GreenCardNotifications;