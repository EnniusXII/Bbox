import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const Layout = () => {
    // const navigate = useNavigate();

    // useEffect(() => {
    //     const token = localStorage.getItem('token');

    //     if (token) {navigate('/menu')};
        
    // }, [navigate]);

  return (
    <>
      <Header />
      <main className='blackbox-container'>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};