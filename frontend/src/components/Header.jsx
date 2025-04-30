import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/blackboxlogoblack.png';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { connectToMetaMask } from '../services/BlockchainServices';

export const Header = () => {
	const { isLoggedIn, logout } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const [walletAddress, setWalletAddress] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const connectWallet = async () => {
		try {
			const { walletAddress } = await connectToMetaMask();

			if (walletAddress) {
				setWalletAddress(walletAddress);
				localStorage.setItem('walletAddress', walletAddress);
				toast.success('Wallet connected successfully!');
			}
		} catch (error) {
			toast.error('Failed to connect to MetaMask.');
			console.error('MetaMask connection error:', error);
		}
	};

	const formatAddress = (address) =>
		`${address.slice(0, 6)}...${address.slice(-4)}`;

	useEffect(() => {
		// Check if wallet is already connected
		const checkWalletConnection = async () => {
			if (window.ethereum) {
				const accounts = await window.ethereum.request({
					method: 'eth_accounts',
				});
				if (accounts.length > 0) {
					setWalletAddress(accounts[0]); // Set the first connected account
				} else {
					const storedWallet = localStorage.getItem('walletAddress');
					if (storedWallet) {
						setWalletAddress(storedWallet);
					}
				}
			}
			setLoading(false);
		};
		checkWalletConnection();

		window.ethereum?.on('accountsChanged', (accounts) => {
			if (accounts.length > 0) {
				setWalletAddress(accounts[0]);
				localStorage.setItem('walletAddress', accounts[0]);
			} else {
				setWalletAddress(null);
				localStorage.removeItem('walletAddress');
			}
		});

		return () => {
			window.ethereum?.removeListener(
				'accountsChanged',
				checkWalletConnection
			);
		};
	}, []);

	return (
		<header>
			<div className='container'>
				<Link to='/' className='logo-container'>
					<img src={logo} alt='BlackBox Logo' className='logo' />
				</Link>

				<nav>
					<Link to='/'>Home</Link>
					<Link to='/requests'>Requests</Link>
					<Link to='/verification'>Verification</Link>
				</nav>

				<div className='login-btns-container'>
					{/* MetaMask Connect Button */}
					<div className='metamask-btn-container'>
						{loading ? (
							<button disabled>Loading...</button> // ✅ Show loading until wallet is detected
						) : walletAddress ? (
							<button className='wallet-btn'>
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
								<div
									className={`hamburger ${
										menuOpen ? 'open' : ''
									}`}
									onClick={toggleMenu}
								>
									<div></div>
									<div></div>
									<div></div>
								</div>
							</div>

							{/* Dropdown Menu */}
							{menuOpen && (
								<nav className='dropdown-menu'>
									<Link to='/user-info' onClick={toggleMenu}>
										User Info
									</Link>
									<Link to='/addlicense' onClick={toggleMenu}>
										Add License
									</Link>
									<Link
										to='/green-card/create'
										onClick={toggleMenu}
									>
										Add Green Card
									</Link>
									<Link to='/documents' onClick={toggleMenu}>
										View Documents
									</Link>
									<Link
										to='/notifications'
										onClick={toggleMenu}
									>
										Notifications
									</Link>
									<Link
										to='/verification'
										onClick={toggleMenu}
									>
										Verification
									</Link>
									<Link to='/' onClick={logout}>
										Logout
									</Link>
								</nav>
							)}
						</>
					)}
				</div>
			</div>
		</header>
	);
};
