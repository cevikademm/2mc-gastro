import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import DesignStudio from './components/DesignStudio';
import BOM from './components/BOM';
import ProjectListPage from './pages/projects/ProjectListPage';
import NewProjectPage from './pages/projects/NewProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import AddProductPage from './pages/products/AddProductPage';
import SettingsPage from './pages/settings/SettingsPage';
import SupportPage from './pages/support/SupportPage';
import DocsPage from './pages/docs/DocsPage';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentPage from './pages/payment/PaymentPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Admin login routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />

        {/* All routes publicly accessible */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="catalog/:id" element={<Catalog />} />
          <Route path="design" element={<DesignStudio />} />
          <Route path="bom" element={<BOM />} />
          <Route path="bom/:id" element={<BOM />} />
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
