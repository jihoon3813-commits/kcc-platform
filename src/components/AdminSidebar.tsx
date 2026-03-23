'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
    { name: '대시보드', path: '/admin', icon: '📊' },
    { name: '파트너 관리', path: '/admin/partners', icon: '🤝' },
    { name: '전체 고객 관리', path: '/admin/customers', icon: '👤' },
    { name: '파트너 매뉴얼', path: '/dashboard/manual', icon: '📖' },
    { name: '정산 관리', path: '/admin/settlement', icon: '💰' },
    { name: '설정', path: '/admin/settings/sms', icon: '⚙️' },
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
                backgroundColor: '#ffffff',
                color: '#1e293b',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e2e8f0',
                zIndex: 100
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                    <Link href="/admin">
                        <img
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                            alt="KCC Logo"
                            style={{ height: '24px', marginBottom: '1rem', cursor: 'pointer' }}
                        />
                    </Link>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0046AD' }}>ADMIN CONTROL</div>
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
                                            color: isActive ? '#0046AD' : '#64748b',
                                            backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 700 : 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '0 1rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <Link
                        href="/"
                        target="_blank"
                        className="sidebar-shortcut-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.625rem',
                            textDecoration: 'none',
                            color: '#475569',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>🌐</span>
                        <span style={{ lineHeight: 1.2 }}>파트너를 위한<br />구독솔루션 안내</span>
                    </Link>
                    <Link
                        href="/guide"
                        target="_blank"
                        className="sidebar-shortcut-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.625rem',
                            textDecoration: 'none',
                            color: '#475569',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>📖</span>
                        <span style={{ lineHeight: 1.2 }}>고객님을 위한<br />구독솔루션 안내</span>
                    </Link>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#0046AD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                            AD
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{adminName || '관리자'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Super Admin</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fee2e2',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
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
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e2e8f0',
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
                                color: isActive ? '#0046AD' : '#64748b',
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
                    .admin-sidebar-desktop, .admin-bottom-nav {
                        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                    }
                }
                .sidebar-shortcut-link:hover {
                    background-color: #f1f5f9 !important;
                    border-color: #cbd5e1 !important;
                    color: #0046AD !important;
                }
            `}</style>
        </>
    );
}
