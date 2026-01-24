'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
    id: string;
    date: string;
    name: string;
    phone: string;
    birthDate: string;
    address: string;
    amount: string;
    months: string;
    transferDate: string;
    status: Status;
    partnerName: string;
    remarks?: string;
    documents?: Record<string, AuditDocument>;
}

const statusOptions: Status[] = [
    '접수',
    '신용동의 완료',
    '1차승인(추가 서류 등록 必)',
    '1차서류 등록완료',
    '최종승인(시공계약서 등록 必)',
    '최종서류 등록완료',
    '전자서명/녹취 진행중',
    '녹취완료/정산대기',
    '정산완료',
    '1차 불가',
    '최종 불가'
];

const getStatusBadgeStyles = (status: Status) => {
    switch (status) {
        case '정산완료':
            return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
        case '접수':
            return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
        case '신용동의 완료':
        case '전자서명/녹취 진행중':
            return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' };
        case '1차 불가':
        case '최종 불가':
            return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
        case '1차승인(추가 서류 등록 必)':
        case '최종승인(시공계약서 등록 必)':
            return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' };
        case '녹취완료/정산대기':
            return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
        default:
            return { bg: 'rgba(51, 65, 85, 0.4)', color: '#cbd5e1' };
    }
};

const CustomerDetailModal = ({ customer, onClose, onUpdate }: { customer: Customer; onClose: () => void; onUpdate: () => void }) => {
    const [status, setStatus] = useState<Status>(customer.status);
    const [remarks, setRemarks] = useState(customer.remarks || '');
    const [saving, setSaving] = useState(false);

    const firstRoundDocs = [
        '신분증사본', '통장사본(자동이체)', '부동산 등기부 등본(원본)',
        '부동산 매매 계약서 사본(등기 불가일 경우)', '가족관계 증명서(등기가 가족 명의일 경우)', '최종 견적서'
    ];
    const secondRoundDocs = ['시공 계약서'];

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalStatus = status;
            const alwaysRequired = ['신분증사본', '통장사본(자동이체)', '최종 견적서'];
            const conditionalRequired = ['부동산 등기부 등본(원본)', '부동산 매매 계약서 사본(등기 불가일 경우)'];

            const isFirstRoundComplete = alwaysRequired.every(r => customer.documents?.[r]) && conditionalRequired.some(r => customer.documents?.[r]);

            if (finalStatus === '1차서류 등록완료') {
                if (!isFirstRoundComplete) {
                    finalStatus = '1차승인(추가 서류 등록 必)';
                }
            } else if (finalStatus === '1차승인(추가 서류 등록 必)' || finalStatus === '신용동의 완료') {
                if (isFirstRoundComplete) {
                    finalStatus = '1차서류 등록완료';
                }
            } else if (finalStatus === '최종서류 등록완료') {
                if (!customer.documents?.['시공 계약서']) {
                    finalStatus = '최종승인(시공계약서 등록 必)';
                }
            } else if (finalStatus === '최종승인(시공계약서 등록 必)') {
                if (customer.documents?.['시공 계약서']) {
                    finalStatus = '최종서류 등록완료';
                }
            }

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    type: 'customers',
                    id: customer.id,
                    status: finalStatus,
                    remarks: remarks,
                    documents: JSON.stringify(customer.documents || {})
                })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.result === 'error') {
                    throw new Error(resData.message || 'Back-end save failed');
                }
                alert('변경사항이 저장되었습니다.');
                onUpdate();
                onClose();
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            alert('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: '#0f172a', width: '800px', maxWidth: '100%', borderRadius: '1.5rem', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>고객 심사 상세</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{customer.name} 고객 / {customer.partnerName}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ padding: '2rem', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>진행 상태 변경</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Status)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>연락처</label>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}>{customer.phone}</div>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>생년월일</label>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}>{customer.birthDate}</div>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>견적 금액</label>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', fontWeight: 700 }}>
                                {Number(customer.amount.toString().replace(/,/g, '')).toLocaleString()}원
                            </div>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>구독 기간 / 이체일</label>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}>{customer.months}개월 / 매월 {customer.transferDate}일</div>
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>시공 주소</label>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }}>{customer.address}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#38bdf8' }}>📁</span> 등록 서류 확인
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>1차 심사 서류</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {firstRoundDocs.map((doc, idx) => {
                                        const file = customer.documents?.[doc];
                                        const isStrictRequired = [0, 1, 5].includes(idx);
                                        const isCoRequired = [2, 3].includes(idx);

                                        return (
                                            <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: file ? 'rgba(16, 185, 129, 0.05)' : '#1e293b', borderRadius: '0.5rem', border: '1px solid', borderColor: file ? 'rgba(16, 185, 129, 0.2)' : '#334155' }}>
                                                <span style={{ fontSize: '0.75rem', color: file ? '#10b981' : '#94a3b8', flex: 1, marginRight: '0.5rem' }}>
                                                    {doc} {isStrictRequired ? (
                                                        <span style={{ color: '#ef4444', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>(필수)</span>
                                                    ) : isCoRequired ? (
                                                        <span style={{ color: '#fbbf24', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>(택1 필수)</span>
                                                    ) : (
                                                        <span style={{ color: '#64748b', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>(선택)</span>
                                                    )}
                                                </span>
                                                {file?.url ? (
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>파일보기</a>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#475569', whiteSpace: 'nowrap' }}>미등록</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>2차 심사 서류</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {secondRoundDocs.map(doc => {
                                        const file = customer.documents?.[doc];
                                        return (
                                            <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: file ? 'rgba(16, 185, 129, 0.05)' : '#1e293b', borderRadius: '0.5rem', border: '1px solid', borderColor: file ? 'rgba(16, 185, 129, 0.2)' : '#334155' }}>
                                                <span style={{ fontSize: '0.75rem', color: file ? '#10b981' : '#94a3b8' }}>{doc}</span>
                                                {file?.url ? (
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>파일보기</a>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>미등록</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>비고 (심사 메모)</label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="파트너사와 공유할 메모를 입력하세요."
                            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.875rem', minHeight: '100px', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ padding: '1.5rem 2rem', background: '#020617', borderTop: '1px solid #1e293b', display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', background: '#1e293b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.875rem', borderRadius: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? '저장 중...' : '마스터 승인 상태 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminCustomerList() {
    return (
        <Suspense fallback={<div style={{ background: '#020617', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>로딩 중...</div>}>
            <AdminCustomerListContent />
        </Suspense>
    );
}

function AdminCustomerListContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('전체');
    const [filterPartner, setFilterPartner] = useState('전체');
    const [partners, setPartners] = useState<string[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter');

    // Filter states
    const [datePreset, setDatePreset] = useState('전체');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchAllCustomers = async () => {
        setLoading(true);
        try {
            const [cRes, pRes] = await Promise.all([
                fetch('/api/proxy?type=customers'),
                fetch('/api/proxy?type=partners')
            ]);
            const data = await cRes.json();
            const pData = await pRes.json();

            if (Array.isArray(pData)) {
                const uniquePartners = Array.from(new Set(pData.map((p: any) => p['파트너명'] || p['name'] || '').filter(Boolean))) as string[];
                setPartners(uniquePartners.sort());
            }

            if (Array.isArray(data)) {
                // ... (rest of the mapping logic remains same)
                const mappedData = data.map((item: any) => {
                    const docsJson = item['documents'] || item['서류'] || item['서류관리'] || item['서류 JSON'] || item['서류JSON'];
                    const birthDateRaw = item['생년월일'] || '-';
                    const birthDate = (birthDateRaw.toString().includes('T'))
                        ? birthDateRaw.toString().split('T')[0]
                        : birthDateRaw;

                    return {
                        id: item['고객번호'] || item['고객 번호'] || item.ID || item.id || '-',
                        date: item['접수일'] ? item['접수일'].toString().split('T')[0] : '-',
                        name: item['신청자명'] || '이름 없음',
                        phone: item['연락처'] || '-',
                        birthDate: birthDate,
                        address: item['주소'] || '-',
                        amount: item['최종 견적가'] || item['견적금액'] || '0',
                        months: item['구독기간'] || item['구독 기간'] || '-',
                        transferDate: item['이체희망일'] || item['이체 희망일'] || '-',
                        status: (item['상태'] || '접수') as Status,
                        partnerName: item['파트너명'] || '미지정',
                        remarks: item['비고'] || '',
                        documents: docsJson ? (typeof docsJson === 'string' ? JSON.parse(docsJson) : docsJson) : {}
                    };
                });
                const sorted = mappedData.sort((a: any, b: any) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    if (dateA !== dateB) return dateB - dateA;
                    return b.id.toString().localeCompare(a.id.toString());
                });
                setCustomers(sorted);
                setFilteredCustomers(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch master customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCustomers();
        const filter = searchParams.get('filter');
        const partnerName = searchParams.get('partnerName');

        if (filter === 'pending_docs') {
            setFilterStatus('서류검수필요');
        }
        if (partnerName) {
            setFilterPartner(partnerName);
        }
    }, [searchParams]);

    useEffect(() => {
        const filtered = customers.filter(c => {
            // 1. Search Filter
            const matchesSearch = c.name.includes(searchTerm) || c.partnerName.includes(searchTerm) || c.phone.includes(searchTerm);

            // 2. Status & Partner Filter
            const isPendingDocs = c.status === '1차서류 등록완료' || c.status === '최종서류 등록완료';
            const matchesStatus = filterStatus === '전체' ||
                (filterStatus === '서류검수필요' ? isPendingDocs : c.status === filterStatus);

            const matchesPartner = filterPartner === '전체' || c.partnerName === filterPartner;

            // 3. Date Filter
            let matchesDate = true;
            const customerDate = new Date(c.date);
            const now = new Date();

            if (datePreset !== '전체') {
                let limitDate = new Date();
                if (datePreset === '당월') {
                    limitDate = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (datePreset === '3개월') {
                    limitDate.setMonth(now.getMonth() - 3);
                } else if (datePreset === '6개월') {
                    limitDate.setMonth(now.getMonth() - 6);
                } else if (datePreset === '1년') {
                    limitDate.setFullYear(now.getFullYear() - 1);
                }

                if (datePreset === '기간선택') {
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        matchesDate = customerDate >= start && customerDate <= end;
                    }
                } else {
                    matchesDate = customerDate >= limitDate;
                }
            }

            return matchesSearch && matchesStatus && matchesPartner && matchesDate;
        });
        setFilteredCustomers(filtered);
    }, [searchTerm, filterStatus, filterPartner, datePreset, startDate, endDate, customers]);

    return (
        <div className="admin-page-wrapper" style={{ display: 'flex', backgroundColor: '#020617', minHeight: '100vh' }}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #1e293b',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.125rem', color: '#f8fafc', fontWeight: 700, letterSpacing: '-0.025em' }}>
                        고객 데이터를 불러오는 중입니다...
                    </p>
                </div>
            )}
            <AdminSidebar />
            <main className="admin-main-container">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>전체 고객 관리</h1>
                        <p style={{ color: '#64748b' }}>모든 파트너사의 신청 내역을 통합 모니터링합니다. 행을 클릭하여 상세 정보를 확인하세요.</p>
                    </div>
                    <button
                        onClick={() => fetchAllCustomers()}
                        disabled={loading}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '0.75rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            gap: '0.5rem'
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

                <section style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #1e293b', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="고객명, 파트너명 등으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1, minWidth: '300px', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none'
                            }}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#1e293b',
                                border: '1px solid #334155', color: '#fff', outline: 'none', flex: '1', maxWidth: '200px'
                            }}
                        >
                            <option value="전체">모든 상태</option>
                            <option value="서류검수필요">📂 검수 필요</option>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select
                            value={filterPartner}
                            onChange={(e) => setFilterPartner(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#1e293b',
                                border: '1px solid #334155', color: '#fff', outline: 'none', flex: '1', maxWidth: '200px'
                            }}
                        >
                            <option value="전체">모든 파트너사</option>
                            {partners.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', background: '#020617', padding: '0.3rem', borderRadius: '0.75rem', border: '1px solid #1e293b' }}>
                            {['전체', '당월', '3개월', '6개월', '1년', '기간선택'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        borderRadius: '0.5rem',
                                        background: datePreset === p ? '#3b82f6' : 'transparent',
                                        color: datePreset === p ? '#fff' : '#64748b',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
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
                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                                />
                                <span style={{ color: '#475569' }}>~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            총 <strong style={{ color: '#38bdf8' }}>{filteredCustomers.length}</strong>건 조회됨
                        </div>
                    </div>
                </section>

                <section style={{ background: '#0f172a', borderRadius: '1.25rem', border: '1px solid #1e293b', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead style={{ background: '#1e293b', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>신청일</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>파트너사</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>고객명</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>연락처</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>생년월일</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>주소</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>견적가</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>구독기간</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>이체일</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>상태</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr><td colSpan={10} style={{ padding: '4rem', textAlign: 'center' }}>데이터를 불러오는 중...</td></tr>
                                ) : filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => {
                                    const styles = getStatusBadgeStyles(c.status);
                                    return (
                                        <tr
                                            key={i}
                                            onClick={() => setSelectedCustomer(c)}
                                            style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer', transition: 'background 0.2s' }}
                                            className="admin-table-row"
                                        >
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{c.date}</td>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#38bdf8', whiteSpace: 'nowrap' }}>{c.partnerName}</td>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{c.name}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{c.phone}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{c.birthDate}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.address}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{Number(c.amount.toString().replace(/,/g, '')).toLocaleString()}원</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{c.months}개월</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>매월 {c.transferDate}일</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.75rem',
                                                    borderRadius: '2rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: styles.bg,
                                                    color: styles.color,
                                                    border: `1px solid ${styles.color}20`
                                                }}>
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>검색 결과가 없습니다.</td></tr>
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
                    onUpdate={fetchAllCustomers}
                />
            )}

            <style jsx>{`
                .admin-main-container {
                    flex: 1;
                    margin-left: 260px;
                    padding: 2.5rem;
                    transition: all 0.3s;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .admin-table-row:hover {
                    background: rgba(56, 189, 248, 0.03);
                }

                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0;
                        padding: 1.5rem;
                    }
                }

                @media (max-width: 768px) {
                    .admin-main-container {
                        padding: 1rem;
                    }
                    header h1 {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
