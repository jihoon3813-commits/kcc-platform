'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Calculator from '@/components/Calculator';
import Features from '@/components/Features';
import PartnerRegisterModal from '@/components/PartnerRegisterModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Header />
      <main>
        <Hero onRegisterClick={openModal} />
        <Features />

        {/* Proof Section - 실적 증명 */}
        <section style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            {/* Question Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.4rem 1rem',
                background: 'rgba(251, 191, 36, 0.15)',
                borderRadius: '2rem',
                marginBottom: '1rem'
              }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.8rem' }}>📊 실제 운영 데이터</span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.4rem, 5vw, 2.25rem)',
                fontWeight: 800,
                marginBottom: '0.75rem',
                lineHeight: 1.3,
                wordBreak: 'keep-all'
              }}>
                구독을 도입하면<br className="mobile-br" /> <span style={{ color: '#fbbf24' }}>정말 계약률이 높아질까요?</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                네! 티유디지털이 3개월간 직접 검증한 결과입니다.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              maxWidth: '900px',
              margin: '0 auto 2.5rem'
            }} className="proof-stats-grid">
              {[
                { value: '1,000+', label: '누적 견적', sub: '3개월', color: '#60a5fa' },
                { value: '70%', label: '구독 전환', sub: '의향률', color: '#fbbf24' },
                { value: '99%', label: '승인율', sub: '특별한도', color: '#4ade80' }
              ].map((stat, i) => (
                <div key={i} className="proof-stat-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.25rem 0.5rem',
                  textAlign: 'center'
                }}>
                  <div className="proof-stat-value" style={{
                    fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1
                  }}>{stat.value}</div>
                  <div className="proof-stat-label" style={{ fontWeight: 700, marginTop: '0.35rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{stat.label}</div>
                  <div className="proof-stat-sub" style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Key Message Box */}
            <div className="proof-message-box" style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</div>
                <div>
                  <h4 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    비용 부담으로 일부만 시공하려던 고객도 전체 시공으로 전환!
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    저가 제품 대신 <strong style={{ color: '#fff' }}>고급 KCC 창호</strong>를 선택하는 고객 증가! 자재비·인건비 상승을 고려하면 <strong style={{ color: '#fff' }}>지금 시공이 유리</strong>하다는 점 금방 이해하십니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#fbbf24',
                lineHeight: 1.4,
                wordBreak: 'keep-all'
              }}>
                ✨ 파트너 사장님의 사업 활성화에<br className="mobile-br" /> 분명한 도구가 됩니다!
              </p>
            </div>
          </div>
        </section>

        <Calculator onRegisterClick={openModal} />

        {/* Partner Experience Section */}
        <section className="experience-section" style={{
          padding: '3rem 0',
          background: 'linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)',
          textAlign: 'center'
        }}>
          <div className="container">
            <div style={{
              display: 'inline-block',
              padding: '0.4rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '2rem',
              marginBottom: '1rem'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.8rem' }}>🚀 NEW - 무료 체험</span>
            </div>
            <h2 className="experience-title" style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.3
            }}>
              가입 없이 파트너 센터를<br className="mobile-br" /> 미리 체험해보세요
            </h2>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 1.5rem',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#475569',
                lineHeight: 1.7,
                marginBottom: '0.5rem'
              }}>
                구독 솔루션 파트너가 사용하는<br className="mobile-br" /> <strong>실제 관리 시스템</strong>을 직접 경험해보세요.
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#475569',
                lineHeight: 1.7
              }}>
                별도의 회원가입이나 <strong>로그인 없이,</strong><br className="mobile-br" /> 바로 체험 가능합니다.
              </p>
            </div>

            <div className="experience-cards-grid" style={{
              display: 'grid',
              gap: '1rem',
              maxWidth: '900px',
              margin: '0 auto 3rem'
            }}>
              {[
                { icon: '📊', title: '대시보드', desc: '실시간 실적 현황' },
                { icon: '👥', title: '고객 관리', desc: '신청 고객 리스트' },
                { icon: '💰', title: '정산 관리', desc: '수수료 정산 내역' },
                { icon: '📝', title: '구독 신청', desc: '신규 고객 접수' }
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'white',
                  padding: '1.25rem 1rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.setItem('kcc_partner', JSON.stringify({
                  id: 'guest_demo',
                  name: '체험용 파트너',
                  owner: '홍길동',
                  phone: '010-1234-5678',
                  region: '전국'
                }));
                window.open('/dashboard', '_blank');
              }}
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '3rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              파트너 센터 체험하기 (Guest)
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              * 체험 모드는 새 창에서 열립니다. 실제 데이터와 무관한 샘플 환경입니다.
            </p>
          </div>
        </section>

        {/* Subscription Process Section */}
        <section className="process-section" style={{
          padding: '3rem 0',
          background: '#0f172a',
          color: 'white'
        }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.4rem 1rem',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '2rem',
                marginBottom: '1rem'
              }}>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem' }}>📋 구독 진행 프로세스</span>
              </div>
              <h2 className="process-title" style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.3
              }}>
                고객 구독 신청부터 정산까지,<br className="mobile-br" /> 한눈에 보는 전체 흐름
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                파트너님이 고객을 접수하면,<br className="mobile-br" /> 아래 단계를 거쳐 정산까지 완료됩니다.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: '0.5rem',
              maxWidth: '1100px',
              margin: '0 auto'
            }} className="process-grid">
              {[
                { step: '1', icon: '📝', title: '접수/신용동의', desc: '고객정보 입력 → 신용조회 동의', color: '#fbbf24' },
                { step: '2', icon: '📄', title: '1차승인/서류등록', desc: '본사 심사 후 1차 승인 → 서류 업로드', color: '#818cf8' },
                { step: '3', icon: '🏆', title: '최종승인/서류등록', desc: '서류 검토 → 최종 승인 → 시공계약서 등록', color: '#10b981' },
                { step: '4', icon: '📞', title: '전자서명/녹취', desc: '전자서명 및 해피콜(녹취)로 계약 확정', color: '#22d3ee' },
                { step: '5', icon: '💰', title: '정산진행', desc: '녹취 완료 → 다음날 수수료 입금!', color: '#4ade80' }
              ].map((item, i) => (
                <div key={i} className="process-card" style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    background: item.color,
                    color: '#0f172a',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, color: item.color, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                💡 각 단계별 상태는 파트너 센터 대시보드에서 실시간으로 확인하실 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section" style={{
          position: 'relative',
          padding: '4rem 0',
          background: '#0a0f1a',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          {/* Decorative background pulse */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 70, 173, 0.15) 0%, transparent 70%)',
            zIndex: 0
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="cta-title" style={{
              fontSize: 'clamp(1.3rem, 5vw, 1.75rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.35,
              wordBreak: 'keep-all'
            }}>지금 바로 KCC 홈씨씨 구독 솔루션 파트너가 되세요!</h2>
            <p style={{
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem',
              lineHeight: 1.6
            }}>
              전국 수백 개의 대리점과 인테리어 점주님이 이미 영업 성공률을 높이고 있습니다. 무료 가입으로 차별화된 경쟁력을 확보하세요.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={openModal}
                className="btn-primary"
                style={{
                  padding: '1.25rem 3rem',
                  fontSize: '1.2rem',
                  borderRadius: '3rem',
                  boxShadow: '0 20px 40px rgba(0, 70, 173, 0.3)'
                }}
              >
                무료 파트너 신청하기
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: '#0a0f1a', color: '#94a3b8', padding: '6rem 0 3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <img
                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"
                alt="KCC Logo"
                style={{ height: '32px', objectFit: 'contain', marginBottom: '2rem', opacity: 0.9 }}
              />
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '280px' }}>
                KCC 공식 파트너 (주)티유디지털은 <br />
                창호 산업의 디지털 혁신과 <br />
                구독 솔루션의 대중화를 선도합니다.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>고객센터</h4>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>1588-0883</p>
              <p style={{ fontSize: '0.9rem' }}>평일 09:00 - 18:00</p>
              <p style={{ fontSize: '0.9rem' }}>개인정보 관리자: 김은경 (kek3171@nate.com)</p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>빠른 링크</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <a href="#features" style={{ transition: 'color 0.2s' }}>서비스 특장점</a>
                <a href="#calculator" style={{ transition: 'color 0.2s' }}>구독료 계산기</a>
                <a href="/login" style={{ transition: 'color 0.2s' }}>파트너 센터 로그인</a>
                <a
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
                  href="#"
                  style={{ transition: 'color 0.2s', color: '#60a5fa', fontWeight: 'bold' }}
                >
                  🚀 관리자 페이지 체험 (Guest)
                </a>
                <a href="#" style={{ transition: 'color 0.2s' }}>이용약관</a>
                <a href="#" style={{ transition: 'color 0.2s', color: '#cbd5e1' }}>개인정보처리방침</a>
              </nav>
            </div>
          </div>

          <div style={{
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '1.5rem',
            fontSize: '0.8rem',
            opacity: 0.6
          }}>
            <div>
              주식회사 티유디지털(KCC글라스 판매점) | 대표: 김정열 | 사업자등록번호: 220-87-15092 <br />
              주소: 서울시 금천구 가산디지털1로 83, 802호
            </div>
            <div>
              © 2025 주식회사 티유디지털. All Rights Reserved. <br />
              KCC 홈씨씨는 KCC글라스의 등록상표입니다.
            </div>
          </div>
        </div>
      </footer>

      <PartnerRegisterModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
