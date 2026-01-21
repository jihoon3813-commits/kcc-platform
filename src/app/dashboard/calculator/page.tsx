'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function DashboardCalculator() {
    const [amount, setAmount] = useState(15000000);
    const [months, setMonths] = useState(60);

    const annualRate = 0.112; // 연이율 11.2%
    const monthlyRate = annualRate / 12;

    // 원리금 균등 상환 공식: A = P * { r(1+r)^n / ((1+r)^n - 1) }
    const rawMonthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const monthlyPayment = Math.floor(rawMonthlyPayment / 100) * 100; // 100원 단위 절삭

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(value))) {
            const numValue = Number(value);
            // 최대 10억까지만 제한 등 필요 시 추가 로직
            if (numValue <= 1000000000) setAmount(numValue);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-main">
                <header className="mobile-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>구독료 계산기</h1>
                        <p style={{ color: 'var(--muted)' }}>고객 상담 시 예상 월 납입금을 즉시 계산해보세요.</p>
                    </div>
                </header>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '2rem' }}>견적 금액 설정</h3>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>총 공사 금액 (원)</label>
                            <input
                                type="text"
                                value={amount.toLocaleString()}
                                onChange={handleAmountChange}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    fontSize: '1.25rem',
                                    fontWeight: 700
                                }}
                            />
                            <input
                                type="range"
                                min="1000000"
                                max="50000000"
                                step="100000"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{ width: '100%', marginTop: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>구독 기간 (개월)</label>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {[12, 24, 36, 48, 60].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMonths(m)}
                                        style={{
                                            flex: '1 0 auto',
                                            padding: '0.6rem 0.4rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--primary)',
                                            background: months === m ? 'var(--primary)' : 'white',
                                            color: months === m ? 'white' : 'var(--primary)',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {m}개월
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card" style={{ background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100%', padding: '2rem 1rem' }}>
                            <p style={{ opacity: 0.8, marginBottom: '0.5rem', fontSize: '0.875rem' }}>월 납입금</p>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', whiteSpace: 'nowrap' }}>
                                월 {monthlyPayment.toLocaleString()} <span style={{ fontSize: '1.25rem' }}>원</span>
                            </h2>
                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '1.25rem 0' }} />
                            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.5' }}>
                                일시불 <span style={{ textDecoration: 'line-through' }}>{amount.toLocaleString()}원</span>의 부담을 하루 커피 한잔 값으로 낮췄습니다.
                            </p>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'right' }}>
                            ※구독료는 일시불 금액 기준 연 11.2%(원리금균등상환) 이자를 포함한 금액입니다.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
