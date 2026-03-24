'use client';

import { useState } from 'react';

interface PasswordModalProps {
    partnerId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function PasswordModal({ partnerId, onClose, onSuccess }: PasswordModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않거나 입력되지 않았습니다.');
            return;
        }
        setSaving(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'changePassword',
                    id: partnerId,
                    newPassword
                })
            });
            if (response.ok) {
                alert('비밀번호가 변경되었습니다.');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert('비밀번호 변경에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('비밀번호 변경에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>비밀번호 변경</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>새 비밀번호</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            autoComplete="new-password"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} 
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>비밀번호 확인</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            autoComplete="new-password"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} 
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: 'white' }} onClick={onClose}>취소</button>
                    <button style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                        {saving ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </div>
        </div>
    );
}
