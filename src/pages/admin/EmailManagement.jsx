import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import {
    doc, getDoc, setDoc, collection, getDocs, addDoc
} from 'firebase/firestore';
import {
    Mail, Send, Save, RefreshCw, Users, CheckCircle,
    AlertCircle, Eye, Edit3, Zap, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// ── Default Templates ──────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES = {
    welcome: {
        id: 'welcome',
        name: '회원가입 환영 이메일',
        subject: '{{name}}님, JSBlind에 오신 것을 환영합니다! 🎉',
        body: `안녕하세요, {{name}}님!

JSBlind에 가입해 주셔서 진심으로 감사드립니다.

저희는 고품질 블라인드와 창문 커버링 전문 브랜드로,
고객 여러분께 최고의 제품과 서비스를 제공하기 위해 최선을 다하고 있습니다.

🎁 신규 회원 혜택:
• 첫 주문 시 무료 배송
• 전문가 상담 서비스
• 다양한 샘플 무료 신청

지금 바로 제품을 둘러보시고 마음에 드시는 블라인드를 찾아보세요!

감사합니다,
JSBlind 팀 드림`,
        variables: ['{{name}}', '{{email}}']
    },
    otp: {
        id: 'otp',
        name: 'OTP 인증 이메일',
        subject: '[JSBlind] 이메일 인증 코드: {{code}}',
        body: `안녕하세요, {{name}}님!

JSBlind 회원가입을 위한 이메일 인증 코드입니다.

인증 코드: {{code}}

이 코드는 10분간 유효합니다.

본인이 요청하지 않으셨다면 이 이메일을 무시하시기 바랍니다.

감사합니다,
JSBlind 팀 드림`,
        variables: ['{{name}}', '{{email}}', '{{code}}']
    }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const previewTemplate = (text, vars = {}) => {
    let out = text;
    out = out.replace(/\{\{name\}\}/g, vars.name || '홍길동');
    out = out.replace(/\{\{email\}\}/g, vars.email || 'user@example.com');
    out = out.replace(/\{\{code\}\}/g, vars.code || '123456');
    return out;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const EmailManagement = () => {
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'bulk'
    const [templates, setTemplates] = useState({ ...DEFAULT_TEMPLATES });
    const [editingId, setEditingId] = useState('welcome');
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');

    // Bulk email state
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [bulkSubject, setBulkSubject] = useState('');
    const [bulkBody, setBulkBody] = useState('');
    const [targetGroup, setTargetGroup] = useState('all');
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [sendHistory, setSendHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const currentTemplate = templates[editingId];

    // Load templates from Firestore
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'emailTemplates'));
                if (snap.exists()) {
                    setTemplates(prev => ({ ...prev, ...snap.data() }));
                }
            } catch (e) {
                console.error('Template load error:', e);
            }
        };
        loadTemplates();
        loadSendHistory();
    }, []);

    // Load customers
    useEffect(() => {
        if (activeTab === 'bulk') fetchCustomers();
    }, [activeTab]);

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.email);
            setCustomers(data);
        } catch (e) {
            console.error('Customers fetch error:', e);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const loadSendHistory = async () => {
        try {
            const snap = await getDocs(collection(db, 'emailHistory'));
            const data = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
                .slice(0, 20);
            setSendHistory(data);
        } catch (e) { /* ignore */ }
    };

    // Save template to Firestore
    const handleSaveTemplate = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'emailTemplates'), templates, { merge: true });
            setSavedMsg('저장되었습니다! ✓');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (e) {
            setSavedMsg('저장 실패: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const updateTemplate = (field, value) => {
        setTemplates(prev => ({
            ...prev,
            [editingId]: { ...prev[editingId], [field]: value }
        }));
    };

    // Filter customers by target group
    const getTargetCustomers = () => {
        if (targetGroup === 'all') return customers;
        if (targetGroup === 'admin') return customers.filter(c => c.isAdmin);
        return customers; // extend with more filters as needed
    };

    const targetCustomers = getTargetCustomers();

    // Send bulk email via Google Apps Script
    const handleSendBulk = async () => {
        if (!bulkSubject.trim() || !bulkBody.trim()) {
            setSendResult({ type: 'error', message: '제목과 내용을 입력해주세요.' });
            return;
        }
        if (targetCustomers.length === 0) {
            setSendResult({ type: 'error', message: '발송 대상 회원이 없습니다.' });
            return;
        }

        const confirm = window.confirm(
            `${targetCustomers.length}명의 회원에게 이메일을 발송합니다.\n계속하시겠습니까?`
        );
        if (!confirm) return;

        setSending(true);
        setSendResult(null);

        try {
            let successCount = 0;
            let failCount = 0;

            // Batch send (throttle to avoid rate limits)
            for (const customer of targetCustomers) {
                try {
                    const personalSubject = bulkSubject.replace(/\{\{name\}\}/g, customer.displayName || '고객');
                    const personalBody = bulkBody
                        .replace(/\{\{name\}\}/g, customer.displayName || '고객')
                        .replace(/\{\{email\}\}/g, customer.email || '');

                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify({
                            action: 'sendBulkEmail',
                            email: customer.email,
                            subject: personalSubject,
                            body: personalBody,
                            name: customer.displayName || '고객'
                        })
                    });
                    successCount++;

                    // Small delay to avoid hitting limits
                    await new Promise(r => setTimeout(r, 150));
                } catch (err) {
                    failCount++;
                    console.warn(`Failed to send to ${customer.email}:`, err);
                }
            }

            // Save send history to Firestore
            await addDoc(collection(db, 'emailHistory'), {
                subject: bulkSubject,
                body: bulkBody,
                targetGroup,
                totalSent: successCount,
                failCount,
                sentAt: new Date().toISOString(),
                sentBy: 'admin'
            });

            setSendResult({
                type: 'success',
                message: `✅ 발송 완료! ${successCount}명 성공${failCount > 0 ? `, ${failCount}명 실패` : ''}`
            });
            loadSendHistory();

            // Reset form
            setBulkSubject('');
            setBulkBody('');
        } catch (e) {
            setSendResult({ type: 'error', message: '발송 중 오류가 발생했습니다: ' + e.message });
        } finally {
            setSending(false);
        }
    };

    // ── Styles ──────────────────────────────────────────────────────────────────
    const tabStyle = (active) => ({
        padding: '10px 24px',
        border: 'none',
        borderBottom: active ? '3px solid #667eea' : '3px solid transparent',
        background: 'none',
        color: active ? '#667eea' : '#888',
        fontWeight: active ? '700' : '500',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
    });

    const cardStyle = {
        background: 'white',
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.9rem',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '220px',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: '1.6'
    };

    const btnPrimary = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '11px 22px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'opacity 0.2s'
    };

    const btnSecondary = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '11px 22px',
        background: '#f5f5f5',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.9rem'
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', margin: 0 }}>
                        📧 이메일 관리
                    </h2>
                    <p style={{ color: '#666', margin: '6px 0 0', fontSize: '0.9rem' }}>
                        이메일 템플릿 관리 및 단체 이메일 발송
                    </p>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                    border: '1px solid #667eea40',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                }}>
                    <Users size={16} />
                    총 회원 {customers.length || '—'}명
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '2px solid #f0f0f0', marginBottom: '28px', display: 'flex', gap: '4px' }}>
                <button style={tabStyle(activeTab === 'templates')} onClick={() => setActiveTab('templates')}>
                    ✏️ 이메일 템플릿 관리
                </button>
                <button style={tabStyle(activeTab === 'bulk')} onClick={() => setActiveTab('bulk')}>
                    📤 단체 이메일 발송
                </button>
            </div>

            {/* ── TEMPLATES TAB ──────────────────────────────────────────────── */}
            {activeTab === 'templates' && (
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
                    {/* Template Selector */}
                    <div style={{ ...cardStyle, padding: '16px', height: 'fit-content' }}>
                        <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '12px' }}>
                            템플릿 선택
                        </p>
                        {Object.values(templates).map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => { setEditingId(tpl.id); setPreviewMode(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: editingId === tpl.id ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'transparent',
                                    color: editingId === tpl.id ? '#667eea' : '#555',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontWeight: editingId === tpl.id ? '700' : '400',
                                    fontSize: '0.875rem',
                                    marginBottom: '4px',
                                    borderLeft: editingId === tpl.id ? '3px solid #667eea' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Mail size={15} />
                                {tpl.name}
                            </button>
                        ))}
                    </div>

                    {/* Template Editor */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#333' }}>
                                    {currentTemplate?.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    {currentTemplate?.variables?.map(v => (
                                        <span key={v} style={{
                                            padding: '2px 10px',
                                            background: '#667eea15',
                                            color: '#667eea',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            border: '1px solid #667eea30'
                                        }}>
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setPreviewMode(!previewMode)}
                                    style={{
                                        ...btnSecondary,
                                        color: previewMode ? '#667eea' : '#333',
                                        borderColor: previewMode ? '#667eea' : '#ddd'
                                    }}
                                >
                                    <Eye size={16} />
                                    {previewMode ? '편집' : '미리보기'}
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={saving}
                                    style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
                                >
                                    {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                    {saving ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </div>

                        {savedMsg && (
                            <div style={{
                                padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
                                background: savedMsg.includes('실패') ? '#fff0f0' : '#f0fdf4',
                                color: savedMsg.includes('실패') ? '#d32f2f' : '#16a34a',
                                border: `1px solid ${savedMsg.includes('실패') ? '#fca5a5' : '#86efac'}`,
                                fontWeight: '500', fontSize: '0.875rem'
                            }}>
                                {savedMsg}
                            </div>
                        )}

                        {previewMode ? (
                            /* Preview Mode */
                            <div>
                                <div style={{
                                    background: '#f8f9ff',
                                    border: '1px solid #e0e4ff',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    marginBottom: '16px'
                                }}>
                                    <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>제목 미리보기</p>
                                    <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '1rem' }}>
                                        {previewTemplate(currentTemplate.subject)}
                                    </p>
                                </div>
                                <div style={{
                                    background: 'white',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '10px',
                                    padding: '24px',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.8',
                                    color: '#333',
                                    fontSize: '0.9rem'
                                }}>
                                    {previewTemplate(currentTemplate.body)}
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                        📌 이메일 제목
                                    </label>
                                    <input
                                        type="text"
                                        value={currentTemplate.subject}
                                        onChange={e => updateTemplate('subject', e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#667eea'}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                        placeholder="이메일 제목을 입력하세요..."
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                        📝 이메일 본문
                                    </label>
                                    <textarea
                                        value={currentTemplate.body}
                                        onChange={e => updateTemplate('body', e.target.value)}
                                        style={textareaStyle}
                                        onFocus={e => e.target.style.borderColor = '#667eea'}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                        placeholder="이메일 내용을 입력하세요..."
                                    />
                                    <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>
                                        💡 위의 변수 태그(예: {`{{name}}`})를 사용하면 수신자 이름이 자동으로 치환됩니다.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── BULK EMAIL TAB ─────────────────────────────────────────────── */}
            {activeTab === 'bulk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Stats bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                        {[
                            { label: '전체 회원', value: customers.length, color: '#667eea', icon: '👥' },
                            { label: '발송 대상', value: targetCustomers.length, color: '#22c55e', icon: '📬' },
                            { label: '이메일 없음', value: customers.filter(c => !c.email).length, color: '#f59e0b', icon: '⚠️' }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '18px 20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: `1px solid ${stat.color}25`
                            }}>
                                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Compose Form */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: '700', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={20} color="#667eea" /> 단체 이메일 작성
                        </h3>

                        {/* Target Group Selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                📋 발송 대상
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {[
                                    { key: 'all', label: `전체 회원 (${customers.length}명)`, color: '#667eea' }
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setTargetGroup(opt.key)}
                                        style={{
                                            padding: '9px 18px',
                                            borderRadius: '8px',
                                            border: `2px solid ${targetGroup === opt.key ? opt.color : '#ddd'}`,
                                            background: targetGroup === opt.key ? opt.color + '15' : 'white',
                                            color: targetGroup === opt.key ? opt.color : '#666',
                                            fontWeight: targetGroup === opt.key ? '700' : '500',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                📌 이메일 제목
                            </label>
                            <input
                                type="text"
                                value={bulkSubject}
                                onChange={e => setBulkSubject(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#667eea'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                                placeholder="예: [JSBlind] 봄맞이 특가 세일 안내 🌸"
                            />
                        </div>

                        {/* Quick template load */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                🔖 빠른 템플릿 불러오기
                            </label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {Object.values(templates).map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => {
                                            setBulkSubject(tpl.subject.replace('{{code}}', ''));
                                            setBulkBody(tpl.body.replace('{{code}}', '[코드]'));
                                        }}
                                        style={{
                                            padding: '6px 14px',
                                            background: '#f5f5ff',
                                            border: '1px solid #667eea40',
                                            borderRadius: '6px',
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {tpl.name} 불러오기
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>
                                📝 이메일 본문
                            </label>
                            <textarea
                                value={bulkBody}
                                onChange={e => setBulkBody(e.target.value)}
                                style={{ ...textareaStyle, minHeight: '260px' }}
                                onFocus={e => e.target.style.borderColor = '#667eea'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                                placeholder={`안녕하세요, {{name}}님!\n\n이메일 내용을 여기에 작성하세요.\n{{name}}은 수신자 이름으로 자동 대체됩니다.`}
                            />
                            <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>
                                💡 {'{{name}}'} 태그를 사용하면 각 수신자의 이름으로 자동 개인화됩니다.
                            </p>
                        </div>

                        {/* Preview box */}
                        {(bulkSubject || bulkBody) && (
                            <div style={{
                                background: '#f8f9ff',
                                border: '1px solid #e0e4ff',
                                borderRadius: '10px',
                                padding: '16px 20px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: '700', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    👁 미리보기 (샘플: 홍길동 / hong@example.com)
                                </p>
                                {bulkSubject && (
                                    <p style={{ margin: '0 0 10px', fontWeight: '700', color: '#1a1a2e' }}>
                                        제목: {previewTemplate(bulkSubject)}
                                    </p>
                                )}
                                {bulkBody && (
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#444', lineHeight: '1.7', borderTop: '1px solid #e0e4ff', paddingTop: '10px' }}>
                                        {previewTemplate(bulkBody)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Send result */}
                        {sendResult && (
                            <div style={{
                                padding: '14px 18px',
                                borderRadius: '10px',
                                marginBottom: '16px',
                                background: sendResult.type === 'error' ? '#fff0f0' : '#f0fdf4',
                                color: sendResult.type === 'error' ? '#d32f2f' : '#16a34a',
                                border: `1px solid ${sendResult.type === 'error' ? '#fca5a5' : '#86efac'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: '600'
                            }}>
                                {sendResult.type === 'error'
                                    ? <AlertCircle size={18} />
                                    : <CheckCircle size={18} />}
                                {sendResult.message}
                            </div>
                        )}

                        {/* Send Button */}
                        <button
                            onClick={handleSendBulk}
                            disabled={sending || loadingCustomers || !bulkSubject.trim() || !bulkBody.trim()}
                            style={{
                                ...btnPrimary,
                                padding: '14px 32px',
                                fontSize: '1rem',
                                opacity: (sending || !bulkSubject.trim() || !bulkBody.trim()) ? 0.6 : 1,
                                cursor: (sending || !bulkSubject.trim() || !bulkBody.trim()) ? 'not-allowed' : 'pointer',
                                width: '100%',
                                justifyContent: 'center',
                                background: sending
                                    ? '#999'
                                    : 'linear-gradient(135deg, #667eea, #764ba2)'
                            }}
                        >
                            {sending
                                ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> 발송 중... ({targetCustomers.length}명)</>
                                : <><Send size={18} /> {targetCustomers.length}명에게 이메일 발송</>
                            }
                        </button>
                    </div>

                    {/* Send History */}
                    <div style={cardStyle}>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} color="#888" /> 발송 내역
                            </h3>
                            {showHistory ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                        </button>

                        {showHistory && (
                            <div style={{ marginTop: '16px' }}>
                                {sendHistory.length === 0 ? (
                                    <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
                                        발송 내역이 없습니다.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {sendHistory.map(h => (
                                            <div key={h.id} style={{
                                                padding: '14px 18px',
                                                background: '#f9f9ff',
                                                borderRadius: '10px',
                                                border: '1px solid #e8e8ff',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '10px'
                                            }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{h.subject}</p>
                                                    <p style={{ margin: 0, color: '#888', fontSize: '0.78rem' }}>
                                                        {new Date(h.sentAt).toLocaleString('ko-KR')}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: '#22c55e20',
                                                        color: '#16a34a',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        ✓ {h.totalSent}명
                                                    </span>
                                                    {h.failCount > 0 && (
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            background: '#ef444420',
                                                            color: '#d32f2f',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '700'
                                                        }}>
                                                            ✗ {h.failCount}명
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default EmailManagement;
