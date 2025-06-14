import React, { useEffect, useState } from 'react';
import { getUserDetails } from '../services/HttpClient';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Menu = () => {
	const [userName, setUserName] = useState('');
	const [userId, setUserId] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		setIsLoading(true);
		const fetchUserData = async () => {
			try {
				const response = await getUserDetails();
				setUserName(response.data.name);
				setUserId(response.data._id);
			} catch (error) {
				console.error('Error fetching user data', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, []);

	return (
		<div className='container flex flex-column'>
			<h1 className='pageheader'>Welcome {userName}!</h1>
			<h3 className='pageheader'>User ID: {userId}</h3>

			{isLoading && <p>Loading User Information...</p>}

			<NavLink to='/user-info'>
				<button>View User Info</button>
			</NavLink>

			<NavLink to='/addlicense'>
				<button>Add Licenses</button>
			</NavLink>

			<NavLink to='/documents'>
				<button>View Documents</button>
			</NavLink>

			<NavLink to='/notifications'>
				<button>View Notifications</button>
			</NavLink>

			<NavLink to='/verification'>
				<button>Go to Verification</button>
			</NavLink>

			<NavLink to='/green-card/create'>
				<button>Create Green Card</button>
			</NavLink>

			<NavLink to='/green-card/verify'>
				<button>Verify Green Card</button>
			</NavLink>
       
      <NavLink to="/personal-data">
        <button>Personal Data</button>
      </NavLink>
		</div>
	);
};

export default Menu
