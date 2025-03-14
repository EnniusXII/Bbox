import React from "react";
import { useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DownloadGreenCard = () => {
  const { fileId } = useParams();

  const handleDownload = () => {
    window.open(`${BACKEND_URL}/api/v1/green-card/verification/${fileId}`, "_blank");
  };

  return (
    <div>
      <h2>Download Green Card PDF</h2>
      <button onClick={handleDownload}>Download PDF</button>
    </div>
  );
};

export default DownloadGreenCard;