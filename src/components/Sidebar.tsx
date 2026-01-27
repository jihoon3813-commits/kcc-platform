'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const menuItems = [
        { name: '대시보드', icon: '🏠', href: '/dashboard' },
        { name: '구독신청', icon: '📝', href: '/dashboard/apply' },
        { name: '고객관리', icon: '👥', href: '/dashboard/list' },
        { name: '구독료 계산기', icon: '🧮', href: '/dashboard/calculator' },
        { name: '정산관리', icon: '💰', href: '/dashboard/settlement' },
        { name: '파트너', icon: '👤', href: '/dashboard/profile' },
    ];

    const [partner, setPartner] = useState<{ name: string; region: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('kcc_partner');
        if (stored) {
            try {
                setPartner(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse partner data', e);
            }
        }
    }, []);

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('kcc_partner');
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar-desktop desktop-only">
                <div style={{ marginBottom: '3rem' }}>
                    <Link href="/dashboard">
                        <img
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"
                            alt="KCC Logo"
                            style={{ height: '32px', objectFit: 'contain', cursor: 'pointer' }}
                        />
                    </Link>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    color: isActive ? 'var(--primary)' : 'var(--muted)',
                                    background: isActive ? 'var(--muted-light)' : 'transparent',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            👤
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{partner?.name || '대신인테리어'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{partner?.region || 'Premium Partner'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--muted-light)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                    >
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav mobile-only">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}

