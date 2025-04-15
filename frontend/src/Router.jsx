import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './pages/Layout'; // Ensure correct import
import Home from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import Menu from './pages/Menu';
import { Verification } from './pages/Verification';
import { Licenses } from './pages/Licenses';
import { Documents } from './pages/Documents';
import Notifications from './pages/Notifications';
import ApproveVerification from './components/ApproveVerification';
import { AddLicenses } from './pages/AddLicenses';
import { VerificationPage } from './pages/VerificationPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestInfo } from './components/RequestInfo';
import CreateGreenCard from './pages/CreateGreenCard';
import ConfirmGreenCard from './pages/ConfirmGreenCard';
import VerifyGreenCard from './pages/VerifyGreenCard';
import DownloadGreenCard from './pages/DownloadGreenCard';
import RequestGreenCardVerification from './pages/RequestGreenCardVerification';
import GreenCardNotifications from './pages/GreenCardNotifications';
import ApproveGreenCardVerification from './pages/ApproveGreenCardVerification';
import LicenseNFTVerification from './pages/LicenseNFTVerification';
import GreenCardNFTVerification from './pages/GreenCardNFTVerification';
import { PersonalData } from './pages/PersonalData';

export const router = createBrowserRouter(
	[
		{
		  path: '/',
		  element: <Layout />,
		  children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: '/register',
				element: <Register />,
			},
			{
				path: '/login',
				element: <Login />,
			},
			{
				path: '/menu',
				element: <Menu />,
			},
			{
				path: '/verification',
				element: <Verification />,
			},
			{
				path: '/verification-status/:requestId',
				element: <VerificationPage />,
			},
			{
				path: '/addlicense',
				element: <AddLicenses />,
			},
			{
				path: '/documents',
				element: <Documents />,
			},
			{
				path: '/notifications',
				element: <Notifications />,
			},
			{
				path: '/approve/:requestId',
				element: <ApproveVerification />,
			},
			{
				path: '/approve-green-card/:requestId',
				element: <ApproveGreenCardVerification />,
			},
			{
				path: '/requests',
				element: <RequestsPage />,
			},
			{
				path: '/requests/:requestId',
				element: <RequestInfo />,
			},
			{
				path: '/green-card/create',
				element: <CreateGreenCard />,
			},
			{
				path: '/green-card/confirm',
				element: <ConfirmGreenCard />,
			},
			{
				path: '/green-card/verify',
				element: <VerifyGreenCard />,
			},
			{
				path: '/green-card/download/:fileId',
				element: <DownloadGreenCard />,
			},
			{
				path: '/request-green-card-verification',
				element: <RequestGreenCardVerification />,
			},
			{
				path: '/green-card-notifications',
				element: <GreenCardNotifications />,
			},
			{
				path: '/approve-green-card/:requestId',
				element: <ApproveGreenCardVerification />,
			},
			{
				path: "/green-card-nft-verification/:hash",
				element: <GreenCardNFTVerification />,
			},
      		{
				path: '/verification/:uniqueHash',
				element: <LicenseNFTVerification />,
			},
      		{
				path: '/personal-data',
				element: <PersonalData />,
			},
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
