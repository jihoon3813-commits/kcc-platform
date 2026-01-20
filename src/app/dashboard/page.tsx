'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

type Status =
    | '접수'
    | '신용동의 완료'
    | '1차승인(추가 서류 등록 必)'
    | '1차서류 등록완료'
    | '최종승인(시공계약서 등록 必)'
    | '최종서류 등록완료'
    | '전자서명/녹취 진행중'
    | '녹취완료/정산대기'
    | '정산완료'
    | '1차 불가'
    | '최종 불가';

interface AuditDocument {
    name: string;
    uploadedAt: string;
    url?: string;
}

interface Customer {
    id: string | number;
    name: string;
    phone: string;
    address: string;
    amount: string;
    date: string;
    status: Status;
    remarks: string;
    documents: Record<string, AuditDocument>;
}

export default function Dashboard() {
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('전체');
    const [partnerName, setPartnerName] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('kcc_partner');
        if (stored) {
            setPartnerName(JSON.parse(stored).name);
        }
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const storedPartner = localStorage.getItem('kcc_partner') ? JSON.parse(localStorage.getItem('kcc_partner')!) : null;
            const myPartnerId = storedPartner?.id;
            const myPartnerName = storedPartner?.name;
            const isGuest = myPartnerId === 'guest_demo';

            // Fetch from dedicated test sheet if guest, otherwise production sheet
            const response = await fetch(`/api/proxy?type=${isGuest ? 'guest_customers' : 'customers'}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                const storedPartner = localStorage.getItem('kcc_partner') ? JSON.parse(localStorage.getItem('kcc_partner')!) : null;
                const myPartnerId = storedPartner?.id;
                const myPartnerName = storedPartner?.name;

                const filteredData = data.filter((item: any) => {
                    // Strict filtering: only show if Partner ID or Partner Name matches
                    const itemPartnerId = item['파트너ID'] || item['파트너 ID'] || item['partnerId'];
                    const itemPartnerName = item['파트너명'] || item['partnerName'];

                    return (myPartnerId && itemPartnerId === myPartnerId) ||
                        (myPartnerName && itemPartnerName === myPartnerName);
                });

                const mappedData = filteredData.map((item: any) => {
                    const rawAmount = item['최종 견적가'] || item['견적금액'] || '0';
                    const sanitizedAmount = rawAmount.toString().replace(/,/g, '');
                    const amount = isNaN(Number(sanitizedAmount)) ? '0' : Number(sanitizedAmount).toLocaleString();

                    return {
                        id: item['고객번호'] || item.ID || Math.random(),
                        name: item['신청자명'] || '이름 없음',
                        phone: item['연락처'] || '-',
                        address: item['주소'] || '-',
                        amount: amount,
                        date: item['접수일'] ? item['접수일'].toString().split('T')[0] : '-',
                        status: (item['상태'] || '접수') as Status,
                        remarks: item['비고'] || '',
                        documents: item['documents'] ? (typeof item['documents'] === 'string' ? JSON.parse(item['documents']) : item['documents']) : {}
                    };
                });

                setAllCustomers(mappedData.reverse() as Customer[]);
            } else {
                setAllCustomers([]);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [partnerName]);

    // Metrics Calculation
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyApps = allCustomers.filter(c => c.date.startsWith(currentMonth));

    const countCreditConsent = allCustomers.filter(c => c.status === '접수').length;
    const countFirstDoc = allCustomers.filter(c => c.status === '1차승인(추가 서류 등록 必)').length;
    const countFinalDoc = allCustomers.filter(c => c.status === '최종승인(시공계약서 등록 必)').length;

    const finalSuccessStates = ['최종승인(시공계약서 등록 必)', '최종서류 등록완료', '전자서명/녹취 진행중', '녹취완료/정산대기', '정산완료'];
    const countFinalSuccess = allCustomers.filter(c => finalSuccessStates.includes(c.status)).length;
    const approvalRate = allCustomers.length > 0 ? ((countFinalSuccess / allCustomers.length) * 100).toFixed(1) : '0';

    const parseAmount = (amt: string) => Number(amt.replace(/,/g, ''));

    const pendingSettlement = allCustomers
        .filter(c => c.status === '녹취완료/정산대기')
        .reduce((sum, c) => sum + parseAmount(c.amount), 0);

    const completedSettlement = allCustomers
        .filter(c => c.status === '정산완료')
        .reduce((sum, c) => sum + parseAmount(c.amount), 0);

    const stats = [
        { id: 'monthly', label: '당월 신청 건수', value: `${monthlyApps.length}건`, trend: '이번 달 기준', color: 'var(--primary)' },
        { id: 'consent', label: '신용동의 대기', value: `${countCreditConsent}건`, trend: '조회 요청 必', color: 'var(--warning)' },
        { id: 'firstDoc', label: '1차서류 필요', value: `${countFirstDoc}건`, trend: '심사 진행 必', color: '#EF4444' },
        { id: 'finalDoc', label: '최종서류 필요', value: `${countFinalDoc}건`, trend: '계약서 등록 必', color: '#10B981' },
        { id: 'rate', label: '최종 승인율', value: `${approvalRate}%`, trend: '누적 합계', color: '#6366f1' },
        { id: 'pending', label: '정산 예정 금액', value: `${pendingSettlement.toLocaleString()}원`, trend: '녹취 완료건', color: '#7C3AED' },
        { id: 'complete', label: '정산 완료 금액', value: `${completedSettlement.toLocaleString()}원`, trend: '정산 성공건', color: '#059669' },
    ];

    const tabs = ['전체', '접수/심사', '승인/계약', '정산완료'];

    const handleStatClick = (statId: string) => {
        if (statId === 'monthly') setActiveTab('전체');
        else if (statId === 'consent') setActiveTab('접수/심사');
        else if (statId === 'firstDoc') setActiveTab('접수/심사');
        else if (statId === 'finalDoc') setActiveTab('승인/계약');
        else if (statId === 'pending') setActiveTab('정산완료');
        else if (statId === 'complete') setActiveTab('정산완료');
    };

    const filteredCustomers = allCustomers.filter(c => {
        if (activeTab === '전체') return true;
        if (activeTab === '접수/심사') return ['접수', '신용동의 완료', '1차승인(추가 서류 등록 必)', '1차서류 등록완료'].includes(c.status);
        if (activeTab === '승인/계약') return ['최종승인(시공계약서 등록 必)', '최종서류 등록완료', '전자서명/녹취 진행중'].includes(c.status);
        if (activeTab === '정산완료') return ['녹취완료/정산대기', '정산완료'].includes(c.status);
        return false;
    }).slice(0, 10); // Dashboard shows more but limited

    const getStatusBadge = (status: Status) => {
        let color = '#4B5563';
        let bg = '#F3F4F6';

        if (['1차서류 등록완료', '최종서류 등록완료', '정산완료'].includes(status)) {
            color = '#059669';
            bg = '#D1FAE5';
        } else if (status === '1차 불가' || status === '최종 불가') {
            color = '#DC2626';
            bg = '#FEE2E2';
        } else if (['신용동의 완료', '전자서명/녹취 진행중'].includes(status)) {
            color = '#2563EB';
            bg = '#DBEAFE';
        } else if (['1차승인(추가 서류 등록 必)', '최종승인(시공계약서 등록 必)'].includes(status)) {
            color = '#D97706';
            bg = '#FEF3C7';
        } else if (status === '녹취완료/정산대기') {
            color = '#7C3AED';
            bg = '#EDE9FE';
        }

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.2rem 0.6rem',
                borderRadius: '1rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: bg,
                color: color,
                whiteSpace: 'nowrap'
            }}>
                {status}
            </span>
        );
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
            <main className="dashboard-main">
                <header className="mobile-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>영업 대시보드</h1>
                        <p style={{ color: 'var(--muted)' }}>오늘의 영업 현황과 실적을 확인하세요.</p>
                    </div>
                </header>

                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '3rem',
                    padding: 0
                }}>
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="card stat-card"
                            style={{
                                padding: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onClick={() => handleStatClick(s.id)}
                        >
                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>{s.label}</p>
                            <h3 style={{ fontSize: '1.35rem', color: s.color, fontWeight: 800, margin: '0.25rem 0' }}>{s.value}</h3>
                            <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: '#94a3b8', fontWeight: 500 }}>
                                {s.trend}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>최근 신청 내역</h2>
                        <div className="status-tabs">
                            {tabs.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    style={{
                                        padding: '0.5rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        borderRadius: '0.375rem',
                                        background: activeTab === t ? 'white' : 'transparent',
                                        color: activeTab === t ? 'var(--primary)' : '#64748b',
                                        boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <style jsx>{`
                        .section-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            gap: 1rem;
                        }
                        .status-tabs {
                            display: flex;
                            gap: 0.25rem;
                            background: #f1f5f9;
                            padding: 0.25rem;
                            borderRadius: 0.5rem;
                        }
                        .stat-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        }
                        .clickable-row {
                            cursor: pointer;
                            transition: background-color 0.2s;
                        }
                        .clickable-row:hover {
                            background-color: #f8fafc !important;
                        }

                        @media (max-width: 768px) {
                            .section-header {
                                flex-direction: column;
                                align-items: flex-start;
                            }
                            .status-tabs {
                                width: 100%;
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 0.25rem;
                            }
                        }
                    `}</style>

                    <div className="mobile-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <tr>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '120px' }}>신청일</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '100px' }}>고객명</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '130px' }}>연락처</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>주소</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '140px' }}>견적 금액</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '120px' }}>상태</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '150px' }}>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                            데이터를 불러오는 중입니다...
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length > 0 ? filteredCustomers.map((app, i) => (
                                    <tr
                                        key={i}
                                        className="clickable-row"
                                        onClick={() => setSelectedCustomer(app)}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            fontSize: '0.85rem',
                                            background: i % 2 === 1 ? '#fafafa' : 'white',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem 1rem', color: '#888' }}>{app.date}</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{app.name}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#555' }}>{app.phone}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#666', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.address}</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{app.amount}원</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#888', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {app.remarks || '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                            해당 상태의 신청 내역이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={() => {
                        setSelectedCustomer(null);
                        fetchCustomers();
                    }}
                />
            )}
        </div>
    );
}

function CustomerDetailModal({ customer, onClose, onUpdate }: { customer: Customer, onClose: () => void, onUpdate: (c: Customer) => void }) {
    const [status, setStatus] = useState<Status>(customer.status);
    const [remarks, setRemarks] = useState(customer.remarks);
    const [documents, setDocuments] = useState<Record<string, AuditDocument>>(customer.documents || {});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const firstRoundDocs = [
        '신분증사본', '통장사본(자동이체)', '부동산 등기부 등본(원본)',
        '부동산 매매 계약서 사본(등기 불가일 경우)', '가족관계 증명서(등기가 가족 명의일 경우)', '최종 견적서'
    ];
    const secondRoundDocs = ['시공 계약서'];

    const handleFileUpload = async (docName: string, file: File) => {
        setUploading(docName);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
            });
            reader.readAsDataURL(file);
            const base64 = await base64Promise;

            const sanitizedPhone = customer.phone.replace(/[^0-9]/g, '');
            const fileName = `${customer.date}_${customer.name}_${sanitizedPhone}_${docName}`;

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'upload',
                    base64: base64,
                    fileName: fileName,
                    mimeType: file.type
                })
            });

            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();

            const newDoc: AuditDocument = {
                name: fileName,
                uploadedAt: new Date().toISOString().split('T')[0],
                url: result.url
            };

            const updatedDocs = { ...documents, [docName]: newDoc };
            setDocuments(updatedDocs);

            if (status === '1차승인(추가 서류 등록 必)') {
                const required = ['신분증사본', '통장사본(자동이체)', '최종 견적서'];
                if (required.every(r => updatedDocs[r])) {
                    setStatus('1차서류 등록완료');
                }
            } else if (status === '최종승인(시공계약서 등록 必)') {
                if (updatedDocs['시공 계약서']) {
                    setStatus('최종서류 등록완료');
                }
            }
        } catch (err) {
            console.error(err);
            alert('파일 업로드에 실패했습니다.');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteDoc = (docName: string) => {
        const updatedDocs = { ...documents };
        delete updatedDocs[docName];
        setDocuments(updatedDocs);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    id: customer.id,
                    status: status,
                    remarks: remarks,
                    documents: JSON.stringify(documents)
                })
            });

            if (response.ok) {
                onUpdate({ ...customer, status, remarks, documents });
                alert('변경사항이 저장되었습니다.');
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            console.error(err);
            alert('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: 'white', width: '700px', maxWidth: '100%', borderRadius: '1.25rem', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>고객 상세 정보</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{customer.name} 고객님의 심사 서류 및 현황입니다.</p>
                    </div>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>고객 기본 정보</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>연락처</p>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer.phone}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>견적 금액</p>
                                <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{customer.amount}원</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>시공 주소</p>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer.address}</p>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>진행 상태</p>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Status)}
                                    disabled={customer.status !== '접수'}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        background: customer.status !== '접수' ? '#f1f5f9' : 'white',
                                        marginTop: '0.25rem',
                                        cursor: customer.status !== '접수' ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {customer.status === '접수' ? (
                                        <>
                                            <option value="접수">접수 (신용조회 전)</option>
                                            <option value="신용동의 완료">신용동의 완료</option>
                                        </>
                                    ) : (
                                        <option value={customer.status}>{customer.status}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📁 심사 서류 관리</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #3B82F6' }}>1차 심사 서류</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {firstRoundDocs.map(doc => (
                                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#334155' }}>{doc}</span>
                                        {documents[doc] ? (
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✅ 완료</span>
                                                {documents[doc].url && <a href={documents[doc].url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3B82F6', textDecoration: 'none' }}>보기</a>}
                                                <button onClick={() => handleDeleteDoc(doc)} style={{ fontSize: '0.7rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative' }}>
                                                <button style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: 'white' }}>{uploading === doc ? '...' : '첨부'}</button>
                                                <input type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(doc, e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #10B981' }}>2차 심사 서류</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {secondRoundDocs.map(doc => (
                                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#334155' }}>{doc}</span>
                                        {documents[doc] ? (
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✅ 완료</span>
                                                {documents[doc].url && <a href={documents[doc].url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3B82F6', textDecoration: 'none' }}>보기</a>}
                                                <button onClick={() => handleDeleteDoc(doc)} style={{ fontSize: '0.7rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative' }}>
                                                <button style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: 'white' }}>{uploading === doc ? '...' : '첨부'}</button>
                                                <input type="file" onChange={(e) => e.target.files?.[0] && handleFileUpload(doc, e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>비고</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '60px' }} />
                    </div>
                </div>

                <div style={{ padding: '1.25rem', borderTop: '1px solid #eee', background: '#f8fafc', display: 'flex', gap: '1rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700 }} onClick={onClose}>취소</button>
                    <button style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', fontWeight: 700 }} onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '변경사항 저장'}</button>
                </div>
            </div>
        </div>
    );
}
