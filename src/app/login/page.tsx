'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [autoLogging, setAutoLogging] = useState(false);
    const router = useRouter();

    const handleAutoLogin = async (id: string) => {
        setAutoLogging(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'adminLoginAsPartner',
                    id: id
                })
            });
            const data = await response.json();
            if (data.result === 'success') {
                localStorage.setItem('kcc_partner', JSON.stringify(data.partner));
                router.push('/dashboard/list');
            } else {
                setError(data.message || '로그인 정보가 올바르지 않습니다.');
            }
        } catch (err) {
            console.error(err);
            setError('서버 연결에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setAutoLogging(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const auto = params.get('auto');
        if (id && auto === 'true') {
            handleAutoLogin(id);
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    id: userId,
                    password: password
                })
            });

            const data = await response.json();

            if (data.result === 'success') {
                // Save partner info to localStorage
                localStorage.setItem('kcc_partner', JSON.stringify(data.partner));
                
                // Check if password change is required
                if (password === '1111') {
                    localStorage.setItem('kcc_require_password_change', 'true');
                }
                
                router.push('/dashboard/list');
            } else {
                setError(data.message || '로그인 정보가 올바르지 않습니다.');
            }
        } catch (err) {
            console.error(err);
            setError('서버 연결에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <img
                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                        alt="KCC Logo"
                        style={{ height: '40px', marginBottom: '1.5rem' }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>파트너 전용 시스템</h1>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>관리자 계정으로 로그인해 주세요.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>아이디(핸드폰번호)</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="아이디를 입력하세요"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>비밀번호(최초 1111)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontSize: '0.875rem', color: '#ef4444', textAlign: 'center' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '0.75rem',
                            background: 'var(--primary)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '0.5rem',
                            transition: 'transform 0.1s'
                        }}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>또는</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.setItem('kcc_partner', JSON.stringify({
                                id: 'guest_demo',
                                name: '체험용 파트너',
                                owner: '홍길동',
                                phone: '010-1234-5678',
                                region: '전국'
                            }));
                            router.push('/dashboard/list');
                        }}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '0.75rem',
                            background: 'white',
                            color: '#475569',
                            fontSize: '1rem',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>🚀 파트너스 체험하기 (Guest)</span>
                    </button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        계정 정보 분실 시 본사 관리자에게 문의하세요.
                    </p>
                </div>
            </div>
            {autoLogging && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#0046AD',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontWeight: 800, color: '#1e293b' }}>권한 확인 중...</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>본사 관리자 권한으로 파트너 어드민에 접속합니다.</p>
                </div>
            )}
            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
