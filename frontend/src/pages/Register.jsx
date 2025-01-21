import React, { useState } from 'react';
import { register } from "../services/HttpClient";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(name, email, password);

      if (response.success) {
        window.alert("Your account has been created!");
        setName("");
        setEmail("");
        setPassword("");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(error);
      window.alert("There was an error while registering, please try again.");
    }
  };

  return (
    <div className="container flex flex-column">
      <form className="forms" onSubmit={handleSubmit}>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Email: </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
