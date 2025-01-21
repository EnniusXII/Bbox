import React, { useState } from 'react';
import { login as loginApi } from "../services/HttpClient";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await loginApi(email, password);

          login(response.token);

          const returnTo = location.state?.returnTo || "/menu";  // Redirect to intended page or default menu page
          
          navigate(returnTo);
        } catch (error) {
          console.error(error);
          window.alert("There was an error while logging in, please try again.");
        }
      };

  return (
    <div className="container flex flex-column">
      <form className="forms" onSubmit={handleSubmit}>
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
        <button type="submit">Log in</button>
      </form>
      <p>If you don't have an account you can
        <Link to="/register"> Sign Up</Link>
      </p>
    </div>
  )
}
