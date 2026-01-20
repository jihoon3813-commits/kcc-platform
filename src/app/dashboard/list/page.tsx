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
    type?: string;
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

    useEffect(() => {
        const stored = localStorage.getItem('kcc_partner');
        if (stored) {
            setPartnerName(JSON.parse(stored).name);
        }
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/proxy?type=customers');
            const data = await response.json();

            if (Array.isArray(data)) {
                const storedPartner = localStorage.getItem('kcc_partner') ? JSON.parse(localStorage.getItem('kcc_partner')!) : null;
                const myPartnerId = storedPartner?.id;
                const myPartnerName = storedPartner?.name;

                const filteredByPartner = data.filter((item: any) => {
                    // Strict filtering: only show if Partner ID or Partner Name matches
                    const itemPartnerId = item['파트너ID'] || item['파트너 ID'] || item['partnerId'];
                    const itemPartnerName = item['파트너명'] || item['partnerName'];

                    return (myPartnerId && itemPartnerId === myPartnerId) ||
                        (myPartnerName && itemPartnerName === myPartnerName);
                });

                const mappedData = filteredByPartner.map((item: any) => {
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

                setCustomers(mappedData.reverse() as Customer[]);
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
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
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
                <header className="mobile-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>고객 관리</h1>
                        <p style={{ color: 'var(--muted)' }}>등록된 모든 고객 신청 내역을 조회하고 관리합니다.</p>
                    </div>
                </header>

                <section className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Search & Status Filter */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['전체', '접수', '신용동의 완료', '1차승인(추가 서류 등록 必)', '최종승인(시공계약서 등록 必)', '정산완료'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: '1px solid',
                                        borderColor: filterStatus === s ? 'var(--primary)' : '#e2e8f0',
                                        background: filterStatus === s ? 'var(--primary)' : 'white',
                                        color: filterStatus === s ? 'white' : '#64748b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="전체">모든 상태</option>
                                <option value="1차서류 등록완료">1차서류 등록완료</option>
                                <option value="최종서류 등록완료">최종서류 등록완료</option>
                                <option value="전자서명/녹취 진행중">전자서명/녹취 진행중</option>
                                <option value="녹취완료/정산대기">녹취완료/정산대기</option>
                                <option value="1차 불가">1차 불가</option>
                                <option value="최종 불가">최종 불가</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.5rem' }}>
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

                <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="mobile-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>신청일</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>고객명</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>연락처</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>주소</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>견적 금액</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>상태</th>
                                    <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중입니다...</td>
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
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{app.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700 }}>{app.name}</td>
                                            <td style={{ padding: '1rem', color: '#475569' }}>{app.phone}</td>
                                            <td style={{
                                                padding: '1rem',
                                                color: '#64748b',
                                                maxWidth: '300px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{app.address}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{app.amount}원</td>
                                            <td style={{ padding: '1rem' }}>{getStatusBadge(app.status)}</td>
                                            <td style={{ padding: '1rem', color: '#94a3b8' }}>{app.remarks || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>검색 결과가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#EBF5FF', borderRadius: '0.75rem', color: '#1e40af', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <p style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.9rem' }}>💡 진행 단계 안내</p>
                    <ul style={{ marginLeft: '1.25rem', listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li><strong>접수/신용조회</strong>: 고객 정보를 입력하고 신용조회 링크를 발송한 단계입니다.</li>
                        <li><strong>신용동의 완료</strong>: 고객이 신용조회 동의를 마친 상태입니다.</li>
                        <li><strong>1차 승인</strong>: 신용 조회가 통과된 상태. <span style={{ textDecoration: 'underline' }}>필수 서류를 등록</span>해주세요.</li>
                        <li><strong>최종 승인</strong>: 금융사 심사 완료 후 <span style={{ textDecoration: 'underline' }}>시공 계약서를 등록</span>해주세요.</li>
                        <li><strong>정산 완료</strong>: 모든 절차 완료 후 정산금이 지급된 상태입니다.</li>
                    </ul>
                </div>
            </main>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdate={(updated) => {
                        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
                        setSelectedCustomer(updated);
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

            // Naming convention: 신청일_신청자_연락처_서류명
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

            // Auto transition logic
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
                {/* Modal Header */}
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>고객 상세 정보</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{customer.name} 고객님의 심사 서류 및 현황입니다.</p>
                    </div>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', color: '#94a3b8' }}>&times;</button>
                </div>

                {/* Modal Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {/* Basic Info Card */}
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
                                {customer.status !== '접수' && (
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
                                {firstRoundDocs.map(doc => (
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

                <div style={{ padding: '1.25rem', borderTop: '1px solid #eee', background: '#f8fafc', display: 'flex', gap: '1rem' }}>
                    <button
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#475569' }}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                    <button
                        style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', fontWeight: 700, color: 'white', opacity: saving ? 0.7 : 1 }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}
