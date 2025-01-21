import React, { useState } from "react";
import { getDriversLicenses } from "../services/HttpClient";

export const Licenses = () => {
  const [driversLicenses, setDriversLicenses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDriversLicenses = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getDriversLicenses();
      setDriversLicenses(data.data); // Assuming data.data contains the list of licenses
    } catch (error) {
      setDriversLicenses([]);
      setErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-column">
      <h1 className="pageheader">Licenses</h1>
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
        </>
      )}
    </div>
  );
};