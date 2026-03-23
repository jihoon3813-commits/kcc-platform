'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';
import { Customer, Status } from '@/types/customer';
import { getStatusBadge, getStatusColor } from '@/utils/statusUtils';
import CustomerDetailModal from '@/components/CustomerDetailModal';
import { addBusinessDays, formatDateWithDay } from '@/utils/dateUtils';

export default function AdminSettlement() {
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    
    // Filters
    const [datePreset, setDatePreset] = useState('전체');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchSettlementData = async () => {
        setLoading(true);
        try {
            const [cRes, gRes] = await Promise.all([
                fetch('/api/proxy?type=customers', { cache: 'no-store' }),
                fetch('/api/proxy?type=guest_customers', { cache: 'no-store' })
            ]);
            const cData = await cRes.json();
            const gData = await gRes.json();
            
            const data = [...(Array.isArray(cData) ? cData : []), ...(Array.isArray(gData) ? gData : [])];
            
            if (Array.isArray(data)) {
                const mappedData = data.map((item: any) => {
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
                        partnerName: item.partnerName || findVal(['파트너사명', '업체명', '파트너명']) || '-',
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
            if (!c.date || c.date === '-') return datePreset === '전체';
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

    // Calculate totals
    const calculateTotal = (list: Customer[]) => {
        return list.reduce((acc, cur) => {
            const total = Number((cur.amount || '0').toString().replace(/,/g, ''));
            const down = Number((cur.downPayment || '0').toString().replace(/,/g, ''));
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
        <div className="admin-page-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b', overflowX: 'hidden', width: '100%' }}>
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
                        관리 데이터를 불러오는 중입니다...
                    </p>
                </div>
            )}
            <AdminSidebar />
            <main className="admin-main-container" style={{ 
                flex: 1, 
                padding: '2.5rem', 
                marginLeft: '260px', 
                boxSizing: 'border-box', 
                width: 'calc(100% - 260px)', 
                minWidth: 0, 
                position: 'relative' 
            }}>
                <header className="admin-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="header-content">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>정산 관리 (전체)</h1>
                        <p style={{ color: '#64748b' }}>플랫폼 전체 파트너사의 정산 진행 현황을 조회하고 관리합니다.</p>
                    </div>
                    <button
                        onClick={() => fetchSettlementData()}
                        disabled={loading}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '0.75rem',
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            gap: '0.5rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                    >
                        <span style={{
                            animation: loading ? 'spin 1.5s linear infinite' : 'none',
                            display: 'inline-block',
                            fontSize: '1.1rem'
                        }}>🔄</span>
                        새로고침
                    </button>
                </header>

                {/* Date Filters Area */}
                <section style={{ background: 'white', padding: '1.25rem', borderRadius: '1rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 800, whiteSpace: 'nowrap' }}>기간 필터</div>
                        <div style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.6rem' }}>
                            {['전체', '당월', '전월', '3개월', '6개월', '1년', '기간선택'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: datePreset === p ? 'white' : 'transparent',
                                        color: datePreset === p ? '#3b82f6' : '#64748b',
                                        boxShadow: datePreset === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        whiteSpace: 'nowrap'
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
                                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                                />
                                <span style={{ color: '#94a3b8' }}>~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', borderLeft: '4px solid #3b82f6', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>전체 정산 대상 금액</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af' }}>{totalExpected.toLocaleString()}원</h2>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: '1rem', borderLeft: '4px solid #10b981', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#166534', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>전체 정산 완료 금액</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>{totalCompleted.toLocaleString()}원</h2>
                    </div>
                </div>

                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '3px' }}></span>
                        정산 진행 중 목록
                    </h3>
                    
                    <div className="desktop-only-table" style={{ background: 'white', padding: 0, overflowX: 'auto', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%' }}>
                        <div style={{ width: '100%', minWidth: 'min-content' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1600px' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>신청일</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>파트너사</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>고객명</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>연락처</th>
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
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#0046AD', whiteSpace: 'nowrap' }}>{app.partnerName}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{app.name}</td>
                                            <td style={{ padding: '1rem', color: '#475569', whiteSpace: 'nowrap' }}>{app.phone}</td>
                                            <td style={{ padding: '1rem', color: '#64748b', minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.address}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const total = Number((app.amount || '0').toString().replace(/,/g, ''));
                                                    const down = Number((app.downPayment || '0').toString().replace(/,/g, ''));
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
                </section>

                <section>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                        <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></span>
                        최종 지급 완료 건
                    </h3>
                    
                    <div className="desktop-only-table" style={{ background: 'white', padding: 0, overflowX: 'auto', borderRadius: '1rem', border: '1px solid #e2e8f0', opacity: 0.9, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%' }}>
                        <div style={{ width: '100%', minWidth: 'min-content' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1600px' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>신청일</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>파트너사</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>고객명</th>
                                        <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>연락처</th>
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
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#0046AD', whiteSpace: 'nowrap' }}>{app.partnerName}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {app.name}
                                                    {renderLabels(app as any)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#475569', whiteSpace: 'nowrap' }}>{app.phone}</td>
                                            <td style={{ padding: '1rem', color: '#64748b', minWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.address}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap' }}>
                                                {(() => {
                                                    const total = Number((app.amount || '0').toString().replace(/,/g, ''));
                                                    const down = Number((app.downPayment || '0').toString().replace(/,/g, ''));
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
                </section>
            </main>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    isGuest={(selectedCustomer as any).isGuest || false}
                    isAdmin={true}
                    mode="settlement"
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={async (updated) => {
                        await fetchSettlementData();
                        setSelectedCustomer(null);
                    }}
                />
            )}

            <style jsx global>{`
                .hover-row:hover { background-color: #f8fafc !important; }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0 !important;
                        padding: 1.5rem !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}
