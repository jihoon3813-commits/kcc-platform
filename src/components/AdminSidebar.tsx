'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
    { name: '대시보드', path: '/admin', icon: '📊' },
    { name: '파트너 관리', path: '/admin/partners', icon: '🤝' },
    { name: '전체 고객 관리', path: '/admin/customers', icon: '👤' },
    { name: '정산 관리', path: '/admin/settlement', icon: '💰' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [adminName, setAdminName] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('kcc_admin');
        if (stored) {
            setAdminName(JSON.parse(stored).name);
        } else {
            // router.push('/admin/login'); // Uncomment after testing
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('kcc_admin');
        router.push('/admin/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Close menu when navigating
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="admin-sidebar-desktop" style={{
                width: '260px',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #1e293b',
                zIndex: 100
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #1e293b' }}>
                    <Link href="/admin">
                        <img
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"
                            alt="KCC Logo"
                            style={{ height: '24px', marginBottom: '1rem', cursor: 'pointer' }}
                        />
                    </Link>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>ADMIN CONTROL</div>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.875rem 1.25rem',
                                            borderRadius: '0.75rem',
                                            textDecoration: 'none',
                                            color: isActive ? '#fff' : '#94a3b8',
                                            backgroundColor: isActive ? '#1e293b' : 'transparent',
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 700 : 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                            AD
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{adminName || '관리자'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Super Admin</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #1e293b',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="admin-bottom-nav" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70px',
                backgroundColor: '#0f172a',
                borderTop: '1px solid #1e293b',
                display: 'none',
                gridTemplateColumns: `repeat(${menuItems.length}, 1fr)`,
                zIndex: 1000,
                padding: '0 0.5rem'
            }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem',
                                textDecoration: 'none',
                                color: isActive ? '#38bdf8' : '#94a3b8',
                                fontSize: '0.7rem',
                                fontWeight: isActive ? 700 : 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .admin-sidebar-desktop {
                        display: none !important;
                    }
                    .admin-bottom-nav {
                        display: grid !important;
                    }
                }
            `}</style>
        </>
    );
}
