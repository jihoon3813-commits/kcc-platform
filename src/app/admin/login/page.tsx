'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'adminLogin',
                    id: id,
                    password: password
                })
            });

            const data = await response.json();

            if (data.result === 'success') {
                localStorage.setItem('kcc_admin', JSON.stringify(data.admin));
                router.push('/admin');
            } else {
                alert(data.message || '로그인 정보를 확인해주세요.');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            alert('로그인 처리 중 오류가 발생했습니다.');
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
            background: '#0f172a',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                        alt="KCC Logo"
                        style={{ height: '35px', marginBottom: '1rem' }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Control Tower</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>관리자 전용 대시보드 로그인</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>ADMIN ID</label>
                        <input
                            type="text"
                            required
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="아이디를 입력하세요"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>PASSWORD</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', outline: 'none' }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: '#1e293b',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? '인증 중...' : '어드민 접속'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    &copy; 2026 KCC Windows. Admin Panel.
                </p>
            </div>
        </div>
    );
}
