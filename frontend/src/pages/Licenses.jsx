import React, { useState } from "react";
import { getDriversLicenses } from "../services/HttpClient";

export const Licenses = () => {
  const [driversLicenses, setDriversLicenses] = useState([]);
  const [greenCards, setGreenCards] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDriversLicenses = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const licenseData = await getDriversLicenses();
      setDriversLicenses(licenseData.data); // Assuming data.data contains the list of licenses
      constgreenCardData = await getGreenCards();
      setGreenCards(greenCardData.data); // Assuming data.data contains the list of licenses
    } catch (error) {
      setDriversLicenses([]);

      setErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-column">
      <h1 className="pageheader">Documents</h1>
      <button onClick={fetchDriversLicenses}>Drivers Licenses</button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {driversLicenses.length > 0 ? (
            <div>
              <h2>Driver's Licenses</h2>
              {driversLicenses.map((license, index) => (
                <div className="card" key={license._id}>
                  <div className="card-header">{license.licenseType} License</div>
                  <div className="card-body">
                    <p>First Name: {license.name}</p>
                    <p>Last Name: {license.lastName}</p>
                    <p>Birthdate: {(license.birthdate).split('T')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{errorMessage}</p>
          )}
          {greenCards.length > 0 ? (
            <div>
              <h2>Green Cards</h2>
              {greenCards.map((cards, index) => (
                <div className="card" key={cards._id}>
                  <div className="card-header">Refrence ID: {cards.referenceId}</div>
                  <div className="card-body">
                  <div className="card-insured">
                    <p>Name: {cards.insured.name}</p>
                    <p>Address: {cards.insured.address}</p>
                  </div>
                    <div className="vehicle">
                    <p>Registration Number: {cards.vehicle.registrationNumber}</p>
                    <p>Category: {cards.vehicle.category}</p>
                  </div>
                  <div className="insurance">
                    <p>Company Name: {cards.insurance.companyName}</p>
                  </div>
                  <div className="validity">
                    <p>Valid: {cards.validity.from} - {cards.validity.to}</p>
                  </div>
                  <div className="countriesCovered">
                    <p>Countries Covered:</p>
                    <ul>
                      {cards.contriesCovered.map((country, index) => (
                        <li key={index}>{country}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{errorMessage}</p>
          )}
        </>
      )}
    </div>
  );
};