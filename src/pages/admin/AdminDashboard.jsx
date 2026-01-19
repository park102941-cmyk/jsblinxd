import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { PieChart, Users, Package, ShoppingBag, Layout, FileText, ArrowLeftRight, Sheet, ExternalLink, BarChart3, PackageSearch, Bell, Sparkles, UserCog, List, Upload } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="container section">
            <h1 className="section-title">Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
                {/* Sidebar Nav */}
                <div style={{ background: 'var(--white)', padding: '20px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', padding: '0 10px' }}>
                        <img src="/logo.png" alt="JSBlind Logo" style={{ height: '32px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px' }} />
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--secondary-olive)', letterSpacing: '-0.5px' }}>JSBlind Admin</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '4px', background: '#f5f5f5', fontWeight: 'bold' }}>
                                <PieChart size={18} /> Dashboard Home
                            </Link>
                        </li>
                        
                        {/* New Features Section */}
                        <li style={{ marginTop: '20px', padding: '10px 0', borderTop: '1px solid #eee' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Analytics & Tools</span>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/analytics" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <BarChart3 size={18} /> Analytics
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/inventory" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <PackageSearch size={18} /> Inventory
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/notifications" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <Bell size={18} /> Notifications
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/ai-assistant" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <Sparkles size={18} /> AI Assistant
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/customers" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <UserCog size={18} /> Customers
                            </Link>
                        </li>

                        {/* Core Features Section */}
                        <li style={{ marginTop: '20px', padding: '10px 0', borderTop: '1px solid #eee' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Core Features</span>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/home-edit" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <Layout size={18} /> Home Page
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <Package size={18} /> Products
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/zshine-importer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px', background: '#fff3e0' }}>
                                <Package size={18} /> ZSHINE 제품 가져오기 🆕
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/product-importer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px', background: '#e3f2fd' }}>
                                <Upload size={18} /> 제품 가져오기 ⚡
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <List size={18} /> Categories
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <ShoppingBag size={18} /> Orders
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/enhanced-orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px', background: '#e8f5e9' }}>
                                <Package size={18} /> 통합 주문 관리 ⭐
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/returns" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <ArrowLeftRight size={18} /> Returns
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/coupons" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <Users size={18} /> Users/Coupons
                            </Link>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <Link to="/admin/content" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--secondary-color)', borderRadius: '4px' }}>
                                <FileText size={18} /> Page Content
                            </Link>
                        </li>

                        {/* External Links Section */}
                        <li style={{ marginTop: '20px', padding: '10px 0', borderTop: '1px solid #eee' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>External Links</span>
                        </li>
                        <li>
                            <a href="https://docs.google.com/spreadsheets/d/1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0/edit" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: '#2e7d32', fontSize: '0.9rem', borderRadius: '4px' }}>
                                <Sheet size={18} /> Google Sheets
                            </a>
                        </li>
                        <li>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', color: 'var(--primary-green)', fontSize: '0.9rem', borderRadius: '4px' }}>
                                <ExternalLink size={18} /> View Website
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: 'var(--white)', padding: '30px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)', minHeight: '500px' }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
