import { RouterProvider } from 'react-router-dom'
// import './App.css'
import "./styles/globals.css"
import "./styles/layout.css"
import "./styles/theme.css"
import "./styles/hamburger.css"
import "./styles/components.css"
import {router} from './Router'
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext'

function App() {

  return (
    <>
    <AuthProvider>  
      <ToastContainer />
      <RouterProvider router={router} />
    </AuthProvider>
    </>
  )
}

export default App
