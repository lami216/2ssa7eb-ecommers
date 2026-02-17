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
import ContactSuccessPage from "./pages/ContactSuccessPage";
import ContactCancelPage from "./pages/ContactCancelPage";
import ContactPlanSuccessPage from "./pages/ContactPlanSuccessPage";
import ContactPlanCancelPage from "./pages/ContactPlanCancelPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

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
        const contactFeePaid = useUserStore((state) => state.contactFeePaid);
        const checkingContactFee = useUserStore((state) => state.checkingContactFee);
        const fetchContactFeeStatus = useUserStore((state) => state.fetchContactFeeStatus);

        useEffect(() => {
                checkAuth();
        }, [checkAuth]);

        useEffect(() => {
                if (user && !user.hasServices) {
                        fetchContactFeeStatus();
                }
        }, [fetchContactFeeStatus, user]);

        if (checkingAuth) {
                return <LoadingSpinner />;
        }

        const canAccessServices = Boolean(user?.hasServices || contactFeePaid);
        const servicesRoute = user
                ? user.hasServices
                        ? <ServicesPage />
                        : checkingContactFee
                                ? <LoadingSpinner />
                                : canAccessServices
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
                                        <Route path='/contact/success' element={<ContactSuccessPage />} />
                                        <Route path='/contact/cancel' element={<ContactCancelPage />} />
                                        <Route path='/contact/plan/success' element={<ContactPlanSuccessPage />} />
                                        <Route path='/contact/plan/cancel' element={<ContactPlanCancelPage />} />
                                        <Route path='/subscription/success' element={<SubscriptionSuccessPage />} />
                                        <Route path='/subscription/cancel' element={<SubscriptionCancelPage />} />
                                        <Route path='/subscription/manage/:serviceId' element={manageSubscriptionRoute} />
                                        <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
                                        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
                                        <Route path='/my-services' element={servicesRoute} />
                                        <Route path='/privacy' element={<PrivacyPage />} />
                                        <Route path='/refund-policy' element={<RefundPolicyPage />} />
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
