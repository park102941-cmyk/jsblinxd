import React, { useState, useEffect } from 'react';
import orderAPI from '../../services/orderAPI';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, Factory, 
  Mail, Download, RefreshCw, Filter, Search, Calendar,
  Edit, Trash2, Send, Eye
} from 'lucide-react';

const EnhancedOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = [
    { value: 'all', label: '전체', color: '#666' },
    { value: '주문접수', label: '주문접수', color: '#2196F3' },
    { value: '발주완료', label: '발주완료', color: '#FF9800' },
    { value: '제작중', label: '제작중', color: '#9C27B0' },
    { value: '배송중', label: '배송중', color: '#00BCD4' },
    { value: '배송완료', label: '배송완료', color: '#4CAF50' },
    { value: '취소', label: '취소', color: '#F44336' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchTerm, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderAPI.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('주문 조회 실패:', error);
      alert('주문 조회에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order['상태'] === filterStatus);
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order['주문번호']?.toLowerCase().includes(term) ||
        order['고객명']?.toLowerCase().includes(term) ||
        order['상품명']?.toLowerCase().includes(term)
      );
    }

    // 날짜 필터
    if (dateRange.start) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order['주문일']);
        const startDate = new Date(dateRange.start);
        return orderDate >= startDate;
      });
    }

    if (dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order['주문일']);
        const endDate = new Date(dateRange.end);
        return orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus, email) => {
    setActionLoading(true);
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus, {
        notifyCustomer: true,
        email: email
      });
      alert('주문 상태가 업데이트되었습니다.');
      fetchOrders();
    } catch (error) {
      alert('상태 업데이트 실패: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      alert('주문을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrders.length}개 주문의 상태를 "${newStatus}"로 변경하시겠습니까?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await orderAPI.batchUpdateStatus(selectedOrders, newStatus);
      alert(`${selectedOrders.length}개 주문이 업데이트되었습니다.`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      alert('일괄 업데이트 실패: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendToFactory = async (order) => {
    if (!confirm(`주문 ${order['주문번호']}를 공장에 발주하시겠습니까?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await orderAPI.sendToFactory({
        orderId: order['주문번호'],
        items: [{
          sideMark: order['Side Mark'],
          productName: order['상품명'],
          color: order['Color'],
          widthInch: order['W (in)'],
          widthCm: order['W (cm)'],
          heightInch: order['H (in)'],
          heightCm: order['H (cm)'],
          mount: order['Mount'],
          motor: order['Motor/Cord'],
          quantity: order['수량']
        }],
        fullAddress: order['배송주소']
      });
      alert('공장 발주가 완료되었습니다.');
      fetchOrders();
    } catch (error) {
      alert('발주 실패: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTracking = async (orderId, trackingNumber, email) => {
    setActionLoading(true);
    try {
      await orderAPI.updateTracking(orderId, trackingNumber, email);
      alert('송장번호가 업데이트되었습니다.');
      fetchOrders();
    } catch (error) {
      alert('송장번호 업데이트 실패: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['주문일', '주문번호', 'Side Mark', '고객명', '배송주소', '상품명', 
      'Color', 'W (in)', 'H (in)', 'Mount', 'Motor/Cord', '수량', '상태', '송장번호', '판매가'];
    
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => 
        headers.map(h => `"${order[h] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o['주문번호']));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: statusConfig.color + '20',
        color: statusConfig.color
      }}>
        {status || '알 수 없음'}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="주문 정보를 불러오는 중..." />;
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>
          <Package size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          통합 주문 관리
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem' }}>
          총 {orders.length}개 주문 | 필터링된 주문: {filteredOrders.length}개
        </p>
      </div>

      {/* Filters & Actions */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Search & Filters Row */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="주문번호, 고객명, 상품명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          />

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            className="hover-lift"
            style={{
              padding: '10px 20px',
              background: 'var(--primary-green)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={18} />
            새로고침
          </button>
        </div>

        {/* Batch Actions Row */}
        {selectedOrders.length > 0 && (
          <div style={{
            padding: '15px',
            background: '#f0f7ff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: '600', color: '#2196F3' }}>
              {selectedOrders.length}개 선택됨
            </span>
            <div style={{ flex: 1 }} />
            {statusOptions.filter(s => s.value !== 'all').map(status => (
              <button
                key={status.value}
                onClick={() => handleBatchStatusUpdate(status.value)}
                disabled={actionLoading}
                className="hover-scale"
                style={{
                  padding: '8px 16px',
                  background: status.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                {status.label}로 변경
              </button>
            ))}
            <button
              onClick={handleExportCSV}
              className="hover-scale"
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} />
              CSV 내보내기
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={selectAllOrders}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>주문일</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>주문번호</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>고객명</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>상품명</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>크기</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>수량</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>상태</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700' }}>송장번호</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '700' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    주문이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s',
                      background: selectedOrders.includes(order['주문번호']) ? '#f0f7ff' : 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedOrders.includes(order['주문번호']) ? '#f0f7ff' : 'white'}
                  >
                    <td style={{ padding: '15px' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order['주문번호'])}
                        onChange={() => toggleOrderSelection(order['주문번호'])}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.85rem' }}>
                      {order['주문일'] ? new Date(order['주문일']).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '600', fontSize: '0.9rem' }}>
                      {order['주문번호']}
                    </td>
                    <td style={{ padding: '15px' }}>{order['고객명']}</td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{order['상품명']}</td>
                    <td style={{ padding: '15px', fontSize: '0.85rem', color: '#666' }}>
                      {order['W (in)']}" × {order['H (in)']}\"
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>{order['수량']}</td>
                    <td style={{ padding: '15px' }}>
                      {getStatusBadge(order['상태'])}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.85rem' }}>
                      {order['송장번호'] || '-'}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            const newStatus = prompt('새 상태를 입력하세요:', order['상태']);
                            if (newStatus) {
                              handleStatusUpdate(order['주문번호'], newStatus, order['Email']);
                            }
                          }}
                          className="hover-scale"
                          title="상태 변경"
                          style={{
                            padding: '6px 10px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        {order['상태'] === '주문접수' && (
                          <button
                            onClick={() => handleSendToFactory(order)}
                            className="hover-scale"
                            title="공장 발주"
                            style={{
                              padding: '6px 10px',
                              background: '#FF9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Factory size={14} />
                          </button>
                        )}
                        {!order['송장번호'] && (
                          <button
                            onClick={() => {
                              const tracking = prompt('송장번호를 입력하세요:');
                              if (tracking) {
                                handleUpdateTracking(order['주문번호'], tracking, order['Email']);
                              }
                            }}
                            className="hover-scale"
                            title="송장번호 입력"
                            style={{
                              padding: '6px 10px',
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Truck size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading Overlay */}
      {actionLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <LoadingSpinner text="처리 중..." />
        </div>
      )}
    </div>
  );
};

export default EnhancedOrderManagement;
