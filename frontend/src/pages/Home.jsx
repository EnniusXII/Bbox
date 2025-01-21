import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const Home = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/menu")
    }
  }, [token, navigate]);

  return (
    <div className='container'>

        <h1 className='homepage-header pageheader'>Secure, Verifiable, Accessible</h1>

      <div className='homepage-links'>
        <NavLink to="/login">
          <button>Log in</button>
        </NavLink>
        <NavLink to="/register">
          <button>Sign up</button>
        </NavLink>
      </div>
    </div>
  )
}

export default Home
