export default function Features() {
    const points = [
        {
            title: "목돈 부담 제로",
            desc: "수천만원의 창호 교체비용, 이제 목돈 대신 최장 60개월 구독으로 해결하세요.",
            icon: "💳"
        },
        {
            title: "매출 증대 솔루션",
            desc: "초기 비용 때문에 망설이던 고객 10명 중 7명이 구독 제안을 통해 실제 공사로 전환되었습니다.",
            icon: "📈"
        },
        {
            title: "신용 기반 특별 승인",
            desc: "신용카드 할부처럼 한도를 잡아먹지 않습니다. KCC홈씨씨와 특별 제휴 맺은 금융상품입니다.",
            icon: "✨"
        },
        {
            title: "시공 다음날 초고속 정산",
            desc: "일반 렌탈은 설치 익월 말 정산, BUT! 저희는 시공 다음날 바로 정산해 드립니다!",
            icon: "⚡"
        },
        {
            title: "복잡한 계산 NO!",
            desc: "견적 계산기에 입력한 공사금액 = 정산받으실 금액! 예상 구독료는 고객이 부담하는 금액!",
            icon: "🧮"
        },
        {
            title: "부담 없는 수수료",
            desc: "공사비 기준 3~5% 수수료만! 결제 대행만 하는 카드사도 2~3%인데, 저희는 풀서비스입니다.",
            icon: "💎"
        }
    ];

    return (
        <section id="features" style={{ backgroundColor: '#f9fafb' }}>
            <div className="container">
                <div className="features-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 className="features-title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: '#111827', wordBreak: 'keep-all' }}>왜 KCC 홈씨씨 구독 솔루션인가?</h2>
                    <p className="features-subtitle" style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>대한민국 창호 1위 KCC의 품질은 그대로, <br />결제 방식의 혁신으로 인테리어 영업의 패러다임을 바꿉니다.</p>
                </div>

                <div className="features-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                    {points.map((p, i) => (
                        <div key={i} className="feature-card" style={{
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(0,0,0,0.05)',
                            background: '#fff',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                        }}>
                            <div className="feature-icon" style={{
                                fontSize: '2rem',
                                marginBottom: '1rem',
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>{p.icon}</div>
                            <div className="feature-content">
                                <h3 className="feature-title" style={{ marginBottom: '0.75rem', fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>{p.title}</h3>
                                <p className="feature-desc" style={{ color: '#6b7280', lineHeight: 1.6, fontSize: '0.9rem' }}>{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="market-insight" style={{
                    marginTop: '3rem',
                    background: '#0a0f1a',
                    borderRadius: '1.5rem',
                    padding: '2.5rem 1.5rem',
                    color: 'white',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    <div className="market-insight-grid" style={{ display: 'grid', gap: '2rem', alignItems: 'center' }}>
                        <div>
                            <div style={{
                                color: 'var(--accent)',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                marginBottom: '0.75rem',
                                letterSpacing: '0.1em'
                            }}>Market Insight</div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>공사비용 상승, <br /><span style={{ color: 'var(--accent)' }}>오늘이 가장 저렴합니다</span></h2>
                            <p style={{ opacity: 0.8, lineHeight: 1.7, fontSize: '0.9rem' }}>
                                자재비 및 노무비의 지속적인 상승으로 공사 시점을 미룰수록 비용 부담은 늘어납니다. 지금 구독으로 비용 리스크를 방어하세요.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                    <span style={{ opacity: 0.8 }}>자재비 상승 (최근 2년)</span>
                                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>+18.5%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: '85%', height: '100%', background: 'var(--accent)', borderRadius: '8px' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                    <span style={{ opacity: 0.8 }}>인건비 상승 (최근 2년)</span>
                                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>+12.3%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: '65%', height: '100%', background: 'var(--accent)', borderRadius: '8px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .features-grid {
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                }
                
                .feature-card {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    text-align: left !important;
                    padding: 1rem !important;
                    gap: 1rem;
                }
                
                .feature-card .feature-icon {
                    flex-shrink: 0;
                    width: 48px !important;
                    height: 48px !important;
                    font-size: 1.5rem !important;
                    margin: 0 !important;
                }
                
                .feature-card .feature-content {
                    flex: 1;
                }
                
                .feature-card .feature-title {
                    font-size: 1rem !important;
                    margin-bottom: 0.25rem !important;
                }
                
                .feature-card .feature-desc {
                    font-size: 0.8rem !important;
                    line-height: 1.4 !important;
                }
                
                @media (min-width: 768px) {
                    .features-header {
                        margin-bottom: 4rem !important;
                    }
                    .features-title {
                        font-size: 2.5rem !important;
                    }
                    .features-subtitle {
                        font-size: 1.1rem !important;
                    }
                    .features-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                    }
                    .feature-card {
                        display: block !important;
                        text-align: center !important;
                        padding: 2rem 1.5rem !important;
                    }
                    .feature-card .feature-icon {
                        width: 60px !important;
                        height: 60px !important;
                        font-size: 2rem !important;
                        margin: 0 auto 1rem !important;
                    }
                    .feature-card .feature-title {
                        font-size: 1.15rem !important;
                        margin-bottom: 0.75rem !important;
                    }
                    .feature-card .feature-desc {
                        font-size: 0.9rem !important;
                        line-height: 1.6 !important;
                    }
                    .market-insight {
                        padding: 3.5rem 3rem !important;
                        border-radius: 2rem !important;
                        margin-top: 5rem !important;
                    }
                    .market-insight-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 3rem !important;
                    }
                    .market-insight h2 {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
