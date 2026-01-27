'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';

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
    birthDate: string;
    address: string;
    amount: string;
    months: string;
    transferDate: string;
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
    const [isGuest, setIsGuest] = useState(false);

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
            const myPartnerName = storedPartner?.name;
            const isGuest = myPartnerId === 'guest_demo';

            // Fetch from dedicated test sheet if guest, otherwise production sheet
            const response = await fetch(`/api/proxy?type=${isGuest ? 'guest_customers' : 'customers'}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                const filteredData = data.filter((item: any) => {
                    const itemPartnerId = item['파트너ID'] || item['파트너 ID'] || item['partnerId'];
                    const itemPartnerName = item['파트너명'] || item['partnerName'];

                    return (myPartnerId && itemPartnerId === myPartnerId) ||
                        (myPartnerName && itemPartnerName === myPartnerName);
                });

                const mappedData = filteredData.map((item: any) => {
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

                    const rawAmount = findVal(['최종견적가', '견적금액', 'amount']) || '0';
                    const sanitizedAmount = rawAmount.toString().replace(/,/g, '');
                    const amount = isNaN(Number(sanitizedAmount)) ? '0' : Number(sanitizedAmount).toLocaleString();

                    const docsJson = findVal(['documents', '서류', '서류관리', '서류JSON']);
                    const birthDateRaw = findVal(['생년월일', 'birthDate']) || '-';
                    const birthDate = (birthDateRaw.toString().includes('T'))
                        ? birthDateRaw.toString().split('T')[0]
                        : birthDateRaw;

                    return {
                        id: findVal(['고객번호', 'ID', 'id']) || Math.random(),
                        name: findVal(['신청자명', '이름', 'name']) || '이름 없음',
                        phone: findVal(['연락처', 'phone']) || '-',
                        birthDate: birthDate,
                        address: findVal(['주소', 'address']) || '-',
                        amount: amount,
                        months: findVal(['구독기간', '구독개월', 'months']) || '-',
                        transferDate: findVal(['이체희망일', '이체일', 'transferDate']) || '-',
                        date: findVal(['접수일', 'date']) ? findVal(['접수일', 'date']).toString().split('T')[0] : '-',
                        status: (findVal(['상태', 'status']) || '접수') as Status,
                        remarks: findVal(['비고', 'remarks']) || '',
                        documents: docsJson ? (typeof docsJson === 'string' ? JSON.parse(docsJson) : docsJson) : {}
                    };
                });

                const sortedData = mappedData.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    if (dateA !== dateB) return dateB - dateA;
                    // If dates are same, use ID as secondary sort (ID contains timestamp)
                    return b.id.toString().localeCompare(a.id.toString());
                });
                setAllCustomers(sortedData);
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
                <header className="dashboard-header">
                    <div className="header-content">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>영업 대시보드</h1>
                        <p style={{ color: 'var(--muted)' }}>오늘의 영업 현황과 실적을 확인하세요.</p>
                    </div>
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
                    <style jsx>{`
                        .dashboard-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 2rem;
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

                        @media (max-width: 640px) {
                            .dashboard-header {
                                flex-direction: column;
                                align-items: stretch;
                                gap: 1.5rem;
                            }
                            .refresh-button {
                                width: 100%;
                                justify-content: center;
                                padding: 0.8rem;
                            }
                        }
                    `}</style>
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
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <tr>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '120px' }}>신청일</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '100px' }}>고객명</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '130px' }}>연락처</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '110px' }}>생년월일</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>주소</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '140px' }}>견적 금액</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '100px' }}>구독 기간</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '110px' }}>이체일</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '120px' }}>상태</th>
                                    <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', width: '150px' }}>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
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
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{app.name}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#555' }}>{app.phone}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{app.birthDate}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.address}</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>{app.amount}원</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#555' }}>{app.months}{app.months !== '-' ? '개월' : ''}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#555' }}>{app.transferDate !== '-' ? `매월 ${app.transferDate}일` : '-'}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#888', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {app.remarks || '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
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
                    isGuest={isGuest}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={(updated) => {
                        setSelectedCustomer(null);
                        setAllCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
                        // fetchCustomers(); // No need to re-fetch if we update locally, but keep for robustness if needed
                    }}
                />
            )}
        </div>
    );
}

function CustomerDetailModal({ customer, isGuest, onClose, onUpdate }: { customer: Customer, isGuest: boolean, onClose: () => void, onUpdate: (c: Customer) => void }) {
    const [status, setStatus] = useState<Status>(customer.status);
    const [remarks, setRemarks] = useState(customer.remarks);
    const [documents, setDocuments] = useState<Record<string, AuditDocument>>(customer.documents || {});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Editing mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: customer.name,
        phone: customer.phone,
        amount: customer.amount,
        address: customer.address,
        months: customer.months,
        transferDate: customer.transferDate,
        birthDate: customer.birthDate
    });
    const [deleting, setDeleting] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    const firstRoundDocs = [
        '신분증사본', '통장사본(자동이체)', '부동산 등기부 등본(원본)',
        '부동산 매매 계약서 사본(등기 불가일 경우)', '가족관계 증명서(등기가 가족 명의일 경우)', '최종 견적서'
    ];
    const secondRoundDocs = ['시공 계약서'];

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxSide = 1920;

                    if (width > height) {
                        if (width > maxSide) {
                            height *= maxSide / width;
                            width = maxSide;
                        }
                    } else {
                        if (height > maxSide) {
                            width *= maxSide / height;
                            height = maxSide;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress as JPEG with 0.75 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    resolve(dataUrl.split(',')[1]);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (docName: string, file: File) => {
        setUploading(docName);
        try {
            let base64 = '';
            if (file.type.startsWith('image/')) {
                base64 = await compressImage(file);
            } else {
                const base64Promise = new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const b64 = (reader.result as string).split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(file);
                });
                base64 = await base64Promise;
            }

            const sanitizedPhone = (editData.phone || '').replace(/[^0-9]/g, '');
            const fileName = `${customer.date}_${editData.name}_${sanitizedPhone}_${docName}`;

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'upload',
                    base64: base64,
                    fileName: fileName,
                    mimeType: file.type
                })
            });

            if (!response.ok) throw new Error('Proxy server error');
            const result = await response.json();

            if (result.result === 'error') {
                throw new Error(result.message || 'GAS upload failed');
            }

            const newDoc: AuditDocument = {
                name: fileName,
                uploadedAt: new Date().toISOString().split('T')[0],
                url: result.url
            };

            const updatedDocs = { ...documents, [docName]: newDoc };
            setDocuments(updatedDocs);

            // Auto transition logic
            if (status === '1차승인(추가 서류 등록 必)' || status === '신용동의 완료') {
                const alwaysRequired = ['신분증사본', '통장사본(자동이체)', '최종 견적서'];
                const conditionalRequired = ['부동산 등기부 등본(원본)', '부동산 매매 계약서 사본(등기 불가일 경우)'];

                const hasAlwaysRequired = alwaysRequired.every(r => updatedDocs[r]);
                const hasConditionalRequired = conditionalRequired.some(r => updatedDocs[r]);

                if (hasAlwaysRequired && hasConditionalRequired) {
                    const nextStatus = '1차서류 등록완료';
                    setStatus(nextStatus);

                    await fetch('/api/proxy', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'update',
                            type: isGuest ? 'guest_customers' : 'customers',
                            id: customer.id,
                            status: nextStatus,
                            remarks: remarks,
                            documents: JSON.stringify(updatedDocs),
                            customerName: editData.name,
                            phone: editData.phone,
                            amount: editData.amount.replace(/,/g, ''),
                            address: editData.address,
                            months: editData.months,
                            transferDate: editData.transferDate,
                            birthDate: editData.birthDate
                        })
                    });
                    onUpdate({
                        ...customer,
                        status: nextStatus,
                        remarks,
                        documents: updatedDocs,
                        name: editData.name,
                        phone: editData.phone,
                        amount: editData.amount,
                        address: editData.address,
                        months: editData.months,
                        transferDate: editData.transferDate,
                        birthDate: editData.birthDate
                    });
                    alert('필수 서류가 모두 등록되어 "1차서류 등록완료"로 자동 변경되었습니다.');
                    onClose();
                    return;
                }
            } else if (status === '최종승인(시공계약서 등록 必)') {
                if (updatedDocs['시공 계약서']) {
                    const nextStatus = '최종서류 등록완료';
                    setStatus(nextStatus);

                    await fetch('/api/proxy', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'update',
                            type: isGuest ? 'guest_customers' : 'customers',
                            id: customer.id,
                            status: nextStatus,
                            remarks: remarks,
                            documents: JSON.stringify(updatedDocs),
                            customerName: editData.name,
                            phone: editData.phone,
                            amount: editData.amount.replace(/,/g, ''),
                            address: editData.address,
                            months: editData.months,
                            transferDate: editData.transferDate,
                            birthDate: editData.birthDate
                        })
                    });
                    onUpdate({
                        ...customer,
                        status: nextStatus,
                        remarks,
                        documents: updatedDocs,
                        name: editData.name,
                        phone: editData.phone,
                        amount: editData.amount,
                        address: editData.address,
                        months: editData.months,
                        transferDate: editData.transferDate,
                        birthDate: editData.birthDate
                    });
                    alert('시공 계약서가 등록되어 "최종서류 등록완료"로 자동 변경되었습니다.');
                    onClose();
                    return;
                }
            }
        } catch (err: any) {
            console.error(err);
            alert(`파일 업로드 실패: ${err.message}`);
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteDoc = (docName: string) => {
        const updatedDocs = { ...documents };
        delete updatedDocs[docName];
        setDocuments(updatedDocs);
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 고객 정보를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.')) return;

        setDeleting(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deleteCustomer',
                    type: isGuest ? 'guest_customers' : 'customers',
                    id: customer.id
                })
            });

            if (response.ok) {
                alert('고객 정보가 삭제되었습니다.');
                window.location.reload();
            } else {
                throw new Error('Delete failed');
            }
        } catch (err) {
            console.error(err);
            alert('삭제에 실패했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalStatus = status;
            const alwaysRequired = ['신분증사본', '통장사본(자동이체)', '최종 견적서'];
            const conditionalRequired = ['부동산 등기부 등본(원본)', '부동산 매매 계약서 사본(등기 불가일 경우)'];

            const isFirstRoundComplete = alwaysRequired.every(r => documents[r]) && conditionalRequired.some(r => documents[r]);

            if (finalStatus === '1차서류 등록완료') {
                if (!isFirstRoundComplete) {
                    finalStatus = '1차승인(추가 서류 등록 必)';
                }
            } else if (finalStatus === '1차승인(추가 서류 등록 必)' || finalStatus === '신용동의 완료') {
                if (isFirstRoundComplete) {
                    finalStatus = '1차서류 등록완료';
                }
            } else if (finalStatus === '최종서류 등록완료') {
                if (!documents['시공 계약서']) {
                    finalStatus = '최종승인(시공계약서 등록 必)';
                }
            } else if (finalStatus === '최종승인(시공계약서 등록 必)') {
                if (documents['시공 계약서']) {
                    finalStatus = '최종서류 등록완료';
                }
            }

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    type: isGuest ? 'guest_customers' : 'customers',
                    id: customer.id,
                    status: finalStatus,
                    remarks: remarks,
                    documents: JSON.stringify(documents),
                    customerName: editData.name,
                    phone: editData.phone,
                    amount: editData.amount.toString().replace(/,/g, ''),
                    address: editData.address,
                    months: editData.months,
                    transferDate: editData.transferDate,
                    birthDate: editData.birthDate
                })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.result === 'error') {
                    throw new Error(resData.message || 'Back-end save failed');
                }

                onUpdate({
                    ...customer,
                    status: finalStatus,
                    remarks,
                    documents,
                    name: editData.name,
                    phone: editData.phone,
                    amount: editData.amount,
                    address: editData.address,
                    months: editData.months,
                    transferDate: editData.transferDate,
                    birthDate: editData.birthDate
                });
                if (finalStatus !== status) {
                    const message = finalStatus.includes('서류 등록완료')
                        ? `필수 서류 등록이 확인되어 '${finalStatus}' 상태로 변경 저장되었습니다.`
                        : `필수 서류 누락이 확인되어 '${finalStatus}' 상태로 되돌아갑니다.`;
                    alert(message);
                } else {
                    alert('변경사항이 저장되었습니다.');
                }
                onClose();
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
                {/* Modal Header */}
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>고객 상세 정보</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{editData.name} 고객님의 심사 서류 및 현황입니다.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '0.4rem',
                                border: '1px solid #cbd5e1',
                                background: isEditing ? '#e2e8f0' : 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {isEditing ? '수정 취소' : '기본정보 수정'}
                        </button>
                        <button onClick={onClose} style={{ fontSize: '1.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                    </div>
                </div>

                {/* Modal Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {/* Basic Info Card */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>고객 기본 정보</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>고객명</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.name}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>연락처</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={13}
                                        value={editData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            let formatted = val;
                                            if (val.length > 3 && val.length <= 7) {
                                                formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                                            } else if (val.length > 7) {
                                                formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
                                            }
                                            setEditData({ ...editData, phone: formatted });
                                        }}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.phone}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>생년월일</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="YYYY-MM-DD"
                                        value={editData.birthDate}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            let formatted = val;
                                            if (val.length > 4 && val.length <= 6) {
                                                formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
                                            } else if (val.length > 6) {
                                                formatted = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
                                            }
                                            setEditData({ ...editData, birthDate: formatted });
                                        }}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.birthDate}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>견적 금액</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={editData.amount}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            const formatted = val ? Number(val).toLocaleString() : '';
                                            setEditData({ ...editData, amount: formatted });
                                        }}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{editData.amount}원</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>구독 기간</p>
                                {isEditing ? (
                                    <select
                                        value={editData.months}
                                        onChange={(e) => setEditData({ ...editData, months: e.target.value })}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    >
                                        <option value="60">60개월</option>
                                        <option value="48">48개월</option>
                                        <option value="36">36개월</option>
                                        <option value="24">24개월</option>
                                    </select>
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.months}{editData.months !== '-' ? '개월' : ''}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>이체 희망일</p>
                                {isEditing ? (
                                    <select
                                        value={editData.transferDate}
                                        onChange={(e) => setEditData({ ...editData, transferDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem' }}
                                    >
                                        <option value="5">매월 5일</option>
                                        <option value="10">매월 10일</option>
                                        <option value="15">매월 15일</option>
                                        <option value="20">매월 20일</option>
                                        <option value="25">매월 25일</option>
                                    </select>
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.transferDate !== '-' ? `매월 ${editData.transferDate}일` : '-'}</p>
                                )}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>시공 주소</p>
                                {isEditing ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={editData.address}
                                            readOnly
                                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.3rem', background: '#f8fafc' }}
                                        />
                                        <button
                                            onClick={() => setIsAddressOpen(true)}
                                            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'white', fontSize: '0.8rem', fontWeight: 700 }}
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                ) : (
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editData.address}</p>
                                )}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>진행 상태</p>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Status)}
                                    disabled={customer.status !== '접수' && !isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.875rem',
                                        background: (customer.status !== '접수' && !isEditing) ? '#f1f5f9' : 'white',
                                        marginTop: '0.25rem',
                                        cursor: (customer.status !== '접수' && !isEditing) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {customer.status === '접수' || isEditing ? (
                                        <>
                                            <option value="접수">접수 (신용조회 전)</option>
                                            <option value="신용동의 완료">신용동의 완료</option>
                                        </>
                                    ) : (
                                        <option value={customer.status}>{customer.status}</option>
                                    )}
                                </select>
                                {customer.status !== '접수' && !isEditing && (
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                                        * 이 단계의 상태는 서류 등록 시 자동 변경되거나 관리자에 의해 관리됩니다.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📁 심사 서류 관리
                        </h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #3B82F6' }}>1차 심사 서류 (신용 통과 후)</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {firstRoundDocs.map((doc, idx) => {
                                    // 0: 신분증, 1: 통장사본, 5: 최종견적서 (필수)
                                    // 2: 부동산등기, 3: 매매계약서 (택1 필수)
                                    const isStrictRequired = [0, 1, 5].includes(idx);
                                    const isCoRequired = [2, 3].includes(idx);

                                    return (
                                        <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                                                {doc} {isStrictRequired ? (
                                                    <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: 600 }}>(필수)</span>
                                                ) : isCoRequired ? (
                                                    <span style={{ color: '#F59E0B', fontSize: '0.7rem', fontWeight: 600 }}>(택1 필수)</span>
                                                ) : (
                                                    <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>(선택)</span>
                                                )}
                                            </span>
                                            {documents[doc] ? (
                                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✅ 완료</span>
                                                    {documents[doc].url && (
                                                        <a href={documents[doc].url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>보기</a>
                                                    )}
                                                    <button onClick={() => handleDeleteDoc(doc)} style={{ fontSize: '0.7rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>삭제</button>
                                                </div>
                                            ) : (
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: 'white' }}
                                                        disabled={!!uploading}
                                                    >
                                                        {uploading === doc ? '업로드 중...' : '첨부'}
                                                    </button>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(doc, file);
                                                        }}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #10B981' }}>2차 심사 서류 (최종 승인 후)</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {secondRoundDocs.map(doc => (
                                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#334155' }}>{doc}</span>
                                        {documents[doc] ? (
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>✅ 완료</span>
                                                {documents[doc].url && (
                                                    <a href={documents[doc].url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>보기</a>
                                                )}
                                                <button onClick={() => handleDeleteDoc(doc)} style={{ fontSize: '0.7rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>삭제</button>
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: 'white' }}
                                                    disabled={!!uploading}
                                                >
                                                    {uploading === doc ? '업로드 중...' : '첨부'}
                                                </button>
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(doc, file);
                                                    }}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>비고 (관리자 메모)</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', minHeight: '60px' }}
                            placeholder="메모를 입력하세요."
                        />
                    </div>
                </div>

                <div style={{ padding: '1.25rem', borderTop: '1px solid #eee', background: '#f8fafc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #EF4444', background: 'white', fontWeight: 700, color: '#EF4444', fontSize: '0.875rem' }}
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? '삭제 중...' : '신청 정보 삭제'}
                    </button>

                    <div style={{ flex: 1 }}></div>

                    <button
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#475569' }}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                    <button
                        style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', background: 'var(--primary)', fontWeight: 700, color: 'white', opacity: saving ? 0.7 : 1 }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>

            {isAddressOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '500px', background: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 800 }}>주소 검색</h3>
                            <button onClick={() => setIsAddressOpen(false)}>&times;</button>
                        </div>
                        <DaumPostcodeEmbed
                            onComplete={(data: any) => {
                                setEditData({ ...editData, address: data.address });
                                setIsAddressOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
