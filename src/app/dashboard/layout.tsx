'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordModal from '@/components/PasswordModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [partnerId, setPartnerId] = useState('');

    useEffect(() => {
        const partnerInfo = localStorage.getItem('kcc_partner');
        if (!partnerInfo) {
            router.replace('/login');
        } else {
            const partner = JSON.parse(partnerInfo);
            setPartnerId(partner.id);
            setAuthorized(true);

            // Check if password change is required
            const requireChange = localStorage.getItem('kcc_require_password_change');
            if (requireChange === 'true') {
                localStorage.removeItem('kcc_require_password_change');
                alert('비밀번호를 변경해주세요.');
                setShowPasswordModal(true);
            }
        }
    }, [router]);

    if (!authorized) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc'
            }}>
                <div className="loader">잠시만 기다려 주세요...</div>
                <style jsx>{`
                    .loader {
                        color: #64748b;
                        font-family: sans-serif;
                        font-weight: 600;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            {children}
            {showPasswordModal && (
                <PasswordModal
                    partnerId={partnerId}
                    onClose={() => setShowPasswordModal(false)}
                    onSuccess={() => setShowPasswordModal(false)}
                />
            )}
        </>
    );
}
