import Link from 'next/link';

export default function TreeMap() {
    const list = [
        {
            category: "공통 / 메인",
            items: [
                { name: "메인 홈페이지", path: "/", desc: "고객/파트너 유입 메인 랜딩" },
                { name: "사이트맵 (현재 페이지)", path: "/sitemap", desc: "전체 페이지 바로가기 모음" }
            ]
        },
        {
            category: "관리자 (Admin)",
            items: [
                { name: "관리자 메인", path: "/admin", desc: "전체 현황 및 관리 (PC 최적화)" },
            ]
        },
        {
            category: "파트너사 (Dashboard)",
            items: [
                { name: "파트너 대시보드 홈", path: "/dashboard", desc: "파트너사 현황판" },
                { name: "신규 구독 신청", path: "/dashboard/apply", desc: "파트너가 고객 대신 접수" },
            ]
        },
        {
            category: "고객 (Customer)",
            items: [
                { name: "고객 신청서 (예시)", path: "/apply/sample-customer-1", desc: "고객에게 전달된 신청 링크 (모바일 최적화)" },
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#333' }}>
                    🚩 KCC Platform 전체 페이지
                </h1>
                <p style={{ color: '#666', marginBottom: '3rem' }}>
                    개발 및 테스트를 위한 전체 페이지 바로가기 목록입니다.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {list.map((group, idx) => (
                        <section key={idx}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#1a1a1a',
                                paddingBottom: '1rem',
                                borderBottom: '2px solid #333',
                                marginBottom: '1.5rem'
                            }}>
                                {group.category}
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        style={{
                                            display: 'block',
                                            background: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            border: '1px solid #eee',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        className="hover-card"
                                    >
                                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary, #004481)', marginBottom: '0.5rem' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1rem' }}>
                                            {item.path}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#444' }}>
                                            {item.desc}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
