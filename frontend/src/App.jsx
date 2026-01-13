import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import DemoPage from "./pages/DemoPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceSuccessPage from "./pages/ServiceSuccessPage";
import ServiceCancelPage from "./pages/ServiceCancelPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCancelPage from "./pages/SubscriptionCancelPage";
import SubscriptionManagePage from "./pages/SubscriptionManagePage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
        const user = useUserStore((state) => state.user);
        const checkAuth = useUserStore((state) => state.checkAuth);
        const checkingAuth = useUserStore((state) => state.checkingAuth);

        useEffect(() => {
                checkAuth();
        }, [checkAuth]);

        if (checkingAuth) {
                return <LoadingSpinner />;
        }

        const servicesRoute = user
                ? user.hasServices
                        ? <ServicesPage />
                        : <Navigate to='/' />
                : <Navigate to='/login' />;
        const manageSubscriptionRoute = user
                ? user.hasServices
                        ? <SubscriptionManagePage />
                        : <Navigate to='/' />
                : <Navigate to='/login' />;

        return (
                <div className='relative min-h-screen text-payzone-white'>
                        <div className='relative z-50 pt-20'>
                                <Navbar />
                                <Routes>
                                        <Route path='/' element={<HomePage />} />
                                        <Route path='/our-work' element={<DemoPage />} />
                                        <Route path='/services/success' element={<ServiceSuccessPage />} />
                                        <Route path='/services/cancel' element={<ServiceCancelPage />} />
                                        <Route path='/subscription/success' element={<SubscriptionSuccessPage />} />
                                        <Route path='/subscription/cancel' element={<SubscriptionCancelPage />} />
                                        <Route path='/subscription/manage/:serviceId' element={manageSubscriptionRoute} />
                                        <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
                                        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
                                        <Route path='/my-services' element={servicesRoute} />
                                        <Route
                                                path='/secret-dashboard'
                                                element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
                                        />
                                </Routes>
                        </div>
                        <Toaster />
                        <Footer />
                </div>
        );
}

export default App;
