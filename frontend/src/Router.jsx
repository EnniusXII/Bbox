import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './pages/Layout'; // Ensure correct import
import Home from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import Menu from './pages/Menu';
import { Verification } from './pages/Verification';
import { Licenses } from './pages/Licenses';
import Notifications from './pages/Notifications';
import ApproveVerification from './components/ApproveVerification';
import { AddLicenses } from './pages/AddLicenses';
import { VerificationPage } from './pages/VerificationPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestInfo } from './components/RequestInfo';

export const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Layout />, // Ensure this is a component
			children: [
				{ index: true, element: <Home /> },
				{ path: '/register', element: <Register /> },
				{ path: '/login', element: <Login /> },
				{ path: '/menu', element: <Menu /> },
				{ path: '/verification', element: <Verification /> },
				{
					path: '/verification-status/:requestId',
					element: <VerificationPage />,
				},
				{ path: '/addlicense', element: <AddLicenses /> },
				{ path: '/licenses', element: <Licenses /> },
				{ path: '/notifications', element: <Notifications /> },
				{
					path: '/approve/:requestId',
					element: <ApproveVerification />,
				},
				{ path: '/requests', element: <RequestsPage /> },
				{ path: '/requests/:requestId', element: <RequestInfo /> },
			],
		},
	],
	{
		future: {
			v7_startTransition: true,
			v7_relativeSplatPath: true,
		},
	}
);
