'use client';

import Sidebar from '@/components/Sidebar';
import CustomerRegisterModal from '@/components/CustomerRegisterModal';
import { useState, useEffect } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';

import { Status, Customer } from '@/types/customer';
import { getStatusBadge, getStatusColor } from '@/utils/statusUtils';
import CustomerDetailModal from '@/components/CustomerDetailModal';

const statusOptions: Status[] = [
    '등록완료',
    '신용동의',
    '계약완료',
    '진행불가',
    '계약취소',
    '시공자료요청',
    '녹취완료',
    '1차정산완료',
    '최종정산완료'
];

export default function CustomerList() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [partnerName, setPartnerName] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('전체');
    const [datePreset, setDatePreset] = useState('전체');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isGuest, setIsGuest] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('kcc_partner');
        if (stored) {
            const partner = JSON.parse(stored);
            setPartnerName(partner.name);
            setIsGuest(partner.id === 'guest_demo');
        }
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const storedPartner = localStorage.getItem('kcc_partner') ? JSON.parse(localStorage.getItem('kcc_partner')!) : null;
            const myPartnerId = storedPartner?.id;
            const isGuest = myPartnerId === 'guest_demo';

            // Fetch from dedicated test sheet if guest, otherwise production sheet
            const response = await fetch(`/api/proxy?type=${isGuest ? 'guest_customers' : 'customers'}`, { cache: 'no-store' });
            const data = await response.json();

            if (Array.isArray(data)) {
                const storedPartner = localStorage.getItem('kcc_partner') ? JSON.parse(localStorage.getItem('kcc_partner')!) : null;
                const myPartnerId = String(storedPartner?.id || "").trim();
                const myPartnerName = String(storedPartner?.name || "").trim();

                console.log('My Partner Info:', { myPartnerId, myPartnerName });

                const filteredByPartner = data.filter((item: any) => {
                    // Normalize check for Partner ID and Name
                    const itemPartnerId = String(item.partnerId || item['파트너ID'] || item['파트너 ID'] || "").trim() || item.id;
                    const itemPartnerName = String(item.partnerName || item['파트너명'] || item['파트너 명'] || "").trim();

                    // Special case for guest_demo: if I am guest_demo, show all guest items that match my ID
                    if (myPartnerId === 'guest_demo' && itemPartnerId === 'guest_demo') return true;

                    return (myPartnerId && itemPartnerId === myPartnerId) ||
                        (myPartnerName && itemPartnerName === myPartnerName);
                });
                console.log('Filtered Customers Count:', filteredByPartner.length);

                const mappedData = filteredByPartner.map((item: any) => {
                    const findVal = (keywords: string[]) => {
                        const keys = Object.keys(item);
                        for (const k of keys) {
                            const normalizedK = k.toLowerCase().replace(/\s/g, '');
                            for (const key of keywords) {
                                if (normalizedK.includes(key.toLowerCase().replace(/\s/g, ''))) return item[k];
                            }
                        }
                        return null;
                    };

                    const amount = item.amount ? Number(item.amount.toString().replace(/,/g, '')).toLocaleString() : '0';
                    const birthDate = item.birthDate || findVal(['생년월일']) || '-';

                    return {
                        id: item.id || findVal(['고객번호', 'ID']) || item._id,
                        name: item.name || findVal(['신청자명', '이름']) || '이름 없음',
                        phone: item.phone || findVal(['연락처']) || '-',
                        birthDate: birthDate,
                        address: item.address || findVal(['주소']) || '-',
                        amount: amount,
                        downPayment: item.downPayment || findVal(['선납금']) || '0',
                        months: item.months || findVal(['구독기간', '구독개월']) || '-',
                        transferDate: item.transferDate || findVal(['이체희망일', '이체일']) || '-',
                        constructionDate: item.constructionDate || findVal(['시공일', '시공예정일']) || '',
                        statusUpdatedAt: item.statusUpdatedAt || findVal(['상태변경일', 'statusUpdatedAt']) || (item._creationTime ? new Date(item._creationTime).toISOString().split('T')[0] : (item.date ? item.date.toString().split('T')[0] : '-')),
                        date: item.date ? item.date.toString().split('T')[0] : (findVal(['접수일']) ? findVal(['접수일']).toString().split('T')[0] : '-'),
                        status: (() => {
                            const s = item.status || findVal(['상태', 'status', '진행상태', '상태값']);
                            const normalizedS = String(s || "").trim();
                            if (!normalizedS || normalizedS === '접수' || normalizedS === '신규접수') return '등록완료';
                            return normalizedS as Status;
                        })(),
                        remarks: item.remarks || findVal(['비고']) || '',
                        ownershipType: item.ownershipType || findVal(['주택소유']) || '미지정',
                        documents: item.docs_json ? (typeof item.docs_json === 'string' ? JSON.parse(item.docs_json) : item.docs_json) : (item.documents || {}),
                        createdAt: Number(item._creationTime || 0),
                        updatedAt: item.updatedAt ? (typeof item.updatedAt === 'string' ? new Date(item.updatedAt).getTime() : Number(item.updatedAt)) : 0,
                        lastUpdateType: item.lastUpdateType,
                    };
                });

                const sortedData = mappedData.sort((a, b) => {
                    const timeA = Math.max(a.updatedAt || 0, a.createdAt || 0);
                    const timeB = Math.max(b.updatedAt || 0, b.createdAt || 0);
                    if (timeA !== timeB) return timeB - timeA;
                    const dateA = (a.date && a.date !== '-') ? new Date(a.date).getTime() : 0;
                    const dateB = (b.date && b.date !== '-') ? new Date(b.date).getTime() : 0;
                    if (dateA !== dateB) return dateB - dateA;
                    return String(b.id || "").localeCompare(String(a.id || ""));
                });
                setCustomers(sortedData);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [partnerName]);

    // Filtering Logic
    const filteredCustomers = customers.filter(c => {
        // 1. Search Filter
        const matchesSearch =
            c.name.includes(searchTerm) ||
            c.phone.includes(searchTerm) ||
            c.address.includes(searchTerm) ||
            c.id.toString().includes(searchTerm);

        // 2. Status Filter
        const matchesStatus = filterStatus === '전체' || c.status === filterStatus;

        // 3. Date Filter
        let matchesDate = true;
        const customerDate = new Date(c.date);
        const now = new Date();

        if (datePreset !== '전체') {
            let limitDate = new Date();
            if (datePreset === '당월') {
                limitDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (datePreset === '전월') {
                const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                return customerDate >= firstOfLastMonth && customerDate <= lastOfLastMonth && matchesSearch && matchesStatus;
            } else if (datePreset === '3개월') {
                limitDate.setMonth(now.getMonth() - 3);
            } else if (datePreset === '6개월') {
                limitDate.setMonth(now.getMonth() - 6);
            } else if (datePreset === '1년') {
                limitDate.setFullYear(now.getFullYear() - 1);
            }
            matchesDate = customerDate >= limitDate;
        } else if (startDate && endDate) {
            matchesDate = customerDate >= new Date(startDate) && customerDate <= new Date(endDate);
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // rendering logic
    const renderLabels = (c: any) => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const updatedAt = typeof c.updatedAt === 'string' ? new Date(c.updatedAt).getTime() : Number(c.updatedAt || 0);
        const createdAt = typeof c.createdAt === 'string' ? new Date(c.createdAt).getTime() : Number(c.createdAt || 0);
        
        const isNew = createdAt ? (now - createdAt < oneDay) : false;
        const isUpdatedRecently = updatedAt && (now - updatedAt < oneDay);

        if (isUpdatedRecently && c.lastUpdateType && c.lastUpdateType !== 'new') {
            // Priority: show only the last specific label. If multiple, status takes precedence as it's more definitive.
            if (c.lastUpdateType.includes('status')) {
                return <span key="status" style={{ background: '#f59e0b', color: 'white', padding: '0.15rem 0.35rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 800, marginLeft: '0.4rem', whiteSpace: 'nowrap', verticalAlign: 'middle', letterSpacing: '-0.02em', display: 'inline-block', lineHeight: 1 }}>상태변경</span>;
            }
            if (c.lastUpdateType.includes('info')) {
                return <span key="info" style={{ background: '#3b82f6', color: 'white', padding: '0.15rem 0.35rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 800, marginLeft: '0.4rem', whiteSpace: 'nowrap', verticalAlign: 'middle', letterSpacing: '-0.02em', display: 'inline-block', lineHeight: 1 }}>정보변경</span>;
            }
        } 
        
        if (isNew || (isUpdatedRecently && c.lastUpdateType === 'new')) {
            return <span key="new" style={{ background: '#ef4444', color: 'white', padding: '0.15rem 0.35rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 800, marginLeft: '0.4rem', whiteSpace: 'nowrap', verticalAlign: 'middle', letterSpacing: '-0.02em', display: 'inline-block', lineHeight: 1 }}>NEW</span>;
        }

        return null;
    };


    return (
        <div className="dashboard-wrapper">
            {loading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#475569', fontWeight: 700 }}>
                        데이터를 불러오는 중입니다...
                    </p>
                    <style jsx>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
            <Sidebar />
            <main className="dashboard-main" style={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'hidden' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div className="header-content">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>고객 관리</h1>
                        <p style={{ color: 'var(--muted)' }}>등록된 모든 고객 신청 내역을 조회하고 관리합니다.</p>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={() => fetchCustomers()}
                            disabled={loading}
                            className="refresh-button"
                        >
                            <span style={{
                                animation: loading ? 'spin 1s linear infinite' : 'none',
                                display: 'inline-block',
                                fontSize: '1.1rem'
                            }}>🔄</span>
                            새로고침
                        </button>
                        <button
                            className="register-button"
                            onClick={() => setIsRegisterModalOpen(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '0.75rem',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                whiteSpace: 'nowrap',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>👤+</span>
                            신규 등록
                        </button>
                    </div>
                </header>

                <style jsx>{`
                    .dashboard-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    .header-content {
                        flex: 1;
                        min-width: 200px;
                    }
                    .refresh-button {
                        display: inline-flex;
                        align-items: center;
                        padding: 0.6rem 1.2rem;
                        border-radius: 0.75rem;
                        background-color: #fff;
                        border: 1px solid #e2e8f0;
                        color: #475569;
                        font-size: 0.9rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s;
                        gap: 0.5rem;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        white-space: nowrap;
                    }
                    .refresh-button:hover {
                        background-color: #f8fafc;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .refresh-button:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                        transform: none;
                    }

                    /* Enforce Table View and Scroll */
                    .desktop-only-table { display: block !important; width: 100%; overflow-x: auto; }
                    .mobile-cards-container { display: none !important; }

                    @media (max-width: 1024px) {
                        .dashboard-header { flex-direction: column; align-items: stretch; gap: 1rem; }
                        .header-actions {
                            display: grid !important;
                            grid-template-columns: 1fr 1.2fr;
                            gap: 0.5rem;
                            width: 100%;
                        }
                        .refresh-button, .register-button { 
                            width: 100% !important; 
                            justify-content: center !important; 
                            padding: 0.75rem 0.5rem !important;
                            font-size: 0.85rem !important;
                        }
                        
                        .period-filter-scroll {
                            display: flex !important;
                            flex-wrap: wrap !important;
                            gap: 0.5rem !important;
                            background: transparent !important;
                            padding: 0 !important;
                        }
                        .period-filter-scroll button {
                            flex: 1 1 auto !important;
                            min-width: 60px !important;
                            padding: 0.5rem 0.25rem !important;
                            font-size: 0.75rem !important;
                            white-space: nowrap !important;
                            border: 1px solid #e2e8f0 !important;
                        }
                        .period-filter-scroll button[style*="background: white"] {
                            border-color: #3b82f6 !important;
                        }
                        
                        .customer-card {
                            background: white;
                            border-radius: 1.25rem;
                            border: 1px solid #e2e8f0;
                            padding: 1.5rem;
                            box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);
                            position: relative;
                            border-left: 6px solid #e2e8f0;
                        }
                        .customer-card:active { transform: scale(0.98); }
                        
                        .modal-header-container { flex-direction: column !important; align-items: stretch !important; padding: 1.25rem !important; }
                        .modal-content-container { padding: 0.75rem !important; }
                        .modal-footer-container { flex-direction: column-reverse !important; gap: 0.75rem !important; padding: 1.25rem !important; }
                        .modal-footer-container .spacer { display: none; }
                        .modal-footer-container button { width: 100% !important; margin: 0 !important; white-space: nowrap !important; word-break: keep-all !important; }
                        
                        .modal-grid-3, .modal-grid-2 { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
                        .modal-grid-3 > div, .modal-grid-2 > div { grid-column: span 1 !important; }
                        
                        .modal-header-actions {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 0.5rem !important;
                            margin-top: 1rem;
                            width: 100%;
                        }
                        .modal-header-actions button {
                            padding: 0.75rem !important;
                            font-size: 0.8rem !important;
                            justify-content: center;
                            white-space: nowrap !important;
                            word-break: keep-all !important;
                        }
                        .modal-header-actions .close-btn { display: none; }

                        .desktop-only-table { display: block !important; width: 100%; overflow-x: auto; }
                        .mobile-cards-container { display: none !important; }
                        
                        .modal-info-section, .modal-financial-section, .modal-doc-section, .modal-date-section {
                            padding: 1.25rem !important;
                            border-radius: 1rem !important;
                            margin-bottom: 1.5rem !important;
                        }

                        .search-input-wrapper { width: 100% !important; min-width: 100% !important; }
                        .status-filter-wrapper { width: 100% !important; }
                        .status-filter-wrapper select { width: 100% !important; min-width: 100% !important; }
                    }
                `}</style>

                <section className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Search & Status Filter */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div className="search-input-wrapper" style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="고객명, 연락처, 주소로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                        <div className="status-filter-wrapper" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        padding: '0.5rem 2.5rem 0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.75rem',
                                        color: filterStatus === '전체' ? '#64748b' : '#3b82f6',
                                        background: 'white',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        fontWeight: 800,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s',
                                        minWidth: '130px'
                                    }}
                                >
                                    <option value="전체">모든 상태</option>
                                    {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                        <div className="period-filter-scroll" style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {['전체', '당월', '전월', '3개월', '6개월', '1년', '기간선택'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        borderRadius: '0.375rem',
                                        background: datePreset === p ? 'white' : 'transparent',
                                        color: datePreset === p ? 'var(--primary)' : '#64748b',
                                        boxShadow: datePreset === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {datePreset === '기간선택' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                                />
                                <span style={{ color: '#94a3b8' }}>~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                                />
                            </div>
                        )}

                        <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#64748b' }}>
                            총 <strong>{filteredCustomers.length}</strong>건 발견
                        </div>
                    </div>
                </section>

                <section className="card" style={{ padding: '0', overflow: 'auto' }}>
                    <div className="desktop-only-table" style={{ width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1400px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>신청일</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>고객명</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>연락처</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>생년월일</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>주소</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>구독 원금</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>구독 기간</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>시공 예정일</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>상태</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</td>
                                    </tr>
                                ) : filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((app, i) => (
                                        <tr
                                            key={app.id || i}
                                            onClick={() => setSelectedCustomer(app)}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            className="hover-row"
                                        >
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {app.name}
                                                    {renderLabels(app as any)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#475569', whiteSpace: 'nowrap' }}>{app.phone}</td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.birthDate}</td>
                                            <td style={{
                                                padding: '1rem',
                                                color: '#64748b',
                                                minWidth: '250px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: '1.4'
                                            }} title={app.address}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const total = Number((app.amount || '0').replace(/,/g, ''));
                                                    const down = Number((app.downPayment || '0').replace(/,/g, ''));
                                                    return (total - down).toLocaleString();
                                                })()}원
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.months}{app.months !== '-' ? '개월' : ''}</td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.constructionDate || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>{getStatusBadge(app.status, app.statusUpdatedAt)}</td>
                                            <td style={{ padding: '1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{app.remarks || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>검색 결과가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mobile-cards-container">
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</div>
                        ) : filteredCustomers.length > 0 ? (
                            filteredCustomers.map((app, i) => (
                                <div 
                                    key={app.id || i} 
                                    className="customer-card" 
                                    onClick={() => setSelectedCustomer(app)}
                                    style={{ borderLeftColor: getStatusColor(app.status) }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>신청일: {app.date}</span>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}>
                                                {app.name}
                                                {renderLabels(app as any)}
                                            </h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            {getStatusBadge(app.status, app.statusUpdatedAt)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                                            <span style={{ fontSize: '1.1rem' }}>📞</span>
                                            <div>
                                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, margin: 0, marginBottom: '0.1rem' }}>연락처</p>
                                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{app.phone}</p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                                            <span style={{ fontSize: '1.1rem' }}>📍</span>
                                            <div>
                                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, margin: 0, marginBottom: '0.1rem' }}>시공 주소</p>
                                                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#475569', margin: 0, lineHeight: 1.4 }}>{app.address}</p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #dbeafe' }}>
                                            <span style={{ fontSize: '1.1rem' }}>💰</span>
                                            <div>
                                                <p style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800, margin: 0, marginBottom: '0.1rem' }}>결제 정보 ({app.months}개월)</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>
                                                    {(() => {
                                                        const total = Number((app.amount || '0').replace(/,/g, ''));
                                                        const down = Number((app.downPayment || '0').replace(/,/g, ''));
                                                        return (total - down).toLocaleString();
                                                    })()}원
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {app.remarks && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dotted #e2e8f0', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            <span style={{ fontWeight: 800 }}>📌 메모:</span> {app.remarks}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>검색 결과가 없습니다.</div>
                        )}
                    </div>
                </section>


            </main>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    isGuest={isGuest}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={async (updated) => {
                        // Proactive update for instant label change
                        setCustomers(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated, updatedAt: Date.now(), lastUpdateType: 'status' } : c));
                        await fetchCustomers();
                        setSelectedCustomer(null);
                    }}
                />
            )}

            <CustomerRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={fetchCustomers}
            />
        </div>
    );
}

