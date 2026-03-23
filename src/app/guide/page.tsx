'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './guide.css';

export default function SubscriptionGuide() {
    // --- Calculation Constants ---
    const interestRates: { [key: number]: number } = {
        24: 0.167,
        36: 0.176,
        48: 0.205,
        60: 0.240
    };

    // --- Calculator State ---
    const [totalCost, setTotalCost] = useState(1000); // 1000만원
    const [cashPayment, setCashPayment] = useState(300); // 300만원
    const [months, setMonths] = useState(60);         // 60개월

    // Handle total cost change
    const handleTotalCostChange = (val: number) => {
        setTotalCost(val);
        if (cashPayment > val) {
            setCashPayment(val);
        }
    };

    // Formula: Partner Admin Standard (Prepaid Interest)
    const currentRate = interestRates[months] || 0;
    const total = totalCost * 10000;
    const cashAmount = cashPayment * 10000;
    const subAmount = total - cashAmount;

    // Formula: Monthly = Principal / (Months * (1 - InterestRate))
    const rawMonthlyResult = months > 0
        ? Math.floor(subAmount / (months * (1 - currentRate)))
        : 0;

    // Truncate to 100 KRW (Same as Admin)
    const monthlyTotal = Math.floor(rawMonthlyResult / 100) * 100;

    // Card comparison (approximate 24 mo)
    const cardMonthly = subAmount > 0 ? Math.round(subAmount / 24 * (1 + 0.02 * 12)) : 0;
    const saving = Math.max(0, cardMonthly - monthlyTotal);

    // --- FAQ State ---
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // --- Scroll & Sticky CTA ---
    const [showSticky, setShowSticky] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const partialRef = useRef<HTMLDivElement>(null);
    const [barAnimated, setBarAnimated] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const heroHeight = heroRef.current.offsetHeight;
                setShowSticky(window.scrollY > heroHeight * 0.5);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.12 });

        const barObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !barAnimated) {
                setBarAnimated(true);
            }
        }, { threshold: 0.3 });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
        if (partialRef.current) barObserver.observe(partialRef.current);

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            barObserver.disconnect();
        };
    }, [barAnimated]);

    return (
        <div className="guide-body">
            {/* FontAwesome & Noto Sans */}
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />

            {/* ===== STICKY CTA ===== */}

            {/* ===== HERO ===== */}
            <section className="guide-hero" id="hero" ref={heroRef}>
                <div className="guide-hero-shapes">
                    <div className="shape s1"></div>
                    <div className="shape s2"></div>
                    <div className="shape s3"></div>
                </div>
                <div className="guide-hero-inner">
                    <div className="guide-hero-content">
                        <div className="guide-hero-badge">
                            <i className="fas fa-star"></i>
                            KCC홈씨씨 공식 구독서비스
                        </div>
                        <h1 className="guide-hero-title">
                            인테리어 비용이<br />
                            <span className="highlight">부담되시나요?</span><br />
                            이제 월납으로<br />해결하세요
                        </h1>
                        <p className="guide-hero-subtitle">
                            최대 60개월 장기 분납 · 특별 한도 제공<br />
                            부동산 담보 없이 즉시 신청 가능
                        </p>
                        <div className="guide-hero-stats">
                            <div className="guide-hero-stat">
                                <span className="guide-hero-stat-num">60<span style={{ fontSize: '18px' }}>개월</span></span>
                                <span className="guide-hero-stat-label">장기 할부</span>
                            </div>
                            <div className="guide-hero-stat">
                                <span className="guide-hero-stat-num">무담보</span>
                                <span className="guide-hero-stat-label">특별 한도 제공</span>
                            </div>
                            <div className="guide-hero-stat">
                                <span className="guide-hero-stat-num">간편<span style={{ fontSize: '18px' }}>접수</span></span>
                                <span className="guide-hero-stat-label">모바일 대면/비대면</span>
                            </div>
                        </div>
                        <div className="guide-hero-cta-group">
                            <a href="#steps" className="guide-btn-secondary">
                                <i className="fas fa-list-ol"></i>
                                신청 절차 보기
                            </a>
                        </div>
                    </div>

                    {/* Hero Card (Desktop Only) */}
                    <div className="guide-hero-card">
                        <div className="guide-hero-card-title">💡 부분 구독 시뮬레이션</div>
                        <div className="guide-hero-card-sub">총 견적 1,000만원 기준 예시</div>
                        <div className="guide-calc-row">
                            <span className="guide-calc-label">💳 현금/카드 납부</span>
                            <span className="guide-calc-value primary">300만원</span>
                        </div>
                        <div className="guide-calc-row">
                            <span className="guide-calc-label">📝 구독 전환 금액</span>
                            <span className="guide-calc-value accent">700만원</span>
                        </div>
                        <hr className="guide-hero-card-divider" />
                        <div className="guide-calc-row">
                            <span className="guide-calc-label">📅 구독 기간</span>
                            <span className="guide-calc-value">60개월</span>
                        </div>
                        <div className="guide-calc-row">
                            <span className="guide-calc-label">🏦 담보</span>
                            <span className="guide-calc-value green">필요없음</span>
                        </div>
                        <div className="guide-calc-total">
                            <div className="guide-calc-total-label">💰 월 납부금 (60개월)</div>
                            <div className="guide-calc-total-num">약 153,500<span>원</span></div>
                        </div>
                        <div className="guide-calc-note">* 실제 파트너 정산 시스템 기준 (선취이자 적용)</div>
                    </div>
                </div>
            </section>

            {/* ===== PROBLEM ===== */}
            <section className="guide-section guide-problem-section">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-exclamation-circle"></i> 이런 고민 있으셨나요?</div>
                        <h2 className="guide-section-title">인테리어, 막막하셨죠?</h2>
                        <p className="guide-section-desc">꼭 필요한 리모델링인데 목돈이 부담돼서 미루고 계셨다면,<br className="desktop-only" /> KCC홈씨씨 구독서비스가 해답입니다.</p>
                    </div>
                    <div className="guide-problem-grid">
                        <div className="guide-problem-card fade-up fade-up-delay-1">
                            <div className="guide-problem-icon">😰</div>
                            <div className="guide-problem-title">목돈 마련이 어렵다</div>
                            <p className="guide-problem-desc">창호 교체, 주방, 욕실 리모델링…<br />한 번에 수백~수천만 원이 필요해 선뜻 결정하기 어려우셨죠.</p>
                        </div>
                        <div className="guide-problem-card fade-up fade-up-delay-2">
                            <div className="guide-problem-icon">💸</div>
                            <div className="guide-problem-title">카드 할부 이자가 부담스럽다</div>
                            <p className="guide-problem-desc">카드 장기 할부는 이자가 높고,<br />매달 부담이 커서 생활비가 빠듯해지는 문제가 생기죠.</p>
                        </div>
                        <div className="guide-problem-card fade-up fade-up-delay-3">
                            <div className="guide-problem-icon">🏦</div>
                            <div className="guide-problem-title">대출은 담보가 필요하다</div>
                            <p className="guide-problem-desc">은행 대출은 담보나 복잡한 서류가 필요해 번거롭고, 신용대출은 한도와 금리가 걱정되셨을 거예요.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BENEFITS ===== */}
            <section className="guide-section guide-benefits-section" id="benefits">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-award"></i> 핵심 혜택</div>
                        <h2 className="guide-section-title">KCC홈씨씨 구독이<br /><em>특별한 이유 3가지</em></h2>
                        <p className="guide-section-desc">기존의 어떤 방식과도 다릅니다. 구독이 왜 최선의 선택인지 확인해보세요.</p>
                    </div>
                    <div className="guide-benefits-grid">
                        <div className="guide-benefit-card c1 fade-up fade-up-delay-1">
                            <div className="guide-benefit-num">01</div>
                            <div className="guide-benefit-icon-wrap">🏠</div>
                            <div className="guide-benefit-big-num">60<span style={{ fontSize: '0.5em', fontWeight: 700 }}>개월</span></div>
                            <div className="guide-benefit-title">장기 분납으로<br />부담 최소화</div>
                            <p className="guide-benefit-desc">최대 60개월 장기 할부 개념으로 구독이 가능합니다. 큰 금액을 한 번에 내는 것이 아닌, 월 소액으로 나눠 납부하여 가계에 부담을 최소화합니다.</p>
                            <span className="guide-benefit-tag">💡 최대 5년 분납</span>
                        </div>

                        <div className="guide-benefit-card c2 fade-up fade-up-delay-2">
                            <div className="guide-benefit-num">02</div>
                            <div className="guide-benefit-icon-wrap">📊</div>
                            <div className="guide-benefit-big-num" style={{ fontSize: '2.5rem' }}>저금리</div>
                            <div className="guide-benefit-title">업계 최저 수준<br />구독 이자율</div>
                            <p className="guide-benefit-desc">업계 최저 수준의 금리가 적용됩니다. 카드사 장기 할부 이자(월 1.5~2.0%)와 비교하면 <strong>매우 경제적</strong>입니다. 같은 금액이라도 이자 부담을 획기적으로 낮췄습니다.</p>
                            <span className="guide-benefit-tag">💰 카드 대비 파격 혜택</span>
                        </div>

                        <div className="guide-benefit-card c3 fade-up fade-up-delay-3">
                            <div className="guide-benefit-num">03</div>
                            <div className="guide-benefit-icon-wrap">🔓</div>
                            <div className="guide-benefit-big-num" style={{ fontSize: '2.5rem' }}>무담보</div>
                            <div className="guide-benefit-title">담보 없이<br />특별 한도 제공</div>
                            <p className="guide-benefit-desc">부동산 담보나 보증인 없이도 특별 한도를 제공합니다. 복잡한 서류 절차 없이 간편하게 신청 가능하며, 신용 심사를 통해 빠르게 승인됩니다.</p>
                            <span className="guide-benefit-tag">✅ 담보 불필요</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PARTIAL SUBSCRIPTION ===== */}
            <section className="guide-section guide-partial-section" id="partial" ref={partialRef}>
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-sliders-h"></i> 유연한 부분 구독</div>
                        <h2 className="guide-section-title">필요한 금액만<br /><em>구독으로 전환!</em></h2>
                        <p className="guide-section-desc">전체 금액을 구독할 필요 없습니다. 원하는 금액만 선택적으로 구독 전환하고,<br className="desktop-only" /> 나머지는 현금 또는 카드로 납부하세요.</p>
                    </div>
                    <div className="guide-partial-example fade-up">
                        <div className="guide-partial-example-title">
                            <div>실제 활용 예시<br /><span style={{ fontSize: '0.9em', opacity: 0.85 }}>총 견적 금액 1,000만원인 경우</span></div>
                        </div>
                        <div className="guide-partial-bar-wrap">
                            <div className="guide-partial-bar-label">
                                <span>납부 방식 비율</span>
                                <strong>1,000만원 총 견적</strong>
                            </div>
                            <div className="guide-partial-bar">
                                <div className="guide-bar-cash" style={{ width: barAnimated ? '30%' : '0%' }}>현금/카드 30%</div>
                                <div className="guide-bar-sub" style={{ width: barAnimated ? '70%' : '0%' }}>구독 전환 70%</div>
                            </div>
                        </div>
                        <div className="guide-partial-details">
                            <div className="guide-partial-detail-box guide-pd-cash">
                                <div className="guide-pd-icon">💳</div>
                                <div className="guide-pd-title">현금 / 카드 납부</div>
                                <div className="guide-pd-num">300만원</div>
                                <div className="guide-pd-desc">시공 당일 현금 또는 카드로 납부.<br />일시불 혜택 적용 가능</div>
                            </div>
                            <div className="guide-partial-detail-box guide-pd-sub">
                                <div className="guide-pd-icon">📅</div>
                                <div className="guide-pd-title">구독 전환 금액</div>
                                <div className="guide-pd-num">700만원</div>
                                <div className="guide-pd-desc">최대 60개월 분납 가능<br />월 납부금 약 <strong style={{ color: '#FFD700' }}>153,500원~</strong></div>
                            </div>
                        </div>
                        <div className="guide-partial-note">
                            <i className="fas fa-info-circle"></i>
                            <p>구독 전환 금액은 고객이 직접 설정합니다. 전액 구독, 부분 구독 모두 가능하며, 구독 기간도 상황에 따라 조정 상담이 가능합니다. 대리점을 통해 자세한 상담을 받아보세요.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== COMPARE ===== */}
            <section className="guide-section guide-compare-section" id="compare">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-balance-scale"></i> 비교 분석</div>
                        <h2 className="guide-section-title">다른 방법과<br /><em>이렇게 다릅니다</em></h2>
                        <p className="guide-section-desc">카드 할부, 은행 대출과 KCC홈씨씨 구독서비스를 직접 비교해보세요.</p>
                    </div>
                    <div className="guide-compare-table-wrap fade-up">
                        <table className="guide-compare-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="col-normal">카드 장기 할부</th>
                                    <th className="col-normal">은행 신용대출</th>
                                    <th className="col-sub">KCC홈씨씨 구독 <span className="best-badge">추천</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>월 이자율</td>
                                    <td className="normal-val">1.5% ~ 2.0%</td>
                                    <td className="normal-val">0.5% ~ 1.2%</td>
                                    <td className="sub-val good">최저 수준</td>
                                </tr>
                                <tr>
                                    <td>분납 기간</td>
                                    <td className="normal-val">최대 24개월</td>
                                    <td className="normal-val">12 ~ 36개월</td>
                                    <td className="sub-val good">최대 60개월</td>
                                </tr>
                                <tr>
                                    <td>담보 필요 여부</td>
                                    <td className="normal-val"><span className="guide-cross">✗ 한도 낮음</span></td>
                                    <td className="normal-val"><span className="guide-cross">✗ 담보 or 보증 필요</span></td>
                                    <td className="sub-val good"><span className="guide-check">✓ 담보 불필요</span></td>
                                </tr>
                                <tr>
                                    <td>부분 분납 가능</td>
                                    <td className="normal-val"><span className="guide-cross">✗ 불가</span></td>
                                    <td className="normal-val"><span className="guide-cross">✗ 불가</span></td>
                                    <td className="sub-val good"><span className="guide-check">✓ 가능</span></td>
                                </tr>
                                <tr>
                                    <td>신청 편의성</td>
                                    <td className="normal-val">카드사 별도 신청</td>
                                    <td className="normal-val">은행 방문 / 심사 복잡</td>
                                    <td className="sub-val good">모바일 전자서명</td>
                                </tr>
                                <tr>
                                    <td>한도 설정</td>
                                    <td className="normal-val">카드 한도 내</td>
                                    <td className="normal-val">신용 등급에 따라 제한</td>
                                    <td className="sub-val good">특별 한도 제공</td>
                                </tr>
                                <tr>
                                    <td>월 부담 (1,000만원 기준)</td>
                                    <td className="normal-val">약 47~55만원<br /><span style={{ fontSize: '12px', color: '#aaa' }}>(24개월 기준)</span></td>
                                    <td className="normal-val">약 28~35만원<br /><span style={{ fontSize: '12px', color: '#aaa' }}>(36개월 기준)</span></td>
                                    <td className="sub-val good">약 <strong>16~17만원</strong><br /><span style={{ fontSize: '12px', opacity: 0.7 }}>(60개월 기준)</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ===== CALCULATOR ===== */}
            <section className="guide-section guide-calc-section" id="calculator">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-calculator"></i> 월 납부금 계산기</div>
                        <h2 className="guide-section-title">내 구독 요금을<br /><em>직접 계산해보세요</em></h2>
                        <p className="guide-section-desc">구독 전환 금액과 기간을 조정해보며 월 납부금을 미리 확인할 수 있습니다.</p>
                    </div>
                    <div className="guide-calc-wrap fade-up">
                        <div className="guide-calc-input-box">
                            <div className="guide-calc-input-title">
                                <i className="fas fa-sliders-h" style={{ color: 'var(--primary)' }}></i>
                                조건 설정
                            </div>
                            <div className="guide-calc-form-row">
                                <label>총 견적 금액</label>
                                <input
                                    type="range"
                                    min="100" max="5000" step="100"
                                    value={totalCost}
                                    onChange={(e) => handleTotalCostChange(parseInt(e.target.value))}
                                />
                                <div className="guide-range-value-display">
                                    <span className="guide-range-val-text">{totalCost.toLocaleString()}만원</span>
                                    <span className="guide-range-unit">100만~5,000만원</span>
                                </div>
                            </div>
                            <div className="guide-calc-form-row">
                                <label>현금/카드 납부 금액</label>
                                <input
                                    type="range"
                                    min="0" max={totalCost} step={10}
                                    value={cashPayment}
                                    onChange={(e) => setCashPayment(parseInt(e.target.value))}
                                />
                                <div className="guide-range-value-display">
                                    <span className="guide-range-val-text">{cashPayment.toLocaleString()}만원</span>
                                    <span className="guide-range-unit">0원 ~ {totalCost.toLocaleString()}만원</span>
                                </div>
                            </div>
                            <div className="guide-calc-input-group">
                                <label className="guide-calc-label">📅 구독 기간</label>
                                <div className="guide-calc-month-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                                    {[24, 36, 48, 60].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMonths(m)}
                                            style={{
                                                padding: '12px 4px',
                                                borderRadius: '8px',
                                                border: '2px solid',
                                                borderColor: months === m ? '#1e3a8a' : '#e2e8f0',
                                                background: months === m ? '#1e3a8a' : 'white',
                                                color: months === m ? 'white' : '#64748b',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {m}개월
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="guide-calc-result-box">
                            <div className="guide-calc-result-title">📊 계산 결과</div>
                            <div className="guide-calc-result-item">
                                <span className="guide-calc-result-item-label">총 견적 금액</span>
                                <span className="guide-calc-result-item-val">{(total / 10000).toLocaleString()}만원</span>
                            </div>
                            <div className="guide-calc-result-item">
                                <span className="guide-calc-result-item-label">현금/카드 납부금</span>
                                <span className="guide-calc-result-item-val">{(cashAmount / 10000).toLocaleString()}만원</span>
                            </div>
                            <div className="guide-calc-result-item">
                                <span className="guide-calc-result-item-label">구독 전환 금액</span>
                                <span className="guide-calc-result-item-val">{(subAmount / 10000).toLocaleString()}만원</span>
                            </div>
                            <div className="guide-calc-result-item">
                                <span className="guide-calc-result-item-label">구독 기간</span>
                                <span className="guide-calc-result-item-val">{months}개월</span>
                            </div>
                            <div className="guide-calc-result-item" style={{ borderTop: '2px solid rgba(255,255,255,0.3)', marginTop: '8px', paddingTop: '16px' }}>
                                <span className="guide-calc-result-item-label">💰 예상 월 납입금</span>
                                <span className="guide-calc-result-item-val big">{monthlyTotal.toLocaleString()}원</span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '24px', textAlign: 'center' }}>* 실제 파트너 정산 시스템 기준 (선취이자 적용)</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== STEPS ===== */}
            <section className="guide-section guide-steps-section" id="steps">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-list-ol"></i> 신청 절차</div>
                        <h2 className="guide-section-title">간단한 5단계로<br /><em>구독 신청 완료!</em></h2>
                        <p className="guide-section-desc">복잡한 서류나 은행 방문 없이, 스마트폰 하나로 모든 절차를 진행할 수 있습니다.</p>
                    </div>
                    <div className="guide-steps-wrap fade-up">
                        <div className="guide-steps-line"></div>
                        <div className="guide-steps-grid">
                            <div className="guide-step-item">
                                <div className="guide-step-circle">
                                    <span className="guide-step-num">STEP 1</span>
                                    <i className="fas fa-file-invoice-dollar guide-step-circle-icon"></i>
                                </div>
                                <div className="guide-step-name">구독원금 확정</div>
                                <p className="guide-step-desc">전체 견적 확인 후<br />구독 전환 금액 결정</p>
                            </div>
                            <div className="guide-step-item">
                                <div className="guide-step-circle">
                                    <span className="guide-step-num">STEP 2</span>
                                    <i className="fas fa-store guide-step-circle-icon"></i>
                                </div>
                                <div className="guide-step-name">구독 신청</div>
                                <p className="guide-step-desc">담당 대리점을 통해<br />구독 서비스 신청</p>
                            </div>
                            <div className="guide-step-item">
                                <div className="guide-step-circle">
                                    <span className="guide-step-num">STEP 3</span>
                                    <i className="fas fa-sms guide-step-circle-icon"></i>
                                </div>
                                <div className="guide-step-name">문자 수신</div>
                                <p className="guide-step-desc">신용 동의 및<br />서류 등록 문자 수신</p>
                            </div>
                            <div className="guide-step-item">
                                <div className="guide-step-circle">
                                    <span className="guide-step-num">STEP 4</span>
                                    <i className="fas fa-mobile-alt guide-step-circle-icon"></i>
                                </div>
                                <div className="guide-step-name">전자서명</div>
                                <p className="guide-step-desc">모바일로<br />구독계약 전자서명</p>
                            </div>
                            <div className="guide-step-item">
                                <div className="guide-step-circle">
                                    <span className="guide-step-num">STEP 5</span>
                                    <i className="fas fa-microphone guide-step-circle-icon"></i>
                                </div>
                                <div className="guide-step-name">녹취 약정</div>
                                <p className="guide-step-desc">시공 완료 후<br />전화 녹취로 약정 확인</p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-step-detail-box fade-up">
                        <div className="guide-step-detail-item">
                            <div className="guide-step-detail-num">STEP 01</div>
                            <div className="guide-step-detail-title">📋 구독원금 확정</div>
                            <p className="guide-step-detail-desc">KCC홈씨씨 대리점을 통해 시공 견적을 받고, 전체 금액 중 구독으로 전환할 금액을 결정합니다. 일부만 구독으로 돌리는 것도 가능합니다.</p>
                        </div>
                        <div className="guide-step-detail-item">
                            <div className="guide-step-detail-num">STEP 02</div>
                            <div className="guide-step-detail-title">🏪 구독 신청</div>
                            <p className="guide-step-detail-desc">담당 대리점 직원이 구독 신청을 도와드립니다. 대리점을 통해 정식 구독 서비스를 신청하며, 한도 심사가 진행됩니다.</p>
                        </div>
                        <div className="guide-step-detail-item">
                            <div className="guide-step-detail-num">STEP 03</div>
                            <div className="guide-step-detail-title">📱 문자 수신</div>
                            <p className="guide-step-detail-desc">신청 후 고객님 휴대폰으로 신용 동의 및 서류 등록 안내 문자가 발송됩니다. 문자 링크를 통해 간편하게 처리하세요.</p>
                        </div>
                        <div className="guide-step-detail-item">
                            <div className="guide-step-detail-num">STEP 04</div>
                            <div className="guide-step-detail-title">✍️ 전자서명</div>
                            <p className="guide-step-detail-desc">모바일 기기로 구독 계약서에 전자서명을 진행합니다. 은행 방문 없이 스마트폰만으로 모든 계약이 완료됩니다.</p>
                        </div>
                        <div className="guide-step-detail-item">
                            <div className="guide-step-detail-num">STEP 05</div>
                            <div className="guide-step-detail-title">🎤 녹취 약정</div>
                            <p className="guide-step-detail-desc">시공 완료 후 전화 통화를 통해 최종 약정이 진행됩니다. 고객 보호를 위한 필수 절차이며, 이후 월 납부가 시작됩니다.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="guide-section guide-faq-section" id="faq">
                <div className="guide-section-inner">
                    <div className="guide-text-center fade-up">
                        <div className="guide-section-badge"><i className="fas fa-question-circle"></i> 자주 묻는 질문</div>
                        <h2 className="guide-section-title">궁금하신 점을<br /><em>확인해보세요</em></h2>
                    </div>
                    <div className="guide-faq-list fade-up">
                        {[
                            { q: "구독 서비스의 이자율은 어떻게 되나요?", a: "KCC홈씨씨 구독서비스는 업계 최저 수준의 금리를 지향합니다. 카드 장기 할부(연 18~24%) 대비 매우 낮은 수준의 금융 혜택이 적용되어 월 부담을 획기적으로 낮췄습니다. 개인 신용도 및 구독 기간에 따른 상세 이율은 대리점 상담을 통해 즉시 확인하실 수 있습니다." },
                            { q: "담보나 보증인 없이 신청할 수 있나요?", a: "네, 별도의 부동산 담보나 보증인 없이 신청 가능합니다. 신용 심사를 통해 특별 한도가 제공되며, 대리점을 통해 간편하게 진행됩니다. 단, 신용 상태에 따라 한도가 달라질 수 있습니다." },
                            { q: "전체 금액이 아닌 일부만 구독으로 돌릴 수 있나요?", a: "물론입니다! 전체 견적 중 원하는 금액만 구독으로 전환하실 수 있습니다. 예를 들어 총 1,000만원 견적이라면 300만원은 현금/카드로 납부하고, 나머지 700만원만 60개월 구독으로 전환하는 방식이 가능합니다." },
                            { q: "구독 기간 중 중도 상환이 가능한가요?", a: "중도 상환 관련 사항은 계약 시 세부 조건에 따라 다를 수 있습니다. 정확한 조건은 대리점 상담을 통해 확인해주시기 바랍니다." },
                            { q: "어떤 인테리어 시공에 구독 서비스가 적용되나요?", a: "KCC홈씨씨에서 취급하는 창호(샤시) 교체, 주방, 욕실 리모델링 등 다양한 인테리어 시공에 구독 서비스 적용이 가능합니다. 자세한 적용 범위는 가까운 대리점에 문의해주세요." },
                            { q: "신청부터 시공까지 얼마나 걸리나요?", a: "구독 신청 후 신용 심사 및 전자서명 절차를 마치면 빠르게 시공 일정을 잡을 수 있습니다. 일반적으로 신청 후 수일 내에 모든 사전 절차가 완료되며, 시공 일정은 대리점과 협의 후 확정됩니다." }
                        ].map((item, i) => (
                            <div key={i} className={`guide-faq-item ${openFaq === i ? 'open' : ''}`}>
                                <div className="guide-faq-q" onClick={() => toggleFaq(i)}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <span className="q-icon">Q</span>
                                        <span>{item.q}</span>
                                    </div>
                                    <i className="fas fa-chevron-down arrow"></i>
                                </div>
                                <div className="guide-faq-a">
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="guide-cta-section" id="contact">
                <div className="guide-section-inner">
                    <div className="guide-section-badge">
                        <i className="fas fa-phone-alt"></i> 지금 바로 시작하세요
                    </div>
                    <h2 className="guide-section-title" style={{ margin: '14px auto 14px' }}>
                        오늘, 새 인테리어의<br />
                        <em>첫 걸음을 내딛으세요</em>
                    </h2>
                    <p className="guide-section-desc" style={{ margin: '0 auto 36px' }}>
                        목돈 걱정 없이, 담보 없이, 이자 부담 없이.<br />
                        KCC홈씨씨 구독서비스로 지금 바로 시작하세요.
                    </p>
                    <div className="guide-cta-points">
                        <div className="guide-cta-point"><i className="fas fa-check-circle"></i> 60개월 장기 분납</div>
                        <div className="guide-cta-point"><i className="fas fa-check-circle"></i> 최저 수준의 금융 금리</div>
                        <div className="guide-cta-point"><i className="fas fa-check-circle"></i> 담보 없이 특별 한도</div>
                        <div className="guide-cta-point"><i className="fas fa-check-circle"></i> 부분 구독 가능</div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="guide-footer">
                <div className="guide-footer-inner">
                    <div>
                        <div className="guide-footer-logo">KCC홈씨씨 구독서비스</div>
                        <div>KCC글라스의 홈씨씨 인테리어 구독서비스 안내 페이지</div>
                        <div style={{ marginTop: '4px' }}>고객문의: 대리점 또는 홈씨씨 홈페이지</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        &copy; 2025 KCC홈씨씨
                    </div>
                </div>
                <div className="guide-footer-inner" style={{ paddingTop: 0 }}>
                    <div className="guide-footer-disclaimer">
                        본 페이지에 기재된 내용은 안내 목적의 참고 자료이며, 실제 구독 조건(이자율, 한도, 기간 등)은 신청 시점 및 개인 신용 상태에 따라 달라질 수 있습니다.
                        정확한 조건은 KCC홈씨씨 담당 대리점을 통해 반드시 확인하시기 바랍니다.
                        월 이자율, 할부 조건 등은 금융 관련 법규 및 정책에 따라 변경될 수 있습니다.
                    </div>
                </div>
            </footer>
        </div>
    );
}
