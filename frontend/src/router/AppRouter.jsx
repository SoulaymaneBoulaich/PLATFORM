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

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/dashboard/seller" element={
                <ProtectedRoute>
                    <SellerDashboard />
                </ProtectedRoute>
            } />
            <Route path="/dashboard/buyer" element={
                <ProtectedRoute>
                    <BuyerDashboard />
                </ProtectedRoute>
            } />
            <Route path="/account/profile" element={
                <ProtectedRoute>
                    <EditProfile />
                </ProtectedRoute>
            } />
            <Route path="/account/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <Messages />
                </ProtectedRoute>
            } />
            <Route path="/transactions" element={
                <ProtectedRoute>
                    <Transactions />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRouter;

