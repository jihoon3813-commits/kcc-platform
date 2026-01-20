'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useRouter } from 'next/navigation';

export default function Apply() {
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        birthDate: '',
        address: '',
        addressDetail: '',
        amount: '',
        months: '60',
        transferDate: '5'
    });

    const [linkGenerated, setLinkGenerated] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 주소 결합 및 금액 콤마 제거 후 전송
            const partnerInfo = JSON.parse(localStorage.getItem('kcc_partner') || '{}');
            const partnerName = partnerInfo.name || '대신인테리어';
            const partnerId = partnerInfo.id || '';

            const submissionData = {
                action: 'create',
                ...formData,
                address: `${formData.address} ${formData.addressDetail}`.trim(),
                amount: formData.amount.replace(/,/g, ''),
                partnerName: partnerName,
                partnerId: partnerId
            };

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                throw new Error('Server response was not ok');
            }

            setLinkGenerated(true);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('데이터 저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setSubmitting(false);
        }
    };

    // 휴대폰 번호 자동 하이픈 (010-0000-0000)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let formatted = value;
        if (value.length > 3 && value.length <= 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
        }
        setFormData({ ...formData, phone: formatted });
    };

    // 생년월일 자동 하이픈 (81-11-15)
    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let formatted = value;
        if (value.length > 2 && value.length <= 4) {
            formatted = `${value.slice(0, 2)}-${value.slice(2)}`;
        } else if (value.length > 4) {
            formatted = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
        }
        setFormData({ ...formData, birthDate: formatted });
    };

    // 금액 자동 콤마
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            setFormData({ ...formData, amount: Number(value).toLocaleString() });
        } else {
            setFormData({ ...formData, amount: '' });
        }
    };

    // 주소 검색 완료 핸들러
    const handleAddressComplete = (data: { address: string; addressType: string; bname: string; buildingName: string }) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setFormData({ ...formData, address: fullAddress });
        setIsAddressOpen(false);
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-main">
                <header className="mobile-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>신규 구독 신청</h1>
                        <p style={{ color: 'var(--muted)' }}>고객에게 보낼 구독 신청 링크를 생성합니다.</p>
                    </div>
                </header>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {!linkGenerated ? (
                        <form onSubmit={handleSubmit} className="card">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>고객 성함</label>
                                    <input
                                        type="text"
                                        placeholder="홍길동"
                                        required
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>휴대폰 번호</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={13}
                                        placeholder="010-0000-0000"
                                        required
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>생년월일 (6자리 숫자 입력)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        placeholder="예: 811115"
                                        required
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={formData.birthDate}
                                        onChange={handleBirthDateChange}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>주소 (시공 장소)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="기본 주소"
                                            readOnly
                                            required
                                            style={{ flex: 1, padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: '#f3f4f6' }}
                                            value={formData.address}
                                            onClick={() => setIsAddressOpen(true)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsAddressOpen(true)}
                                            style={{ padding: '0 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', fontWeight: 600 }}
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="상세 주소 입력"
                                        required
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={formData.addressDetail}
                                        onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>최종 견적금액(구독원금)</label>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="0"
                                            required
                                            style={{
                                                flex: 1,
                                                padding: '0.875rem',
                                                borderRadius: '0.5rem 0 0 0.5rem',
                                                border: '1px solid var(--border)',
                                                borderRight: 'none'
                                            }}
                                            value={formData.amount}
                                            onChange={handleAmountChange}
                                        />
                                        <div style={{
                                            padding: '0.875rem 1rem',
                                            background: 'var(--muted-light)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0 0.5rem 0.5rem 0',
                                            fontWeight: 600,
                                            color: '#555',
                                            fontSize: '0.875rem'
                                        }}>
                                            원
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>실제 정산받는 금액입니다.</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>구독 기간</label>
                                        <select
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                                            value={formData.months}
                                            onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                                        >
                                            <option value="12">12개월</option>
                                            <option value="24">24개월</option>
                                            <option value="36">36개월</option>
                                            <option value="48">48개월</option>
                                            <option value="60">60개월</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>자동이체 희망일</label>
                                        <select
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                                            value={formData.transferDate}
                                            onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                        >
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                                <option key={day} value={day}>매월 {day}일</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        marginTop: '1rem',
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        opacity: submitting ? 0.7 : 1,
                                        cursor: submitting ? 'not-allowed' : 'pointer'
                                    }}
                                    disabled={submitting}
                                >
                                    {submitting ? '데이터 등록 중...' : '기본 정보 등록 및 신용조회 발송'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="card animate-fade-in" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ marginBottom: '1rem' }}>링크 생성 완료!</h3>
                            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>아래 링크를 고객님께 카카오톡이나 문자로 전송해 주세요.</p>

                            <div style={{ background: 'var(--muted-light)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '2rem', wordBreak: 'break-all', color: 'var(--primary)', fontWeight: 600 }}>
                                https://m.hankookcapital.co.kr/ib20/mnu/HKMUCR010101
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={() => {
                                        navigator.clipboard.writeText('https://m.hankookcapital.co.kr/ib20/mnu/HKMUCR010101');
                                        alert('신용조회 링크가 복사되었습니다.');
                                    }}
                                >
                                    링크 복사하기
                                </button>
                                <button
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'white' }}
                                    onClick={() => router.push('/dashboard')}
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Address Modal */}
            {isAddressOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        width: '500px',
                        maxWidth: '90%',
                        position: 'relative'
                    }}>
                        <button
                            type="button"
                            onClick={() => setIsAddressOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                fontSize: '1.5rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            &times;
                        </button>
                        <DaumPostcodeEmbed onComplete={handleAddressComplete} style={{ height: '400px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
