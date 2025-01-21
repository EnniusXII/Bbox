import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../assets/blackboxlogoblack.png";
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { connectToMetaMask } from '../services/BlockchainServices';

export const Header = () => {
    const { isLoggedIn, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const navigate = useNavigate();

    const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    };

    const connectWallet  = async () => {
      try {
          await connectToMetaMask();
          setWalletAddress(accounts[0]);
          toast.success("Wallet connected successfully!");
      } catch (error) {
          toast.error("Failed to connect to MetaMask.");
          console.error("MetaMask connection error:", error);
      }
    };

    const formatAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    useEffect(() => {
      // Check if wallet is already connected
      const checkWalletConnection = async () => {
          if (window.ethereum) {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts.length > 0) {
                  setWalletAddress(accounts[0]); // Set the first connected account
              }
          }
      };
      checkWalletConnection();
    }, []);

  return (
    <header>
      <div className="container">

        <Link to="/" className="logo-container">
          <img src={logo} alt="BlackBox Logo" className="logo" />
        </Link>
        
        <nav>
          <Link to="/">Home</Link>
          <Link to="/requests">Requests</Link>
          <Link to="/verification">Verification</Link>
        </nav>

        <div className='login-btns-container'>
          {/* MetaMask Connect Button */}
          <div className="metamask-btn-container">
              {walletAddress ? (
                  <button className="wallet-btn">
                      {formatAddress(walletAddress)}
                  </button>
              ) : (
                  <button onClick={connectWallet}>
                      Connect Wallet
                  </button>
              )}
          </div>

          {!isLoggedIn && (
              <div>
            <button onClick={() => navigate('/login')}>
              Log In
            </button>
            </div>
          )}

          {/* Hamburger Menu for Authenticated Users */}
          {isLoggedIn && (
            <>
              <div>
                  <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                      <div></div>
                      <div></div>
                      <div></div>
                  </div>
              </div>

              {/* Dropdown Menu */}
              {menuOpen && (
                <nav className="dropdown-menu">
                  <Link to="/addlicense" onClick={toggleMenu}>Add License</Link>
                  <Link to="/licenses" onClick={toggleMenu}>View Licenses</Link>
                  <Link to="/notifications" onClick={toggleMenu}>Notifications</Link>
                  <Link to="/verification" onClick={toggleMenu}>Verification</Link>
                  <Link to="/" onClick={logout}>Logout</Link>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};