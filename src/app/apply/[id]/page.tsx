'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CustomerApply({ params }: { params: { id: string } }) {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const nextStep = () => setStep(step + 1);

    return (
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--primary)' }}>KCC HomeCC 구독 신청</h2>
                <div style={{ width: '100%', height: '4px', background: 'var(--muted-light)', marginTop: '0.5rem', borderRadius: '2px' }}>
                    <div style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem' }}>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>반갑습니다, 김철수 고객님!</h1>
                        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>대신인테리어에서 요청한 KCC 창호 구독 서비스를 시작합니다.</p>

                        <div className="card" style={{ background: 'var(--muted-light)', border: 'none', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span>총 공사 금액</span>
                                <span style={{ fontWeight: 700 }}>12,000,000원</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>구독 기간</span>
                                <span style={{ fontWeight: 700 }}>60개월</span>
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                                <span>월 납입금</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>200,000원</span>
                            </div>
                        </div>

                        {/* PDF Download Button - Direct Link (No Google Login) */}
                        <a
                            href="/quote_sample.pdf"
                            download="KCC_견적서_20240119.pdf"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                background: '#4B5563', // Dark grey style like user screenshot
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                textDecoration: 'none'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            상세 견적서 PDF 다운로드
                        </a>

                        <button onClick={nextStep} className="btn-primary" style={{ width: '100%', padding: '1.125rem', justifyContent: 'center', fontSize: '1.125rem' }}>
                            본인 인증 시작
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>본인 인증을 진행해 주세요</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>금융 심사를 위해 안전한 본인 인증이 필요합니다.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <button className="btn-primary" style={{ background: '#FEE500', color: '#111', justifyContent: 'center' }}>카카오톡 인증</button>
                            <button className="btn-primary" style={{ background: '#00D82C', color: 'white', justifyContent: 'center' }}>네이버 인증</button>
                            <button className="btn-primary" style={{ background: 'var(--primary)', color: 'white', justifyContent: 'center' }}>PASS 인증</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>전자 계약서 서명</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>구독 서비스 이용을 위한 계약 내용을 확인하세요.</p>

                        <div style={{ height: '300px', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', overflowY: 'auto', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2rem' }}>
                            <h3>제 1조 (목적)</h3>
                            <p>본 계약은 (주)티유디지털과 ... </p>
                            <p style={{ marginTop: '1rem' }}>중략...</p>
                            <p style={{ marginTop: '1rem' }}>본인은 위 내용을 모두 확인하였으며 이에 동의합니다.</p>
                        </div>

                        <button onClick={nextStep} className="btn-primary" style={{ width: '100%', padding: '1.125rem', justifyContent: 'center' }}>
                            동의 및 서명 완료
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', paddingTop: '3rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>신청이 완료되었습니다!</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>
                            금융사 심사 후 24시간 내에 <br />
                            최종 승인 결과가 문자로 전송됩니다.
                        </p>

                        <div className="card" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>다음 단계 안내</h4>
                            <ul style={{ paddingLeft: '1.25rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li>실시간 한도 조회 진행 중</li>
                                <li>승인 완료 시 시공 일정 해피콜 진행</li>
                                <li>카드/계좌 자동이체 등록 (문자 안내)</li>
                            </ul>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', padding: '1.125rem', justifyContent: 'center' }}>
                            메인으로 이동
                        </button>
                    </div>
                )}
            </main>

            <footer style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
                © TUDigital Subscription Service. <br />
                보안 서버에 의해 고객님의 정보가 보호되고 있습니다.
            </footer>
        </div>
    );
}
