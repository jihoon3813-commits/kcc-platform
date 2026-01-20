import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
            <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                            alt="KCC Logo"
                            style={{ height: '32px', objectFit: 'contain' }}
                        />
                    </Link>
                    <nav className="desktop-only" style={{ display: 'flex', gap: '2.5rem' }}>
                        <Link href="#features" style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937' }}>서비스 특장점</Link>
                        <Link href="#calculator" style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937' }}>시뮬레이터</Link>
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
                            style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3b82f6' }}
                        >
                            파트너 센터 체험하기 (Guest)
                        </a>
                    </nav>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link
                        href="/login"
                        target="_blank"
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem', fontSize: '0.9rem' }}
                    >
                        파트너 센터
                    </Link>
                </div>
            </div>
        </header>
    );
}
