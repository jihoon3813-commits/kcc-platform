'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

type Status = '접수' | '신용조회 발송' | '조회 진행 중' | '1차 승인' | '1차 불가' | '서류 심사 중' | '최종 승인' | '최종 불가' | '전자서명/녹취' | '정산 대기' | '정산 완료';

interface GASResponseItem {
    ID: string | number;
    '고객명': string;
    '연락처': string;
    '주소': string;
    '견적금액': string | number;
    '신청일': string;
    '상태'?: Status;
    '비고'?: string;
}

export default function Settlement() {
    const [allCustomers, setAllCustomers] = useState<GASResponseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettlementData = async () => {
            try {
                const response = await fetch('/api/proxy?type=customers');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAllCustomers(data);
                } else {
                    console.error('Settlement data is not an array:', data);
                    setAllCustomers([]);
                }
            } catch (error) {
                console.error('Failed to fetch settlement data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettlementData();
    }, []);

    const inProgress = allCustomers
        .filter(c => c['상태'] === '정산 대기' || (c['상태'] === '전자서명/녹취'))
        .map(c => ({
            id: c.ID,
            name: c['고객명'],
            phone: c['연락처'],
            amount: Number(c['견적금액']).toLocaleString(),
            date: c['신청일'],
            settleDate: '지급 대기 중'
        }));

    const completed = allCustomers
        .filter(c => c['상태'] === '정산 완료')
        .map(c => ({
            id: c.ID,
            name: c['고객명'],
            phone: c['연락처'],
            amount: Number(c['견적금액']).toLocaleString(),
            settleDate: c['신청일'], // 실제 지급일 데이터가 시트에 없으므로 우선 신청일로 표시하거나 필드 정의 필요
            status: '정산완료'
        }));

    // Calculate totals
    const totalExpected = inProgress.reduce((acc, cur) => acc + parseInt(cur.amount.replace(/,/g, '')), 0);
    const totalCompleted = completed.reduce((acc, cur) => acc + parseInt(cur.amount.replace(/,/g, '')), 0);

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-main">
                <header className="mobile-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>정산 내역</h1>
                        <p style={{ color: 'var(--muted)' }}>구독 계약 체결에 따른 정산 예정 및 지급 완료 내역입니다.</p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                    <div className="card" style={{ background: 'white', borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ color: '#666', marginBottom: '0.5rem' }}>정산 예정 금액</p>
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{totalExpected.toLocaleString()}원</h2>
                        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>총 {inProgress.length}건 진행 중</p>
                    </div>
                    <div className="card" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
                        <p style={{ color: '#166534', marginBottom: '0.5rem' }}>지급 완료 금액</p>
                        <h2 style={{ fontSize: '2rem', color: '#15803d' }}>{totalCompleted.toLocaleString()}원</h2>
                        <p style={{ fontSize: '0.9rem', color: '#166534', marginTop: '0.5rem' }}>총 {completed.length}건 지급 완료</p>
                    </div>
                </div>

                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                        정산 진행 중 목록
                    </h3>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #bfdbfe' }}>
                        <div className="mobile-scroll">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: '0.8rem' }}>
                                    <tr style={{ whiteSpace: 'nowrap' }}>
                                        <th style={{ padding: '0.75rem 1rem', color: '#1e3a8a' }}>고객명</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#1e3a8a' }}>연락처</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#1e3a8a' }}>계약 금액</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#1e3a8a' }}>정산 예정일</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#1e3a8a' }}>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                                정산 내역을 불러오는 중입니다...
                                            </td>
                                        </tr>
                                    ) : inProgress.length > 0 ? inProgress.map((c) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.name}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{c.phone}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{c.amount}원</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>{c.settleDate}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    정산 진행 중
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                                진행 중인 정산 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                        <span style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%' }}></span>
                        지급 완료 내역 (History)
                    </h3>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: 0.9 }}>
                        <div className="mobile-scroll">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                                    <tr style={{ whiteSpace: 'nowrap' }}>
                                        <th style={{ padding: '0.75rem 1rem', color: '#666' }}>고객명</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#666' }}>연락처</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#666' }}>계약 금액</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#666' }}>지급일</th>
                                        <th style={{ padding: '0.75rem 1rem', color: '#666' }}>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                                정산 내역을 불러오는 중입니다...
                                            </td>
                                        </tr>
                                    ) : completed.length > 0 ? completed.map((c) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.name}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{c.phone}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{c.amount}원</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{c.settleDate}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    정산 완료
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                                                지급 완료된 정산 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
