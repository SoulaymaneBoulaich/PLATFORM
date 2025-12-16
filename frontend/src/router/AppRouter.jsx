import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import PropertyList from '../pages/PropertyList';
import PropertyDetail from '../pages/PropertyDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import SignUp from '../pages/SignUp';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import Agents from '../pages/Agents';
import AgentDetail from '../pages/AgentDetail';
import Contact from '../pages/Contact';
import Transactions from '../pages/Transactions';
import Messages from '../pages/Messages';
import ProtectedRoute from '../components/ProtectedRoute';
import SellerDashboard from '../pages/SellerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import EditProfile from '../pages/EditProfile';
import Settings from '../pages/Settings';
import Offers from '../pages/Offers';
import Favorites from '../pages/Favorites';
import PageTransition from '../components/PageTransition';


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/properties" element={<PageTransition><PropertyList /></PageTransition>} />
            <Route path="/properties/:id" element={<PageTransition><PropertyDetail /></PageTransition>} />
            <Route path="/agents" element={<PageTransition><Agents /></PageTransition>} />
            <Route path="/agents/:id" element={<PageTransition><AgentDetail /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <PageTransition><Dashboard /></PageTransition>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/seller" element={
                <ProtectedRoute>
                    <PageTransition><SellerDashboard /></PageTransition>
                </ProtectedRoute>
            } />
            <Route path="/dashboard/buyer" element={
                <ProtectedRoute>
                    <PageTransition><BuyerDashboard /></PageTransition>
                </ProtectedRoute>
            } />
            <Route path="/account/profile" element={
                <ProtectedRoute>
                    <EditProfile />
                </ProtectedRoute>
            } />
            <Route path="/account/settings" element={
                <ProtectedRoute>
                    <PageTransition><Settings /></PageTransition>
                </ProtectedRoute>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <PageTransition><Messages /></PageTransition>
                </ProtectedRoute>
            } />
            <Route path="/transactions" element={
                <ProtectedRoute>
                    <Transactions />
                </ProtectedRoute>
            } />
            <Route path="/offers" element={
                <ProtectedRoute>
                    <Offers />
                </ProtectedRoute>
            } />
            <Route path="/favorites" element={
                <ProtectedRoute>
                    <PageTransition><Favorites /></PageTransition>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRouter;

