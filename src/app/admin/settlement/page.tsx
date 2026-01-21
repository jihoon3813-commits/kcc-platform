'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';

interface SettlementItem {
    id: string;
    date: string;
    partnerName: string;
    customerName: string;
    amount: string;
    status: string;
}

export default function AdminSettlement() {
    const [items, setItems] = useState<SettlementItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/proxy?type=customers');
            const data = await response.json();

            if (Array.isArray(data)) {
                const filtered = data
                    .filter((item: any) => item['상태'] === '녹취완료/정산대기' || item['상태'] === '정산완료')
                    .map((item: any) => ({
                        id: item['고객번호'] || '-',
                        date: item['접수일'] ? item['접수일'].toString().split('T')[0] : '-',
                        partnerName: item['파트너명'] || '-',
                        customerName: item['신청자명'] || '-',
                        amount: item['최종 견적가'] || item['견적금액'] || '0',
                        status: item['상태'] || '-'
                    }));
                setItems(filtered.reverse());
            }
        } catch (error) {
            console.error('Failed to fetch settlements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlements();
    }, []);

    const handleSettle = async (id: string) => {
        if (!confirm('해당 건의 정산을 완료 처리하시겠습니까?')) return;

        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'update', id: id, status: '정산완료' })
            });
            if (res.ok) {
                alert('정산 완료 처리되었습니다.');
                fetchSettlements();
            }
        } catch (err) {
            alert('처리 실패');
        }
    };

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
                        정산 데이터를 불러오는 중입니다...
                    </p>
                </div>
            )}
            <AdminSidebar />
            <main className="admin-main-container">
                <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>정산 관리</h1>
                        <p style={{ color: '#64748b' }}>파트너사별 정산 요청 내역을 검토하고 지급 완료 처리합니다.</p>
                    </div>
                    <button
                        onClick={() => fetchSettlements()}
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

                <section className="settlement-stats-grid" style={{ marginBottom: '2rem' }}>
                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>정산 대기 건수</p>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{items.filter(i => i.status === '녹취완료/정산대기').length}건</h2>
                    </div>
                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>금월 정산 지급액</p>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {items.filter(i => i.status === '정산완료')
                                .reduce((acc, curr) => acc + Number(curr.amount.toString().replace(/,/g, '')), 0)
                                .toLocaleString()}원
                        </h2>
                    </div>
                </section>

                <section style={{ background: '#0f172a', borderRadius: '1.25rem', border: '1px solid #1e293b', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead style={{ background: '#1e293b', fontSize: '0.75rem', color: '#94a3b8' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>요청일</th>
                                    <th style={{ padding: '1rem' }}>파트너사</th>
                                    <th style={{ padding: '1rem' }}>고객명</th>
                                    <th style={{ padding: '1rem' }}>총 견적액</th>
                                    <th style={{ padding: '1rem' }}>상태</th>
                                    <th style={{ padding: '1rem' }}>액션</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>로딩 중...</td></tr>
                                ) : items.length > 0 ? items.map((i, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '1rem' }}>{i.date}</td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#38bdf8' }}>{i.partnerName}</td>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: '#fff' }}>{i.customerName}</td>
                                        <td style={{ padding: '1rem' }}>{Number(i.amount.toString().replace(/,/g, '')).toLocaleString()}원</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700,
                                                background: i.status === '정산완료' ? '#064e3b' : '#451a03',
                                                color: i.status === '정산완료' ? '#10b981' : '#fbbf24'
                                            }}>
                                                {i.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {i.status === '녹취완료/정산대기' ? (
                                                <button
                                                    onClick={() => handleSettle(i.id)}
                                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                                >
                                                    지급 완료 처리
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>처리완료</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>정산 대상 내역이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

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

                .settlement-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0;
                        padding: 1.5rem;
                        padding-bottom: 100px;
                    }
                    .settlement-stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
