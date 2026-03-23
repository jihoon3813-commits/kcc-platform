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
            background: '#f8fafc',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '430px',
                background: 'white',
                padding: '3rem 2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img
                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                        alt="KCC Logo"
                        style={{ height: '35px', marginBottom: '1.25rem' }}
                    />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.025em' }}>Control Tower</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 600 }}>관리자 전용 대시보드 로그인</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>ADMIN ID</label>
                        <input
                            type="text"
                            required
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                borderRadius: '0.75rem', 
                                border: '1px solid #e2e8f0', 
                                background: '#f8fafc',
                                color: '#111827',
                                fontSize: '1rem',
                                outline: 'none', 
                                transition: 'all 0.2s',
                                boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
                            }}
                            placeholder="아이디를 입력하세요"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>PASSWORD</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                borderRadius: '0.75rem', 
                                border: '1px solid #e2e8f0', 
                                background: '#f8fafc',
                                color: '#111827',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
                            }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1.125rem',
                            borderRadius: '0.75rem',
                            background: '#0046AD',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '0.75rem',
                            border: 'none',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 10px 15px -3px rgba(0, 70, 173, 0.25)'
                        }}
                    >
                        {loading ? '인증 중...' : '어드민 접속'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    &copy; 2026 KCC Windows. Admin Panel.
                </p>
            </div>
        </div>
    );
}
