import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';

// Pages
import Dashboard from './pages/Dashboard';
import Bienvenida from './pages/Bienvenida';
import Personal from './pages/Personal';
import Accounting from './pages/Accounting';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Warehouse from './pages/Warehouse';
import Configuration from './pages/Configuration';

// Security Pages
import UsersPage from './pages/Security/Users';
import RolesPage from './pages/Security/Roles';
import PermissionsPage from './pages/Security/Permissions';

// Liturgical Pages
import ManageLiturgical from './pages/Liturgical/ManageLiturgical';
import Schedules from './pages/Liturgical/Schedules';
import Reservations from './pages/Liturgical/Reservations';
import LiturgicalReports from './pages/Liturgical/LiturgicalReports';

// Reports Pages
import ManagementReports from './pages/Reports/ManagementReports';
import TransactionReports from './pages/Reports/TransactionReports';

// Componente protegido con Layout y Outlet
const ProtectedRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route element={<ProtectedRoutes />}>
                        {/* Bienvenida es la página inicial */}
                        <Route index element={<Navigate to="/bienvenida" />} />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/bienvenida" element={<Bienvenida />} />
                        <Route path="/personal" element={<Personal />} />
                        <Route path="/accounting" element={<Accounting />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/purchases" element={<Purchases />} />
                        <Route path="/warehouse" element={<Warehouse />} />
                        <Route path="/configuration" element={<Configuration />} />

                        {/* Security Routes */}
                        <Route path="/security/users" element={<UsersPage />} />
                        <Route path="/security/roles" element={<RolesPage />} />
                        <Route path="/security/permissions" element={<PermissionsPage />} />

                        {/* Liturgical Routes */}
                        <Route path="/liturgical/manage" element={<ManageLiturgical />} />
                        <Route path="/liturgical/schedules" element={<Schedules />} />
                        <Route path="/liturgical/reservations" element={<Reservations />} />
                        <Route path="/liturgical/reports" element={<LiturgicalReports />} />

                        {/* Reports Routes */}
                        <Route path="/reports/management" element={<ManagementReports />} />
                        <Route path="/reports/transactions" element={<TransactionReports />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
