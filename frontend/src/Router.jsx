// import { Login } from "./pages/Login"
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import { Register } from "./pages/Register";
import { Layout } from "./pages/Layout";
import { Login } from "./pages/Login";
import Menu from "./pages/Menu";
import { Verification } from "./pages/Verification";
import { Licenses } from "./pages/Licenses";
import Notifications from "./pages/Notifications";
import ApproveVerification from "./components/ApproveVerification";
import { AddLicenses } from "./pages/AddLicenses";
import { VerificationPage } from "./pages/VerificationPage";
import { RequestsPage } from "./pages/RequestsPage";
import { RequestInfo } from "./components/RequestInfo";
import CreateGreenCard from './pages/CreateGreenCard';
import ConfirmGreenCard from './pages/ConfirmGreenCard';
import VerifyGreenCard from './pages/VerifyGreenCard';
import DownloadGreenCard from './pages/DownloadGreenCard';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/menu",
        element: <Menu />,
      },
      {
        path: "/verification",
        element: <Verification />,
      },
      {
        path: "/verification-status/:requestId",
        element: <VerificationPage />,
      },
      {
        path: "/addlicense",
        element: <AddLicenses />,
      },
      {
        path: "/licenses",
        element: <Licenses />,
      },
      {
        path: "/notifications",
        element: <Notifications />,
      },
      {
        path: "/approve/:requestId",
        element: <ApproveVerification />,
      },
      {
        path: "/requests",
        element: <RequestsPage />,
      },
      {
        path: "/requests/:requestId",
        element: <RequestInfo />,
      },
      {
        path: "/green-card/create",
        element: <CreateGreenCard />,
      },
      {
        path: "/green-card/confirm",
        element: <ConfirmGreenCard />,
      },
      {
        path: "/green-card/verify",
        element: <VerifyGreenCard />,
      },
      {
        path: "/green-card/download/:fileId",
        element: <DownloadGreenCard />,
      },
    ],
  },
]);
