import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import { useAuthStore } from './stores/authStore';

import WelcomePage from './pages/auth/WelcomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';
import Dashboard from './components/Dashboard';
import DesignStudio from './components/DesignStudio';
import BOM from './components/BOM';
import Cart from './components/Cart';

import ProjectListPage from './pages/projects/ProjectListPage';
import NewProjectPage from './pages/projects/NewProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import AddProductPage from './pages/products/AddProductPage';
import SettingsPage from './pages/settings/SettingsPage';
import SupportPage from './pages/support/SupportPage';
import DocsPage from './pages/docs/DocsPage';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentPage from './pages/payment/PaymentPage';
import DiamondPage from './pages/diamond/DiamondPage';
import CombiSteelPage from './pages/combisteel/CombiSteelPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <HashRouter>
      <Routes>
        {/* Welcome & Auth routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />

        {/* Main routes - publicly accessible */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="design" element={<DesignStudio />} />
          <Route path="manual" element={<DesignStudio manualMode />} />
          <Route path="bom" element={<BOM />} />
          <Route path="bom/:id" element={<BOM />} />
          <Route path="diamond" element={<DiamondPage />} />
          <Route path="combisteel" element={<CombiSteelPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />

          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:projectId/products/add" element={<AddProductPage />} />
          <Route path="projects/:id/design" element={<DesignStudio />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="payment" element={<PaymentPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieBanner />
    </HashRouter>
  );
}
