import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Swatches from './pages/Swatches';
import Products from './pages/Products';
import Support from './pages/Support';
import AboutUs from './pages/AboutUs';
import TrackOrder from './pages/TrackOrder';
import SearchPage from './pages/Search';
import Help from './pages/Help';
import HowToMeasure from './pages/help/HowToMeasure';
import HowToInstall from './pages/help/HowToInstall';
import HowToChoose from './pages/help/HowToChoose';
import SmartMotors from './pages/help/SmartMotors';



import Cart from './pages/Cart';
import Login from './pages/Login';
import MyAccount from './pages/MyAccount';
import Checkout from './pages/Checkout';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ReturnManagement from './pages/admin/ReturnManagement';
import CouponManagement from './pages/admin/CouponManagement';
import HomeManagement from './pages/admin/HomeManagement';
import DashboardHome from './pages/admin/DashboardHome';
import ContentManagement from './pages/admin/ContentManagement';
import Analytics from './pages/admin/Analytics';
import InventoryManagement from './pages/admin/InventoryManagement';
import NotificationCenter from './pages/admin/NotificationCenter';
import AIAssistant from './pages/admin/AIAssistant';
import CustomerManagement from './pages/admin/CustomerManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

import { db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

// Announcement Popup Component
const AnnouncementPopup = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkAnnouncement = async () => {
      try {
        const docRef = doc(db, "settings", "announcement");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Check if active and not hidden by user in this session
          const hidden = sessionStorage.getItem(`hide_announcement_${data.title}`);
          if (data.active && !hidden) {
            setAnnouncement(data);
            setVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to load announcement", err);
      }
    };
    checkAnnouncement();
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (announcement) {
      sessionStorage.setItem(`hide_announcement_${announcement.title}`, 'true');
    }
  };

  if (!visible || !announcement) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '400px', maxWidth: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ background: 'var(--secondary-olive)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>{announcement.title}</h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        <div style={{ padding: '25px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {announcement.message}
        </div>
        <div style={{ padding: '0 25px 25px', textAlign: 'center' }}>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--primary-green)', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '20px',
              fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* <AnnouncementPopup /> */}
            <Header />
            <main style={{ flex: 1, background: '#f5f5f7' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/swatches" element={<Swatches />} />
                <Route path="/products" element={<Products />} />
                <Route path="/custom-blinds" element={<Navigate to="/products" replace />} /> {/* Redirect old route */}
                <Route path="/support" element={<Support />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/help" element={<Help />} />
                <Route path="/help/how-to-measure" element={<HowToMeasure />} />
                <Route path="/help/how-to-install" element={<HowToInstall />} />
                <Route path="/help/how-to-choose" element={<HowToChoose />} />
                <Route path="/help/smart-motors" element={<SmartMotors />} />


                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<MyAccount />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }>
                  <Route index element={<DashboardHome />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="notifications" element={<NotificationCenter />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="returns" element={<ReturnManagement />} />
                  <Route path="coupons" element={<CouponManagement />} />
                   <Route path="home-edit" element={<HomeManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="content" element={<ContentManagement />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

