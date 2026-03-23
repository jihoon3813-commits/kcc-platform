'use client';

import Sidebar from '@/components/Sidebar';
import AdminSidebar from '@/components/AdminSidebar';

interface ManualStep {
    step: string;
    title: string;
    actor: '파트너' | '고객' | '구독센터';
    description: string;
    actions: string[];
    images?: string[];
}

export default function PartnerManualPage() {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
    const steps: ManualStep[] = [
        {
            step: '01',
            title: '신규 등록',
            actor: '파트너',
            description: '고객/견적 정보 입력 및 안내 문자 자동 발송',
            actions: [
                '1. [고객관리] 메뉴 우측 상단의 "고객 정보 등록" 버튼 클릭',
                '2. 고객의 기본 정보(이름, 연락처, 주소 등) 및 시공 정보 입력',
                '3. "구독 신청 생성" 버튼을 누르면 고객에게 안내 문자가 자동 발송됨'
            ],
            images: ['https://cdn.imweb.me/upload/S20250904697320f4fd9ed/431159892d2de.png']
        },
        {
            step: '02',
            title: '문자 확인',
            actor: '고객',
            description: '신용조회 동의 및 필수 서류 등록',
            actions: [
                '1. 수신된 카카오톡 알림톡/문자의 전용 링크 클릭',
                '2. 계약 내용 확인 및 신용조회 동의 진행',
                '3. 필요 시 본인 인증 및 필수 서류 첨부'
            ],
            images: ['https://cdn.imweb.me/upload/S20250904697320f4fd9ed/194d8c3c191f4.png']
        },
        {
            step: '03',
            title: '견적서 등록',
            actor: '파트너',
            description: '파트너 어드민에서 고객 선택 후 견적서 파일 첨부',
            actions: [
                '1. [고객관리] 메뉴에서 해당 고객 리스트 클릭하여 상세창 열기',
                '2. "계약서 및 서류 (선택영역)" 섹션 확인',
                '3. [구독 견적서] 항목에서 파일 선택 버튼을 눌러 확정된 견적서 업로드'
            ],
            images: ['https://cdn.imweb.me/upload/S20250904697320f4fd9ed/fea0e77358ee6.png']
        },
        {
            step: '04',
            title: '심사 진행',
            actor: '구독센터',
            description: '신용 조회 및 제출 서류 최종 승인 확인',
            actions: [
                '1. 구독센터에서 고객의 신용 점수 및 한도 조회',
                '2. 파트너가 제출한 견적서와 고객 정보 대조 및 검토',
                '3. 심사 결과에 따라 승인 또는 거절 처리'
            ]
        },
        {
            step: '05',
            title: '전자 서명',
            actor: '고객',
            description: '계약 문자 수신 후 본인인증 및 온라인 서명 (모바일 가이드)',
            actions: [
                '1. 심사 승인 후 수신된 전자계약 링크 클릭',
                '2. 휴대폰 본인 인증 수행',
                '3. 계약서 내용 확인 후 온라인 서명 완료'
            ],
            images: [
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/42093d8550a77.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/226eaafe03614.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/ce59a3336dcd8.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/3a8820a12508a.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/3c3d7ec59cd71.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/bdb99e34f1929.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/2087b64cb80be.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5569130202b53.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/cd1df4eff717d.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/ef8f248c9d150.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/65ad511a72f9b.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/d16cd2088cc0b.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/3d00863940d9f.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/f0ef6283d38a3.jpg',
                'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/8e8a7d1c1a73d.jpg'
            ]
        },
        {
            step: '06',
            title: '1차 정산 (50%)',
            actor: '구독센터',
            description: '전자서명 완료 후 +3영업일 이내 지급',
            actions: [
                '1. 전자서명이 정상적으로 완료되었는지 시스템 확인',
                '2. 파트너 계좌로 총 금액의 50%를 1차 대금으로 송금',
                '3. [정산관리] 메뉴에서 송금 내역 및 상태 확인 가능'
            ]
        },
        {
            step: '07',
            title: '시공 후 서류 등록',
            actor: '파트너',
            description: '시공계약서/확인서 및 현장 사진 등록',
            actions: [
                '1. 시공 완료 후 [고객관리] 상세창 접속',
                '2. 시공 전/중/후 현장 사진 업로드 (다중 사진 등록 가능)',
                '3. 고객이 서명한 "시공완료 확인서" 스캔본 또는 사진 첨부'
            ]
        },
        {
            step: '08',
            title: '녹취 약정 진행',
            actor: '고객',
            description: '상담원 해피콜 수신 및 유선 계약 확인 (발신번호: 02-2056-4701)',
            actions: [
                '1. 시공 서류 등록 후 파트너가 "녹취요청" 상태로 변경',
                '2. KCC 구독센터 상담원이 고객에게 해피콜(전화) 진행',
                '3. 시공 완료 여부 및 향후 결제 내용 유선 확인 및 녹취 동의'
            ]
        },
        {
            step: '09',
            title: '최종 정산 (50%)',
            actor: '구독센터',
            description: '녹취 완료 후 +3영업일 이내 잔금 정산',
            actions: [
                '1. 해피콜 통과 및 녹취 완료 상태 확인',
                '2. 파트너 계좌로 나머지 50% 잔금 최종 송금',
                '3. [정산관리] 메뉴에서 최종 정산 완료 상태 확인'
            ]
        }
    ];

    const getActorColor = (actor: string) => {
        switch (actor) {
            case '파트너': return '#d97706';
            case '고객': return '#2563eb';
            case '구독센터': return '#059669';
            default: return '#64748b';
        }
    };

    const getActorBg = (actor: string) => {
        switch (actor) {
            case '파트너': return '#fef3c7';
            case '고객': return '#dbeafe';
            case '구독센터': return '#d1fae5';
            default: return '#f1f5f9';
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {isAdmin ? <AdminSidebar /> : <Sidebar />}
            <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                            📖 파트너 매뉴얼 (프로세스 가이드)
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>
                            구독 솔루션의 전체 진행 단계별 역할과 필요 작업을 안내합니다.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {['파트너', '고객', '구독센터'].map(actor => (
                            <span key={actor} style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '2rem',
                                backgroundColor: getActorBg(actor as any),
                                color: getActorColor(actor as any),
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getActorColor(actor as any) }}></span>
                                {actor} 수행
                            </span>
                        ))}
                    </div>

                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                        <div style={{
                            position: 'absolute',
                            left: '20px',
                            top: '40px',
                            bottom: '0',
                            width: '2px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 0
                        }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {steps.map((item) => (
                                <div key={item.step} style={{ position: 'relative', display: 'flex', gap: '2rem', zIndex: 1 }}>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginTop: '1.5rem',
                                        position: 'relative',
                                        zIndex: 2,
                                        marginLeft: '-2rem',
                                        marginRight: '-1.5rem'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#fff',
                                            border: `3px solid ${getActorColor(item.actor)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            color: getActorColor(item.actor),
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            {item.step}
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: 1,
                                        backgroundColor: '#ffffff',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                                        border: '1px solid #f1f5f9',
                                        borderLeft: `4px solid ${getActorColor(item.actor)}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{item.title}</h3>
                                                    <span style={{
                                                        backgroundColor: getActorBg(item.actor),
                                                        color: getActorColor(item.actor),
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {item.actor}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>{item.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                            <ul style={{ margin: 0, paddingLeft: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: item.images ? '1.5rem' : 0 }}>
                                                {item.actions.map((action, i) => (
                                                    <li key={i} style={{ color: '#334155', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                        <span style={{ color: getActorColor(item.actor), fontWeight: 800, marginTop: '2px' }}>✓</span>
                                                        <span style={{ lineHeight: 1.5 }}>{action.replace(/^[0-9]\. /, '')}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {item.images && item.images.length > 0 && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem 0.5rem 0 0', borderBottom: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                                        {item.actor === '고객' ? '📱 모바일 화면 예시' : '🖥️ 시스템 화면 예시'}
                                                    </div>
                                                    
                                                    {item.images.length === 1 ? (
                                                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0 0 0.5rem 0.5rem', overflow: 'hidden' }}>
                                                            <img 
                                                                src={item.images[0]} 
                                                                alt={`Step ${item.step} Screenshot`}
                                                                style={{ width: '100%', display: 'block' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="horizontal-scroll" style={{ 
                                                            display: 'flex', 
                                                            gap: '1rem', 
                                                            overflowX: 'auto', 
                                                            padding: '1rem',
                                                            background: '#fff',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '0 0 0.5rem 0.5rem'
                                                        }}>
                                                            {item.images.map((imgUrl, imgIdx) => (
                                                                <div key={imgIdx} style={{ 
                                                                    flex: '0 0 100%', // Mobile default
                                                                    minWidth: '200px',
                                                                    border: '1px solid #f1f5f9',
                                                                    borderRadius: '0.5rem',
                                                                    overflow: 'hidden'
                                                                }} className="carousel-item">
                                                                    <img 
                                                                        src={imgUrl} 
                                                                        alt={`Step ${item.step} Image ${imgIdx + 1}`}
                                                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '4rem' }}></div>
                </div>
            </main>

            <style jsx>{`
                .horizontal-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 #f8fafc;
                }
                .horizontal-scroll::-webkit-scrollbar {
                    height: 6px;
                }
                .horizontal-scroll::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .horizontal-scroll::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 6px;
                }
                
                /* PC View: 3 items */
                @media (min-width: 1024px) {
                    .carousel-item {
                        flex: 0 0 calc((100% - 2rem) / 3) !important;
                    }
                }
            `}</style>
        </div>
    );
}
