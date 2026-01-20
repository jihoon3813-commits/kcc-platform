'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const partnerInfo = localStorage.getItem('kcc_partner');
        if (!partnerInfo) {
            router.replace('/login');
        } else {
            setAuthorized(true);
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

    return <>{children}</>;
}
