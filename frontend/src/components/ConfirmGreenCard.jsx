import React, { useState } from 'react'
import {storeGreenCardHash, confirmGreenCard} from '../services/BlockchainServices'

const ConfirmGreenCard = () => {
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const txHash = await storeGreenCardHash({insuranceId, hash});

      setTransactionHash(txHash);
      alert('Hash stored on-chain successfully!');

      await confirmGreenCard({insuranceId, transactionHash: txHash});
      alert('Green Card confirmed successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error storing hash: ', err);
      alert('Failed to store hash on-chain');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Confirm Green Card on Blockchain</h2>
      <button onClick={handleConfirm} disabled={loading}>
        {loading ? "Confirming..." : "Store Hash & Confirm"}
      </button>

      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
}

export default ConfirmGreenCard