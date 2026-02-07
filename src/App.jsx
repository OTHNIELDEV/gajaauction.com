import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const MapSearchPage = lazy(() => import('./pages/MapSearchPage'));

// Loading Component
const Loading = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#050b14', color: '#D4AF37' }}>
    <div style={{ textAlign: 'center' }}>
      <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
      <p>Loading Hyper-Intelligent Platform...</p>
    </div>
  </div>
);

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardHome from './pages/admin/DashboardHome';
import AdminListings from './pages/admin/AdminListings';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminPartners from './pages/admin/AdminPartners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminVIPs from './pages/admin/AdminVIPs';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              } />
              <Route path="/map" element={
                <Suspense fallback={<Loading />}>
                  <MapSearchPage />
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<Loading />}>
                  <AboutPage />
                </Suspense>
              } />
              <Route path="/services" element={
                <Suspense fallback={<Loading />}>
                  <ServicesPage />
                </Suspense>
              } />
              <Route path="/listings" element={
                <Suspense fallback={<Loading />}>
                  <ListingsPage />
                </Suspense>
              } />
              <Route path="/listings/:id" element={
                <Suspense fallback={<Loading />}>
                  <ListingDetailPage />
                </Suspense>
              } />
              <Route path="/partners" element={
                <Suspense fallback={<Loading />}>
                  <PartnersPage />
                </Suspense>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="vips" element={<AdminVIPs />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
