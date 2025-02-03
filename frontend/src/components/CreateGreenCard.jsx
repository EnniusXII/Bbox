import React, { useState } from 'react'
import axios from 'axios'

const CreateGreenCard = () => {
  const [insuredName, setInsuredName] = useState('');
  const [validityFrom, setValidityFrom] = useState('');
  const [validityTo, setValidityTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [insuranceId, setInsuranceId] = useState('');
  const [hash, setHash] = useState('');

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/v1/green-card/addGreenCard`, {
        insured: {name: insuredName},
        validty: { from: validityFrom, to: validityTo }
      });

      setInsuranceId(response.data.insuranceId);
      setHash(response.data.hash);
      setLoading(false);

      alert('Insurance ID & hash generated. Please store on-chain via Metamask.');
      onCardCreated({insuranceId: response.data.insuranceId, hash: response.data.hash});
    } catch (err) {
      console.error('Error creating Green Card: ', err);
      alert('Failed to create Green Card.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Create Green Card</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="insuredName">Insured Name</label>
          <input type="text" name='insuredName' id='insuredName' placeholder='Insured Name' value={insuredName} onChange={(e) => setInsuredName(e.target.value)} required />
        </div>
        <div className="form-control">
          <label htmlFor="validFrom">Valid From</label>
          <input type="date" name="validFrom" id="validFrom" value={validityFrom} onChange={(e) => setValidityFrom(e.target.value)} required/>
        </div>
        <div className="form-control">
          <label htmlFor="validTo">Valid From</label>
          <input type="date" name="validTo" id="validTo" value={validityTo} onChange={(e) => setValidityTo(e.target.value)} required/>
        </div>
        <div className="form-control">
          <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating Green Card...' : 'Create Green Card'}</button>
        </div>
      </form>

      {insuranceId && <p>Insurance ID: {insuranceId}</p>}
      {hash && <p>Hash: {hash}</p>}
    </div>
  )
}

export default CreateGreenCard