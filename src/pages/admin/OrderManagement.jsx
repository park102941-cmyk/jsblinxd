import React, { useState, useEffect } from 'react';
import { ExternalLink, Sheet, RefreshCcw, AlertCircle, Package, Truck, Search, Send, Check, XCircle, Edit2, X, Save, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { GOOGLE_SCRIPT_URL } from '../../lib/config';
import { orderEngine } from '../../lib/orderEngine';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch from Firestore
            const ordersRef = collection(db, "orders");
            const querySnapshot = await getDocs(ordersRef);

            // Group items by Order ID first to handle the "Order" object structure for Factory
            const ordersMap = {};

            querySnapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                // Store raw data for "Send to Factory" usage
                ordersMap[data.orderId] = { ...data, firestoreId: docSnap.id };
            });

            // Flatten for Table Display
            const fetchedRows = [];
            Object.values(ordersMap).forEach(order => {
                const items = order.items || [];
                items.forEach(item => {
                    const widthInch = item.width || item.options?.measurements?.width || 0;
                    const heightInch = item.height || item.options?.measurements?.height || 0;
                    const mount = (item.mount || item.options?.mount?.name || 'inside').toLowerCase();
                    
                    // Use engine to normalize data to JSBlind V2.0 standards
                    const zData = orderEngine.calculateOrder({
                        name: order.shippingInfo?.name || 'Guest',
                        location: item.location || 'Window',
                        widthInch: widthInch,
                        heightInch: heightInch,
                        fabricCode: item.product?.selectedColorId || item.JSBlindData?.["Fabric Code"] || '-',
                        mountType: mount.includes('outside') ? 'outside' : 'inside',
                        motorPrice: item.motorized ? 148 : 0
                    });

                    fetchedRows.push({
                        firestoreId: order.firestoreId,
                        orderId: order.orderId,
                        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
                        rawDate: order.createdAt,
                        name: zData["Cus: Name"],
                        email: order.userInfo?.email || 'N/A',
                        address: order.shippingInfo ? `${order.shippingInfo.address || ''}, ${order.shippingInfo.city || ''}` : '',
                        fullAddress: order.shippingInfo,
                        product: item.product?.title || 'Product',
                        color: item.selectedColor || item.options?.fabric?.name || '-',
                        sideMark: zData["Location/Label"],
                        width: zData["Width inch"],
                        height: zData["Height inch"],
                        widthCm: zData["Width CM"],
                        heightCm: zData["Height CM"],
                        finalWidthCm: zData["Final Width CM"],
                        finalHeightCm: zData["Final Height CM"],
                        mount: zData["Mount"],
                        quantity: item.quantity || 1,
                        price: zData["Price"],
                        motor: zData["Motor"],
                        totalPrice: zData["Total Price"],
                        totalSqm: zData["Total SQM"],
                        status: order.status || 'pending',
                        trackingNumber: order.trackingNumber || '',
                        carrier: order.carrier || '',
                        adminNotes: order.adminNotes || '',
                        fabricCode: zData["Fabric Code"],
                        fullOrderData: order
                    });
                });
            });

            // Sort by Date Descending
            fetchedRows.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

            setOrders(fetchedRows);
        } catch (err) {
            console.error("Fetch error:", err);
            setError('Failed to load orders from Database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSendToFactory = async (orderRow) => {
        setProcessingId(orderRow.orderId);

        try {
            // 1. Prepare Data for Factory Sheet
            const fullOrder = orderRow.fullOrderData;

            const addressParts = [
                fullOrder.shippingInfo?.address,
                fullOrder.shippingInfo?.detailAddress,
                fullOrder.shippingInfo?.city,
                fullOrder.shippingInfo?.state,
                fullOrder.shippingInfo?.zipCode,
                fullOrder.shippingInfo?.country
            ].filter(Boolean);
            const fullAddress = addressParts.join(', ');

            const factoryPayload = {
                orderId: fullOrder.orderId,
                date: new Date().toLocaleDateString(),
                fullAddress: fullAddress,
                items: fullOrder.items.map((item, index) => {
                    const widthInch = item.width || item.options?.measurements?.width || 0;
                    const heightInch = item.height || item.options?.measurements?.height || 0;
                    const mount = (item.mount || item.options?.mount?.name || 'inside').toLowerCase();
                    
                    const zData = orderEngine.calculateOrder({
                        name: fullOrder.shippingInfo?.name || 'Guest',
                        location: item.location || 'Window',
                        widthInch: widthInch,
                        heightInch: heightInch,
                        fabricCode: item.product?.selectedColorId || item.JSBlindData?.["Fabric Code"] || '-',
                        mountType: mount.includes('outside') ? 'outside' : 'inside',
                        motorPrice: item.motorized ? 148 : 0
                    });

                    return {
                        index: index + 1,
                        customerName: zData["Cus: Name"],
                        title: item.product?.title || 'Unknown',
                        sideMark: zData["Location/Label"],
                        widthInch: zData["Width inch"],
                        heightInch: zData["Height inch"],
                        widthCm: zData["Width CM"],
                        heightCm: zData["Height CM"],
                        finalWidthCm: zData["Final Width CM"],
                        finalHeightCm: zData["Final Height CM"],
                        fabricCode: zData["Fabric Code"] || item.selectedColor || '-',
                        priceInch: zData["Price/ Sq I"],
                        price: zData["Price"],
                        motor: zData["Motor"],
                        totalSqm: zData["Total SQM"],
                        quantity: item.quantity || 1,
                        customConfigs: item.customConfigs || {}, // Added custom configurations
                        options: item.options || {}
                    };
                }),
                totalAmount: fullOrder.totals?.total || 0
            };

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send_to_factory',
                    order: factoryPayload
                })
            });

            const orderRef = doc(db, "orders", orderRow.firestoreId);
            await updateDoc(orderRef, {
                status: 'preparing',
                sentToFactoryAt: new Date().toISOString()
            });

            alert(`Order #${orderRow.orderId} sent to factory!`);
            fetchOrders();

        } catch (error) {
            console.error("Factory Sync Error:", error);
            alert("Failed to send to factory. Check console.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancelOrder = async (orderRow) => {
        if (!window.confirm(`Are you sure you want to cancel Order #${orderRow.orderId}? This cannot be undone.`)) return;

        try {
            const orderRef = doc(db, "orders", orderRow.firestoreId);
            await updateDoc(orderRef, {
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });
            alert(`Order #${orderRow.orderId} cancelled.`);
            fetchOrders(); // Refresh
        } catch (e) {
            console.error("Error cancelling order:", e);
            alert("Failed to cancel order.");
        }
    };

    const sendEmailNotification = async (orderUpdate, userEmail) => {
        if (!userEmail || userEmail === 'N/A') return;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send_email',
                    to: userEmail,
                    subject: `Update on your Order #${orderUpdate.orderId}`,
                    body: `
                        <h2>Order Update</h2>
                        <p>Your order <strong>#${orderUpdate.orderId}</strong> status has been updated to: <strong>${orderUpdate.status}</strong>.</p>
                        ${orderUpdate.trackingNumber ? `<p>Tracking Number: ${orderUpdate.trackingNumber}</p>` : ''}
                        <p>Thank you for shopping with us!</p>
                    `
                })
            });
            console.log(`Email notification request sent for ${orderUpdate.orderId}`);
        } catch (e) {
            console.error("Email send failed:", e);
        }
    };

    const handleExportV2 = () => {
        if (filteredOrders.length === 0) return;

        const headers = [
            "Cus: Name", "Location/Label", "Width inch", "Height inch", 
            "Width CM", "Height CM", "Final Width CM", "Final Height CM", 
            "Fabric Code", "Price/ Sq I", "Price", "Motor", "Total Price", "Total SQM"
        ];

        const rows = filteredOrders.map(o => [
            o.name,
            o.sideMark,
            o.width,
            o.height,
            o.widthCm,
            o.heightCm,
            o.finalWidthCm,
            o.finalHeightCm,
            o.fabricCode,
            0.07, // Unit Price (default logic)
            o.price,
            o.motor,
            o.totalPrice,
            o.totalSqm
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `JSBlind_Order_V2.0_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSyncTracking = async () => {
        if (loading) return;
        const originalText = "Syncing...";
        // For UI feedback, we can use a toast or just alert at the end

        try {
            // 1. Fetch updates from GAS
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_factory_updates`);
            if (!response.ok) throw new Error("Failed to fetch from Factory Sheet");

            const updates = await response.json();

            if (!updates || updates.length === 0) {
                alert("No new tracking updates found from Factory.");
                return;
            }

            let updatedCount = 0;

            // 2. Update Firestore
            // We need to match these updates to existing orders by orderId
            // efficiently we should query firestore or iterate our local list if we trust it's somewhat fresh, 
            // but query is safer. actually specific query for each match might be slow if many.
            // Let's loop through updates and Query+Update.

            for (const update of updates) {
                // Find order in Firestore by orderId field
                const q = query(collection(db, "orders"), where("orderId", "==", String(update.orderId)));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const currentData = docSnap.data();

                    // Only update if changed
                    if (currentData.trackingNumber !== update.trackingNumber || currentData.status !== update.status) {
                        await updateDoc(doc(db, "orders", docSnap.id), {
                            trackingNumber: update.trackingNumber,
                            status: update.status, // e.g. 'Shipped'
                            carrier: 'DHL', // Defaulting to DHL as per tracking link in MyAccount, or make generic
                            lastSyncedAt: new Date().toISOString()
                        });
                        updatedCount++;

                        // Send Email Notification
                        if (currentData.userInfo?.email) {
                            await sendEmailNotification(update, currentData.userInfo.email);
                        }
                    }
                }
            }

            if (updatedCount > 0) {
                alert(`Successfully synced ${updatedCount} orders from Factory Sheet!`);
                fetchOrders(); // Refresh UI
            } else {
                alert("Factory Sheet is up to date, but no matching unsynced orders found in Database.");
            }

        } catch (error) {
            console.error("Sync Error:", error);
            alert("Failed to sync tracking info.");
        }
    };

    const openEditModal = (order) => {
        setSelectedOrder(order);
        setEditForm({
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier || 'DHL',
            address: order.fullAddress?.address || '',
            detailAddress: order.fullAddress?.detailAddress || '',
            adminNotes: order.adminNotes || ''
        });
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;

        const confirm1 = window.confirm(`DANGER: Are you sure you want to PERMANENTLY DELETE Order #${selectedOrder.orderId}?`);
        if (!confirm1) return;

        const confirm2 = window.confirm("This action cannot be undone. The order will be removed from the database forever. Confirm delete?");
        if (!confirm2) return;

        try {
            await deleteDoc(doc(db, "orders", selectedOrder.firestoreId));
            alert("Order deleted successfully.");
            setSelectedOrder(null);
            fetchOrders();
        } catch (e) {
            console.error("Delete Error:", e);
            alert("Failed to delete order.");
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedOrder) return;

        try {
            const orderRef = doc(db, "orders", selectedOrder.firestoreId);

            // Construct address update safely
            const updatedShippingInfo = {
                ...selectedOrder.fullOrderData.shippingInfo,
                address: editForm.address,
                detailAddress: editForm.detailAddress
            };

            await updateDoc(orderRef, {
                status: editForm.status,
                trackingNumber: editForm.trackingNumber,
                carrier: editForm.carrier,
                shippingInfo: updatedShippingInfo,
                adminNotes: editForm.adminNotes,
                updatedAt: new Date().toISOString()
            });

            alert("Order details updated successfully!");
            setSelectedOrder(null);
            fetchOrders();
        } catch (e) {
            console.error("Update Error:", e);
            alert("Failed to update order details.");
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('shipping') || s.includes('배송') || s.includes('shipped')) return '#e3f2fd'; // Blue
        if (s.includes('preparing') || s.includes('발주완료')) return '#fff3e0'; // Orange
        if (s.includes('pending') || s.includes('주문접수')) return '#e8f5e9'; // Green
        if (s.includes('cancelled') || s.includes('취소')) return '#ffebee';
        if (s.includes('hold')) return '#fff8e1';
        return '#f5f5f7'; // Grey
    };

    const floatToLocal = (val) => val ? `$${Number(val).toLocaleString()}` : '-';

    // Simple client-side search
    const filteredOrders = orders.filter(order =>
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1d1d1f', margin: 0 }}>Order Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '250px' }}
                        />
                    </div>
                    <button
                        onClick={handleExportV2}
                        className="btn"
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '1px solid #1d1d1f',
                            background: '#1d1d1f',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Sheet size={16} /> Export V2.0 CSV
                    </button>
                    <button
                        onClick={handleSyncTracking}
                        className="btn"
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '1px solid var(--primary-green)',
                            background: '#e3f2fd',
                            color: 'var(--primary-green)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        title="Pull Tracking Numbers from Factory Sheet"
                    >
                        <RefreshCcw size={16} /> Sync Tracking
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="btn-icon"
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                        title="Refresh List"
                    >
                        <RefreshCcw size={20} color="#1d1d1f" />
                    </button>
                    <a
                        href="https://docs.google.com/spreadsheets/d/1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0/edit?gid=1966987767#gid=1966987767"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{
                            background: '#2e7d32',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Sheet size={18} /> Open Sheet
                    </a>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>
                    <div className="loading-spinner" style={{ marginBottom: '15px' }}>Loading...</div>
                    <p>Syncing with Google Sheets...</p>
                </div>
            )}

            {error && (
                <div style={{
                    background: '#fff2f2',
                    color: '#d32f2f',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    border: '1px solid #ffcdd2'
                }}>
                    <AlertCircle size={24} />
                    <div>
                        <strong>Connection Error</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e5e5e5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f9f9fa' }}>
                            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>ID / Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Customer / Side Mark</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Production Dims (CM)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Fabric / Motor</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Pricing (V2.0)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#666' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#333' }}>{order.orderId}</div>
                                        <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>{order.date}</div>
                                        {order.adminNotes && <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#e65100', background: '#fff3e0', padding: '2px 5px', borderRadius: '4px' }}>📝 Note</div>}
                                    </td>
                                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '500', color: '#333' }}>{order.name}</div>
                                        <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>
                                            📍 {order.sideMark}
                                        </div>
                                        <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{order.email}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1d1d1f' }}>
                                            Final: {order.finalWidthCm} x {order.finalHeightCm} cm
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                                            Input: {order.width}" x {order.height}" ({order.mount})
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                                            Base: {order.widthCm} x {order.heightCm} cm
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '600', color: '#444' }}>{order.product}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                            <span style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', marginRight: '5px' }}>{order.fabricCode}</span>
                                            {order.color}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: order.motor > 0 ? 'var(--primary-green)' : '#888', marginTop: '4px' }}>
                                            {order.motor > 0 ? `⚡ Motorized ($${order.motor})` : 'Manual'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '700', color: '#2e7d32' }}>${(order.totalPrice * order.quantity).toFixed(2)}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                                            SQM: {order.totalSqm.toFixed(3)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Qty: <b>{order.quantity}</b></div>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                            {/* Allow sending/resending to factory */}
                                            <button
                                                onClick={() => handleSendToFactory(order)}
                                                disabled={processingId === order.orderId || ['cancelled'].includes(order.status?.toLowerCase())}
                                                style={{
                                                    background: ['preparing', '발주완료'].includes(order.status?.toLowerCase()) ? '#ff9800' : '#333',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '6px 10px',
                                                    fontSize: '0.75rem',
                                                    cursor: (processingId === order.orderId || ['cancelled'].includes(order.status?.toLowerCase())) ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    width: '100px',
                                                    justifyContent: 'center',
                                                    opacity: (processingId === order.orderId || ['cancelled'].includes(order.status?.toLowerCase())) ? 0.5 : 1
                                                }}
                                                title="Send/Resend to Factory Sheet"
                                            >
                                                {processingId === order.orderId ? (
                                                    <span>Sending...</span>
                                                ) : (
                                                    <>
                                                        <Send size={12} />
                                                        {['preparing', '발주완료'].includes(order.status?.toLowerCase()) ? 'Resend' : 'To Factory'}
                                                    </>
                                                )}
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                                onClick={() => openEditModal(order)}
                                                style={{
                                                    background: '#fff', border: '1px solid #888', color: '#555',
                                                    borderRadius: '4px', padding: '6px 10px', fontSize: '0.75rem',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', width: '100px', justifyContent: 'center'
                                                }}
                                            >
                                                <Edit2 size={12} /> Edit / Note
                                            </button>

                                            {/* Cancel Button */}
                                            {!['shipped', 'delivered', 'cancelled', '배송중', '배송완료', '취소'].includes(order.status?.toLowerCase()) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order)}
                                                    style={{
                                                        background: '#fff',
                                                        border: '1px solid #ff5252',
                                                        color: '#ff5252',
                                                        borderRadius: '4px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        width: '100px',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={12} /> Cancel
                                                </button>
                                            )}

                                            {/* Show sent indicator below if already sent */}
                                            {['preparing', 'shipped', 'delivered', '발주완료', '배송중'].includes(order.status?.toLowerCase()) && (
                                                <div style={{ color: '#666', fontSize: '0.7rem' }}>
                                                    Sent: {order.date}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Edit Order #{selectedOrder.orderId}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status Override</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                >
                                    <option value="pending">Pending (주문접수)</option>
                                    <option value="preparing">Preparing (발주완료)</option>
                                    <option value="shipped">Shipped (배송중)</option>
                                    <option value="delivered">Delivered (배송완료)</option>
                                    <option value="cancelled">Cancelled (취소)</option>
                                    <option value="on_hold">On Hold (보류)</option>
                                    <option value="returned">Returned (반품)</option>
                                    <option value="refunded">Refunded (환불)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tracking #</label>
                                    <input
                                        type="text"
                                        value={editForm.trackingNumber}
                                        onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Carrier</label>
                                    <input
                                        type="text"
                                        value={editForm.carrier}
                                        onChange={(e) => setEditForm({ ...editForm, carrier: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Shipping Address</label>
                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Street Address"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '5px' }}
                                />
                                <input
                                    type="text"
                                    value={editForm.detailAddress}
                                    onChange={(e) => setEditForm({ ...editForm, detailAddress: e.target.value })}
                                    placeholder="Apt, Suite, etc."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#e65100' }}>Admin Notes (Internal)</label>
                                <textarea
                                    value={editForm.adminNotes}
                                    onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                                    placeholder="Add notes about delays, customer calls, etc."
                                    rows="3"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: '#fffcf5' }}
                                />
                            </div>

                            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    onClick={handleDeleteOrder}
                                    style={{
                                        color: '#d32f2f', background: 'none', border: 'none',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                        fontSize: '0.85rem', fontWeight: '500', opacity: 0.8
                                    }}
                                    title="Permanently remove from database"
                                >
                                    <Trash2 size={16} /> Delete Order
                                </button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveChanges}
                                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-green)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default OrderManagement;
