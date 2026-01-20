'use client';

import { useState } from 'react';

interface PartnerRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PartnerRegisterModal({ isOpen, onClose }: PartnerRegisterModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        owner: '',
        phone: '',
        region: '서울/경기'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const regions = [
        '서울/경기',
        '경기/인천',
        '충청/전라',
        '대구/경북',
        '부산/울산/경남',
        '강원',
        '전국'
    ];

    const formatPhoneNumber = (value: string) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 8) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        }
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Generate a temporary ID for the request
            const tempId = `req_${Date.now().toString().slice(-6)}`;

            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createPartner', // Changed to known working action
                    id: tempId,
                    password: 'N/A', // Default value
                    ...formData,
                    email: '',
                    address: '',
                    bizNum: '',
                    account: '',
                    origin: 'request',
                    joinDate: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                alert('신청이 완료되었습니다. 담당 부서에서 확인 후 연락 드리겠습니다.');
                onClose();
                setFormData({
                    name: '',
                    owner: '',
                    phone: '',
                    region: '서울/경기'
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Submission failed');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            alert(`신청 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>무료 파트너 가입 신청</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem', opacity: 0.5 }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>파트너사명</label>
                        <input
                            required
                            type="text"
                            placeholder="회사명을 입력하세요"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>대표명</label>
                        <input
                            required
                            type="text"
                            placeholder="대표자 성함을 입력하세요"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>연락처</label>
                        <input
                            required
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9-]*"
                            placeholder="010-0000-0000"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>시공지역</label>
                        <select
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: 'white' }}
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        >
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        ※파트너 신청 시 담당부서에서 확인 후 연락 드립니다.
                    </p>

                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            justifyContent: 'center',
                            marginTop: '1rem',
                            borderRadius: '0.5rem',
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            background: isSubmitting ? '#94a3b8' : undefined
                        }}
                    >
                        {isSubmitting ? '신청 중...' : '신청하기'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    width: 90%;
                    max-width: 450px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
