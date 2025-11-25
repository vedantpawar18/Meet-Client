import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParcelsPage from './pages/ParcelsPage';
import UploadPage from './pages/UploadPage';
import DepartmentsPage from './pages/DepartmentsPage';
import RulesPage from './pages/RulesPage';
import ProfilePage from './pages/ProfilePage';
import { useSelector } from 'react-redux';
import ParcelDetailPage from './pages/ParcelDetailPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import MetricsPage from './pages/MetricsPage';
import AdminPage from './pages/AdminPage';

function RequireAuth({ children }){ const token = useSelector(s=>s.auth.token); if(!token) return <Navigate to="/login" replace />; return children; }

export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<RequireAuth><DashboardPage/></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage/></RequireAuth>} />
        <Route path="/parcels" element={<RequireAuth><ParcelsPage/></RequireAuth>} />
        <Route path="/parcels/upload" element={<RequireAuth><UploadPage/></RequireAuth>} />
        <Route path="/departments" element={<RequireAuth><DepartmentsPage/></RequireAuth>} />
        <Route path="/rules" element={<RequireAuth><RulesPage/></RequireAuth>} />
        <Route path="/parcels/:id" element={<RequireAuth><ParcelDetailPage/></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><UsersPage/></RequireAuth>} />
        <Route path="/users/:id" element={<RequireAuth><UserDetailPage/></RequireAuth>} />
        <Route path="/admin/metrics" element={<RequireAuth><MetricsPage/></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminPage/></RequireAuth>} />
      </Routes>
    </Layout>
  );
}
