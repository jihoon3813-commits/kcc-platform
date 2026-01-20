import Image from 'next/image';

interface HeroProps {
    onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
    return (
        <section className="hero" style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            {/* Mobile Background Gradient */}
            <div className="hero-mobile-bg" />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="animate-fade-in hero-content" style={{ maxWidth: '800px' }}>
                    <div className="hero-badge" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '2rem'
                    }}>
                        <span style={{ fontSize: '1rem' }}>🏆</span> KCC HomeCC 공식 구독 파트너 모집
                    </div>
                    <h1 className="hero-title" style={{
                        fontSize: 'clamp(1.8rem, 5vw, 3.8rem)',
                        lineHeight: 1.25,
                        letterSpacing: '-0.03em',
                        marginBottom: '2rem',
                        wordBreak: 'keep-all'
                    }}>
                        60개월 구독 결제 서비스로 <br />
                        <span className="hero-highlight">실적 2배 만들어낼 파트너를 모집합니다.</span>
                    </h1>
                    <p className="hero-desc" style={{
                        fontSize: '1.15rem',
                        marginBottom: '2.5rem',
                        lineHeight: 1.7,
                        maxWidth: '540px'
                    }}>
                        목돈 부담 때문에 망설이는 고객의 마음을 돌리는 가장 확실한 방법.
                        초기비용 0원에 최대 60개월 분납 결제로 성사율을 200% 높입니다.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={onRegisterClick}
                            className="btn-primary hero-cta-primary"
                            style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '3rem' }}
                        >
                            파트너 상담 신청하기
                        </button>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                localStorage.setItem('kcc_partner', JSON.stringify({
                                    id: 'guest_demo',
                                    name: '체험용 파트너',
                                    owner: '홍길동',
                                    phone: '010-1234-5678',
                                    region: '전국'
                                }));
                                window.open('/dashboard', '_blank');
                            }}
                            className="hero-cta-secondary"
                            style={{
                                padding: '1.25rem 2.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '3rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                display: 'inline-block',
                                cursor: 'pointer'
                            }}
                        >
                            파트너 센터 체험하기
                        </a>
                    </div>
                </div>
            </div>

            {/* Visual Element */}
            <div className="hero-image-container">
                <div className="hero-image-overlay" />
                <div className="hero-image-wrapper">
                    <Image
                        src="/kcc_window_interior.png"
                        alt="KCC Modern Interior"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>
            </div>

            <style jsx>{`
                .hero {
                    background-color: #fff;
                }
                
                .hero-mobile-bg {
                    display: none;
                }
                
                .hero-badge {
                    background: rgba(0, 70, 173, 0.05);
                    color: var(--primary);
                    border: 1px solid rgba(0, 70, 173, 0.1);
                }
                
                .hero-title {
                    color: #111827;
                }
                
                .hero-highlight {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .hero-desc {
                    color: #4b5563;
                }
                
                .hero-cta-secondary {
                    background: #f3f4f6;
                    color: #1f2937;
                    border: 1px solid #e5e7eb;
                }

                .hero-image-container {
                    position: absolute;
                    top: 5%;
                    right: -10%;
                    width: 60%;
                    height: 90%;
                    z-index: 1;
                    opacity: 0.9;
                }

                .hero-image-overlay {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 30% 50%, white 0%, transparent 70%);
                    z-index: 2;
                }

                .hero-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 4rem 0 0 4rem;
                    overflow: hidden;
                    box-shadow: -40px 40px 80px rgba(0,0,0,0.1);
                }

                @media (max-width: 1024px) {
                    .hero {
                        flex-direction: column;
                        justify-content: center;
                        min-height: 100vh !important;
                        background: transparent !important;
                    }
                    
                    .hero-mobile-bg {
                        display: none;
                    }
                    
                    .hero-content {
                        padding-top: 100px;
                        padding-bottom: 2rem;
                    }
                    
                    .hero-badge {
                        background: rgba(255, 255, 255, 0.15) !important;
                        color: #fbbf24 !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                        backdrop-filter: blur(10px);
                        font-size: 0.8rem !important;
                        padding: 0.5rem 1rem !important;
                    }
                    
                    .hero-title {
                        color: #fff !important;
                        text-shadow: 0 4px 30px rgba(0,0,0,0.6);
                        font-size: 2.25rem !important;
                        line-height: 1.35 !important;
                        margin-bottom: 1.25rem !important;
                        font-weight: 800 !important;
                    }
                    
                    .hero-highlight {
                        background: linear-gradient(135deg, #facc15 0%, #fb923c 100%) !important;
                        background-clip: text !important;
                        -webkit-background-clip: text !important;
                        -webkit-text-fill-color: transparent !important;
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    }
                    
                    .hero-desc {
                        color: rgba(255, 255, 255, 0.85) !important;
                        text-shadow: 0 1px 10px rgba(0,0,0,0.4);
                        font-size: 0.9rem !important;
                        line-height: 1.6 !important;
                        margin-bottom: 2rem !important;
                    }
                    
                    .hero-cta-primary,
                    .hero-cta-secondary {
                        padding: 1rem 2rem !important;
                        font-size: 1rem !important;
                        min-height: 56px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    
                    .hero-cta-secondary {
                        background: rgba(255, 255, 255, 0.15) !important;
                        color: #fff !important;
                        border: 1px solid rgba(255, 255, 255, 0.25) !important;
                        backdrop-filter: blur(10px);
                    }
                    
                    .hero-image-container {
                        position: absolute !important;
                        inset: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        opacity: 1;
                        z-index: 0 !important;
                    }
                    .hero-image-overlay {
                        background: linear-gradient(
                            180deg, 
                            rgba(0, 20, 40, 0.85) 0%, 
                            rgba(0, 30, 60, 0.6) 40%,
                            rgba(0, 20, 50, 0.4) 60%,
                            rgba(0, 15, 35, 0.9) 100%
                        ) !important;
                        z-index: 1 !important;
                    }
                    .hero-image-wrapper {
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                }

                @media (max-width: 640px) {
                    .hero-content {
                        padding-top: 80px;
                    }
                    .hero-title {
                        font-size: 2rem !important;
                    }
                    .hero-desc {
                        font-size: 0.8rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
