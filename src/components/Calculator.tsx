'use client';

import { useState } from 'react';

interface CalculatorProps {
    onRegisterClick: () => void;
}

export default function Calculator({ onRegisterClick }: CalculatorProps) {
    const [amount, setAmount] = useState(15000000);
    const [months, setMonths] = useState(60);

    const annualRate = 0.10; // 연이율 10%
    const monthlyRate = annualRate / 12;

    // 원리금 균등 상환 공식: A = P * { r(1+r)^n / ((1+r)^n - 1) }
    const rawMonthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const monthlyPayment = Math.floor(rawMonthlyPayment / 100) * 100; // 100원 단위 절삭



    const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        const numVal = Number(val);
        if (numVal <= 30000000) {
            setAmount(numVal);
        } else {
            setAmount(30000000);
        }
    };

    return (
        <section id="calculator" className="calculator-section" style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '4rem 0'
        }}>
            <div className="container">
                <div className="calculator-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>SIMULATOR</div>
                    <h2 className="calculator-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 1.75rem)', fontWeight: 800, marginBottom: '0.75rem', color: '#111827', wordBreak: 'keep-all' }}>실시간 구독료 시뮬레이터</h2>
                    <p className="calculator-subtitle" style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'keep-all' }}>원하는 공사 금액과 기간을 설정하여 월 납입금을 확인해 보세요.</p>
                </div>

                <div className="calculator-grid" style={{
                    display: 'grid',
                    gap: '2rem',
                    alignItems: 'stretch'
                }}>
                    <div className="calculator-input-card" style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2.5rem', color: '#111827' }}>상세 조건 설정</h3>

                        <div style={{ marginBottom: '3rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <label style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>총 공사 금액</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={amount.toLocaleString()}
                                        onChange={handleAmountInputChange}
                                        style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 800,
                                            color: 'var(--primary)',
                                            border: 'none',
                                            borderBottom: '2px solid #e5e7eb',
                                            padding: '0.2rem 0',
                                            width: '200px',
                                            textAlign: 'right',
                                            outline: 'none',
                                            background: 'transparent'
                                        }}
                                    />
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9ca3af' }}>원</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="1000000"
                                max="30000000"
                                step="100000"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '6px',
                                    borderRadius: '3px',
                                    accentColor: 'var(--primary)',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                                <span>100만원</span>
                                <span>3,000만원</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <label style={{ display: 'block', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700, color: '#374151' }}>나누어 낼 기간 (구독 개월수)</label>
                            <div className="months-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                                {[12, 24, 36, 48, 60].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMonths(m)}
                                        style={{
                                            padding: '0.75rem 0.25rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid',
                                            borderColor: months === m ? 'var(--primary)' : '#f3f4f6',
                                            background: months === m ? 'rgba(0, 70, 173, 0.05)' : '#f3f4f6',
                                            color: months === m ? 'var(--primary)' : '#6b7280',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {m}개월
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', display: 'flex' }}>
                        <div className="calculator-result-card" style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '2.5rem 1.5rem',
                            borderRadius: '2rem',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 70, 173, 0.4)',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            {/* Decorative background circle */}
                            <div style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-20%',
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                                zIndex: 0
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <p style={{ fontSize: '0.95rem', opacity: 0.8, marginBottom: '0.75rem' }}>예상 월 구독료</p>
                                <h2 className="calculator-result-amount" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                                    {monthlyPayment.toLocaleString()} <span style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', opacity: 0.7 }}>원</span>
                                </h2>
                                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: '1.1rem' }}>☕</span> 월 커피 한잔 값으로 고객님 창호 교체
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: '1.1rem' }}>✅</span> KCC홈씨씨 공식 인증 구독 프로그램
                                    </div>
                                </div>
                                <button
                                    onClick={onRegisterClick}
                                    className="btn-primary"
                                    style={{
                                        background: '#fff',
                                        color: 'var(--primary)',
                                        width: '100%',
                                        padding: '1.5rem',
                                        borderRadius: '3rem',
                                        fontSize: '1.25rem',
                                        fontWeight: 800,
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }}
                                >
                                    공식 파트너 신청하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.8, wordBreak: 'keep-all' }}>
                        ※ 위 구독료는 예시이며, 실제 금융 심사 결과에 따라 이율 및 납입금이 변동될 수 있습니다. <br className="desktop-only" />
                        본 시뮬레이션은 원리금 균등 상환 방식을 기준으로 산출되었습니다.
                    </p>
                </div>
            </div>
        </section>
    );
}
