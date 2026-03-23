'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { Customer, Status } from '@/types/customer';
import { getStatusBadge, getStatusColor } from '@/utils/statusUtils';
import CustomerDetailModal from '@/components/CustomerDetailModal';
import { addBusinessDays, formatDateWithDay } from '@/utils/dateUtils';

export default function Settlement() {
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    
    // Filters
    const [datePreset, setDatePreset] = useState('전체');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchSettlementData = async () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem('kcc_partner');
            const partner = stored ? JSON.parse(stored) : null;
            const myPartnerId = partner?.id;
            const myPartnerName = partner?.name;
            const guestStatus = partner?.id === 'guest_demo';
            setIsGuest(guestStatus);

            const response = await fetch(`/api/proxy?type=${guestStatus ? 'guest_customers' : 'customers'}`, { cache: 'no-store' });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const mappedData = data.filter((item: any) => {
                    const itemPartnerId = item.partnerId || item['파트너ID'] || item['파트너 ID'] || item.id;
                    const itemPartnerName = item.partnerName || item['파트너명'] || item['파트너 명'];
                    return (myPartnerId && String(itemPartnerId) === String(myPartnerId)) ||
                           (myPartnerName && itemPartnerName === myPartnerName);
                }).map((item: any) => {
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
                        contractDate: item.contractDate,
                        recordingDate: item.recordingDate,
                        settlement1Date: item.settlement1Date || findVal(['1차정산예정일', '1차정산일', '정산1일']),
                        settlement1Amount: item.settlement1Amount || findVal(['1차정산금액', '1차정산금', '정산1금']) || '0',
                        settlement2Date: item.settlement2Date || findVal(['최종정산예정일', '최종정산일', '정산2일', '2차정산일']),
                        settlement2Amount: item.settlement2Amount || findVal(['최종정산금액', '최종정산금', '정산2금', '2차정산금']) || '0',
                        createdAt: Number(item._creationTime || 0),
                        updatedAt: item.updatedAt ? (typeof item.updatedAt === 'string' ? new Date(item.updatedAt).getTime() : Number(item.updatedAt)) : 0,
                        lastUpdateType: item.lastUpdateType,
                    } as Customer;
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
                setAllCustomers(sortedData);
            } else {
                setAllCustomers([]);
            }
        } catch (error) {
            console.error('Failed to fetch settlement data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlementData();
    }, []);

    const inProgressStatuses: Status[] = ['계약완료', '시공자료요청', '녹취완료', '1차정산완료'];
    
    // Filter by Date
    const getFilteredList = (list: Customer[]) => {
        return list.filter(c => {
            const customerDate = new Date(c.date);
            const now = new Date();
            
            if (datePreset === '전체') return true;
            
            if (datePreset === '기간선택') {
                if (!startDate || !endDate) return true;
                return customerDate >= new Date(startDate) && customerDate <= new Date(endDate);
            }

            let limitDate = new Date();
            if (datePreset === '당월') {
                limitDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (datePreset === '전월') {
                const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                return customerDate >= firstOfLastMonth && customerDate <= lastOfLastMonth;
            } else if (datePreset === '3개월') {
                limitDate.setMonth(now.getMonth() - 3);
            } else if (datePreset === '6개월') {
                limitDate.setMonth(now.getMonth() - 6);
            } else if (datePreset === '1년') {
                limitDate.setFullYear(now.getFullYear() - 1);
            }
            return customerDate >= limitDate;
        });
    };

    const filteredCustomers = getFilteredList(allCustomers);
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompleted = (c: Customer) => c.status === '최종정산완료' || (c.settlement2Date && c.settlement2Date <= todayStr);
    
    const completed = filteredCustomers.filter(c => isCompleted(c));
    const inProgress = filteredCustomers.filter(c => inProgressStatuses.includes(c.status) && !isCompleted(c));

    // Calculate totals using (amount - downPayment)
    const calculateTotal = (list: Customer[]) => {
        return list.reduce((acc, cur) => {
            const total = Number((cur.amount || '0').replace(/,/g, ''));
            const down = Number((cur.downPayment || '0').replace(/,/g, ''));
            return acc + (total - down);
        }, 0);
    };

    const calculateTotalCompleted = (list: Customer[]) => {
        const today = new Date().toISOString().split('T')[0];
        return list.reduce((acc, cur) => {
            let sum = 0;
            // First settlement
            if (cur.settlement1Date && cur.settlement1Date <= today) {
                sum += Number(cur.settlement1Amount?.toString().replace(/,/g, '') || 0);
            }
            // Final settlement
            if (cur.settlement2Date && cur.settlement2Date <= today) {
                sum += Number(cur.settlement2Amount?.toString().replace(/,/g, '') || 0);
            }
            return acc + sum;
        }, 0);
    };

    const totalExpected = calculateTotal(inProgress);
    const totalCompleted = calculateTotalCompleted(filteredCustomers);

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
                </div>
            )}
            <Sidebar />
            <main className="dashboard-main">
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div className="header-content">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>정산 관리</h1>
                        <p style={{ color: 'var(--muted)' }}>구독 계약 완료 건에 대한 정산 진행 현황을 조회합니다.</p>
                    </div>
                    <button
                        onClick={() => fetchSettlementData()}
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
                </header>

                {/* Date Filters Area */}
                <section className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="filter-scroll-container">
                        <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 800, whiteSpace: 'nowrap' }}>기간 필터</div>
                        <div className="period-filter-scroll">
                            {['전체', '당월', '전월', '3개월', '6개월', '1년', '기간선택'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    className={`preset-button ${datePreset === p ? 'active' : ''}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {datePreset === '기간선택' && (
                            <div className="date-picker-group">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="date-input"
                                />
                                <span style={{ color: '#94a3b8' }}>~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="date-input"
                                />
                            </div>
                        )}
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                    <div className="card" style={{ background: 'white', borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>정산 대상 금액</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af' }}>{totalExpected.toLocaleString()}원</h2>
                    </div>
                    <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
                        <p style={{ color: '#166534', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>정산 완료 금액</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>{totalCompleted.toLocaleString()}원</h2>
                    </div>
                </div>

                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '3px' }}></span>
                        정산 진행 중 목록
                    </h3>
                    
                    {/* Desktop Table */}
                    <div className="desktop-only-table card" style={{ padding: 0, overflow: 'auto', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1500px' }}>
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
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap' }}>1차정산금(예정일)</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>최종정산금(예정일)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</td>
                                        </tr>
                                    ) : inProgress.length > 0 ? inProgress.map((app) => (
                                        <tr 
                                            key={app.id} 
                                            onClick={() => setSelectedCustomer(app)}
                                            style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s' }}
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
                                            <td style={{ padding: '1rem', color: '#64748b', minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.address}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const total = Number((app.amount || '0').replace(/,/g, ''));
                                                    const down = Number((app.downPayment || '0').replace(/,/g, ''));
                                                    return (total - down).toLocaleString();
                                                })()}원
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.months}개월</td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.constructionDate || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>{getStatusBadge(app.status, app.statusUpdatedAt)}</td>
                                            <td style={{ padding: '1rem', fontWeight: 800, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                                                {app.settlement1Date ? (
                                                    <div>
                                                        <div>{app.settlement1Date}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>({Number(app.settlement1Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</div>
                                                    </div>
                                                ) : app.contractDate ? (
                                                    formatDateWithDay(addBusinessDays(app.contractDate, 3))
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 800, color: '#059669', whiteSpace: 'nowrap' }}>
                                                {app.settlement2Date ? (
                                                    <div>
                                                        <div>{app.settlement2Date}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>({Number(app.settlement2Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</div>
                                                    </div>
                                                ) : app.recordingDate ? (
                                                    formatDateWithDay(addBusinessDays(app.recordingDate, 3))
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>진행 중인 정산 건이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="mobile-cards-container" style={{ display: 'none' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>불러오는 중...</div>
                        ) : inProgress.length > 0 ? inProgress.map((app) => (
                            <div 
                                key={app.id} 
                                className="customer-card" 
                                onClick={() => setSelectedCustomer(app)}
                                style={{ borderLeft: `6px solid ${getStatusColor(app.status)}` }}
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
                                        <div style={{ flex: 1 }}>
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 800, marginBottom: '0.25rem' }}>1차정산금(예정일)</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>
                                                {app.settlement1Date ? (
                                                    <>
                                                        {app.settlement1Date}
                                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>({Number(app.settlement1Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</span>
                                                    </>
                                                ) : app.contractDate ? (
                                                    formatDateWithDay(addBusinessDays(app.contractDate, 3))
                                                ) : '-'}
                                            </p>
                                        </div>
                                        <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 800, marginBottom: '0.25rem' }}>최종정산금(예정일)</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>
                                                {app.settlement2Date ? (
                                                    <>
                                                        {app.settlement2Date}
                                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>({Number(app.settlement2Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</span>
                                                    </>
                                                ) : app.recordingDate ? (
                                                    formatDateWithDay(addBusinessDays(app.recordingDate, 3))
                                                ) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {app.remarks && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 800, color: '#94a3b8', flexShrink: 0 }}>📌 메모:</span>
                                        <span>{app.remarks}</span>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>진행 중인 정산 건이 없습니다.</div>
                        )}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                        <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span>
                        최종 지급 완료 건
                    </h3>
                    
                    {/* Desktop Table */}
                    <div className="desktop-only-table card" style={{ padding: 0, overflow: 'auto', borderRadius: '1rem', border: '1px solid #e2e8f0', opacity: 0.9 }}>
                        <div style={{ width: '100%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1500px' }}>
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
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap' }}>1차정산금(예정일)</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>최종정산금(예정일)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</td>
                                        </tr>
                                    ) : completed.length > 0 ? completed.map((app) => (
                                        <tr 
                                            key={app.id} 
                                            onClick={() => setSelectedCustomer(app)}
                                            style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s' }}
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
                                            <td style={{ padding: '1rem', color: '#64748b', minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.address}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const total = Number((app.amount || '0').replace(/,/g, ''));
                                                    const down = Number((app.downPayment || '0').replace(/,/g, ''));
                                                    return (total - down).toLocaleString();
                                                })()}원
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.months}개월</td>
                                            <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{app.constructionDate || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>{getStatusBadge(app.status, app.statusUpdatedAt)}</td>
                                            <td style={{ padding: '1rem', fontWeight: 800, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                                                {app.settlement1Date ? (
                                                    <div>
                                                        <div>{app.settlement1Date}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>({Number(app.settlement1Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</div>
                                                    </div>
                                                ) : app.contractDate ? (
                                                    formatDateWithDay(addBusinessDays(app.contractDate, 3))
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 800, color: '#059669', whiteSpace: 'nowrap' }}>
                                                {app.settlement2Date ? (
                                                    <div>
                                                        <div>{app.settlement2Date}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>({Number(app.settlement2Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</div>
                                                    </div>
                                                ) : app.recordingDate ? (
                                                    formatDateWithDay(addBusinessDays(app.recordingDate, 3))
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>최종 지급 완료된 정산 건이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="mobile-cards-container" style={{ display: 'none' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>불러오는 중...</div>
                        ) : completed.length > 0 ? completed.map((app) => (
                            <div 
                                key={app.id} 
                                className="customer-card" 
                                onClick={() => setSelectedCustomer(app)}
                                style={{ borderLeft: `6px solid ${getStatusColor(app.status)}` }}
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
                                        <div style={{ flex: 1 }}>
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 800, marginBottom: '0.25rem' }}>1차정산금(예정일)</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>
                                                {app.settlement1Date ? (
                                                    <>
                                                        {app.settlement1Date}
                                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>({Number(app.settlement1Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</span>
                                                    </>
                                                ) : app.contractDate ? (
                                                    formatDateWithDay(addBusinessDays(app.contractDate, 3))
                                                ) : '-'}
                                            </p>
                                        </div>
                                        <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#15803d', fontWeight: 800, marginBottom: '0.25rem' }}>최종정산금(예정일)</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>
                                                {app.settlement2Date ? (
                                                    <>
                                                        {app.settlement2Date}
                                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>({Number(app.settlement2Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}원)</span>
                                                    </>
                                                ) : app.recordingDate ? (
                                                    formatDateWithDay(addBusinessDays(app.recordingDate, 3))
                                                ) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {app.remarks && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 800, color: '#94a3b8', flexShrink: 0 }}>📌 메모:</span>
                                        <span>{app.remarks}</span>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '1rem' }}>최종 지급 완료된 정산 건이 없습니다.</div>
                        )}
                    </div>
                </section>
            </main>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    isGuest={isGuest}
                    onClose={() => setSelectedCustomer(null)}
                    mode="settlement"
                    onUpdate={async (updated) => {
                        await fetchSettlementData();
                        setSelectedCustomer(null); // Close modal and force re-render
                    }}
                />
            )}

            <style jsx global>{`
                .hover-row:hover { background-color: #f8fafc !important; }
                .card { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

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

                .filter-scroll-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                }

                .period-filter-scroll {
                    display: flex;
                    gap: 0.25rem;
                    background: #f8fafc;
                    padding: 0.25rem;
                    border-radius: 0.6rem;
                }

                .preset-button {
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: transparent;
                    color: #64748b;
                    white-space: nowrap;
                }

                .preset-button.active {
                    background: white;
                    color: #3b82f6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .desktop-only-table { display: block !important; width: 100%; overflow-x: auto; }
                .mobile-cards-container { display: none !important; }

                .date-picker-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .date-input {
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    font-size: 0.8rem;
                }

                .customer-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
                    border-left-width: 6px;
                }

                @media (max-width: 1024px) {
                    .dashboard-header { flex-direction: column; align-items: stretch; gap: 1rem; }
                    .refresh-button { width: 100%; justify-content: center; padding: 0.8rem; }
                    
                    .desktop-only-table { display: block !important; width: 100%; overflow-x: auto; }
                    .mobile-cards-container { display: none !important; }
                    
                    .filter-scroll-container {
                        overflow-x: auto;
                        flex-wrap: nowrap;
                        padding-bottom: 0.5rem;
                        scrollbar-width: none;
                    }
                    .filter-scroll-container::-webkit-scrollbar { display: none; }

                    .period-filter-scroll {
                        flex-shrink: 0;
                    }
                }
            `}</style>
        </div>
    );
}
