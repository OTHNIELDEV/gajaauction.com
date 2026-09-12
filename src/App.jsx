import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const MapSearchPage = lazy(() => import('./pages/MapSearchPage'));
const BusinessCardPage = lazy(() => import('./pages/BusinessCardPage'));
const ExitWiseBridgePage = lazy(() => import('./pages/ExitWiseBridgePage'));
const RawImViewerPage = lazy(() => import('./pages/RawImViewerPage'));
const ImportListingPage = lazy(() => import('./pages/ImportListingPage'));

// Loading Component
const Loading = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--primary-navy)', color: 'var(--accent-gold)' }}>
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
import AdminLeads from './pages/admin/AdminLeads';
import AdminVIPs from './pages/admin/AdminVIPs';
import './index.css';

function App() {
  return (
    <ThemeProvider>
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
              <Route path="/listings/import" element={
                <Suspense fallback={<Loading />}>
                  <ImportListingPage />
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
              <Route path="/business-card" element={
                <Suspense fallback={<Loading />}>
                  <BusinessCardPage />
                </Suspense>
              } />
              <Route path="/cards" element={
                <Suspense fallback={<Loading />}>
                  <BusinessCardPage />
                </Suspense>
              } />
            </Route>

            {/* ExitWise Integration Interactive Mockup (Standalone Full View) */}
            <Route path="/exitwise-bridge" element={
              <Suspense fallback={<Loading />}>
                <ExitWiseBridgePage />
              </Suspense>
            } />

            {/* ExitWise Chat IM Raw Document Viewer (Standalone Window) */}
            <Route path="/im-raw-viewer" element={
              <Suspense fallback={<Loading />}>
                <RawImViewerPage />
              </Suspense>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="vips" element={<AdminVIPs />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  </ThemeProvider>
  );
}

export default App;
