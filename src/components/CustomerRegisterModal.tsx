'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DaumPostcode = dynamic(() => import('react-daum-postcode'), { ssr: false }) as any;

interface CustomerRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CustomerRegisterModal({ isOpen, onClose, onSuccess }: CustomerRegisterModalProps) {
    const initialFormState = {
        customerName: '',
        phone: '',
        birthDate: '',
        address: '',
        detailAddress: '',
        ownershipType: '본인소유',
        amount: '',
        downPayment: '0',
        months: '60',
        transferDate: '15',
        constructionDate: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [showPostcode, setShowPostcode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    // Derived values for calculation
    const rawTotal = parseInt(formData.amount.replace(/[^0-9]/g, '') || '0');
    const rawDown = parseInt(formData.downPayment.replace(/[^0-9]/g, '') || '0');
    const remainingAmount = rawTotal - rawDown;
    const months = parseInt(formData.months);

    // Interest Rates based on duration
    const interestRates: { [key: number]: number } = {
        24: 0.167,
        36: 0.176,
        48: 0.205,
        60: 0.240
    };

    const interestRate = interestRates[months] || 0;
    // Formula: monthlyFee * months * (1 - interestRate) = remainingAmount
    // monthlyFee = remainingAmount / (months * (1 - interestRate))
    const rawMonthlyFee = months > 0 
        ? Math.floor(remainingAmount / (months * (1 - interestRate))) 
        : 0;

    // Truncate below 100 units
    const monthlyFee = Math.floor(rawMonthlyFee / 100) * 100;

    const formatPhone = (val: string) => {
        val = val.replace(/[^0-9]/g, '').slice(0, 11);
        if (val.length <= 3) return val;
        if (val.length <= 7) return `${val.slice(0, 3)}-${val.slice(3)}`;
        return `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
    };

    const formatBirth = (val: string) => {
        val = val.replace(/[^0-9]/g, '').slice(0, 7);
        if (val.length <= 6) return val;
        return `${val.slice(0, 6)}-${val.slice(6, 7)}`;
    };

    const formatAmount = (val: string) => {
        const num = val.replace(/[^0-9]/g, '');
        if (!num) return '0';
        return parseInt(num).toLocaleString();
    };

    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setFormData({ ...formData, address: fullAddress });
        setShowPostcode(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const adminData = localStorage.getItem('kcc_admin');
            const partnerData = localStorage.getItem('kcc_partner');
            
            let creator = { name: '관리자', id: 'admin' };
            let type = 'customers';

            // Priority: Check partner first to match dashboard list logic
            if (partnerData) {
                const partner = JSON.parse(partnerData);
                creator = partner;
                if (String(partner.id).toLowerCase() === 'guest_demo') {
                    type = 'guest_customers';
                }
            } else if (adminData) {
                const admin = JSON.parse(adminData);
                creator = admin;
                type = 'customers';
            }

            const bodyData = {
                action: 'create',
                type: type,
                customerName: String(formData.customerName || ""),
                phone: String(formData.phone || ""),
                birthDate: String(formData.birthDate || ""),
                address: `${formData.address} ${formData.detailAddress}`.trim(),
                ownershipType: String(formData.ownershipType || "본인소유"),
                amount: String(formData.amount || "0").replace(/,/g, ''),
                downPayment: String(formData.downPayment || "0").replace(/,/g, ''),
                months: String(formData.months || "60"),
                transferDate: String(formData.transferDate || "15"),
                partnerName: String(creator.name || "관리자"),
                partnerId: String(creator.id || "admin"),
                constructionDate: String(formData.constructionDate || ""),
            };

            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const result = await response.json();

            if (response.ok && result.result === 'success') {
                alert(`고객 등록이 완료되었습니다.\n고객님께 안내 문자(URL)가 발송되었습니다.`);
                setFormData(initialFormState);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const errorMsg = result.message || '알 수 없는 오류가 발생했습니다.';
                alert(`등록에 실패했습니다: ${errorMsg}`);
            }
        } catch (error) {
            console.error(error);
            alert('데이터 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>신규 고객 등록</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {/* section 1: 고객정보 */}
                    <div className="section-title">
                        <span className="dot"></span>
                        고객 정보
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>고객명</label>
                            <input
                                required
                                type="text"
                                placeholder="성함을 입력하세요"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>핸드폰 번호</label>
                            <input
                                required
                                type="tel"
                                inputMode="numeric"
                                placeholder="010-0000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>생년월일 + 성별 (7자리)</label>
                            <input
                                required
                                type="tel"
                                inputMode="numeric"
                                placeholder="예: 811115-1"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: formatBirth(e.target.value) })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>주택 소유 구분</label>
                            <select
                                value={formData.ownershipType}
                                onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                            >
                                <option value="본인소유">본인소유</option>
                                <option value="가족소유">가족소유</option>
                                <option value="이사예정">이사예정</option>
                            </select>
                        </div>

                    </div>

                    <div className="form-group full-width">
                        <label>주소 (시공장소)</label>
                        <div className="address-container">
                            <div className="address-row">
                                <input
                                    readOnly
                                    required
                                    type="text"
                                    placeholder="주소 검색을 이용하세요"
                                    value={formData.address}
                                    onClick={() => setShowPostcode(true)}
                                />
                                <button type="button" className="btn-secondary" onClick={() => setShowPostcode(true)}>주소 검색</button>
                            </div>
                            <input
                                type="text"
                                placeholder="상세주소를 입력하세요"
                                value={formData.detailAddress}
                                onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                                style={{ marginTop: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem', padding: '1.25rem', background: '#f0f9ff', borderRadius: '1rem', border: '1px solid #bae6fd' }}>
                            <label style={{ color: '#0369a1', fontWeight: 900 }}>📅 시공 예정일</label>
                            <input
                                type="date"
                                value={formData.constructionDate}
                                onChange={(e) => setFormData({ ...formData, constructionDate: e.target.value })}
                                style={{ background: 'white', borderColor: '#38bdf8' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#0ea5e9', marginTop: '0.5rem', fontWeight: 700 }}>시공 일정이 확정된 경우 날짜를 선택해 주세요.</p>
                        </div>
                    </div>

                    {/* section 2: 견적/구독 정보 */}
                    <div className="subscription-info-area">
                        <div className="section-title">
                            <span className="dot blue"></span>
                            견적 / 구독 정보
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>최종 견적금액 (일시불 기준)</label>
                                <div className="unit-input">
                                    <input
                                        required
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: formatAmount(e.target.value) })}
                                    />
                                    <span className="unit">원</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>선결제 금액</label>
                                <div className="unit-input">
                                    <input
                                        required
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={formData.downPayment}
                                        onChange={(e) => setFormData({ ...formData, downPayment: formatAmount(e.target.value) })}
                                    />
                                    <span className="unit">원</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>잔여 결제금액 (자동 산정)</label>
                                <div className="unit-input readonly">
                                    <input
                                        readOnly
                                        type="text"
                                        value={remainingAmount.toLocaleString()}
                                    />
                                    <span className="unit">원</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>잔금 기준 월 구독료</label>
                                <div className="unit-input readonly highlighted">
                                    <input
                                        readOnly
                                        type="text"
                                        value={monthlyFee.toLocaleString()}
                                    />
                                    <span className="unit">원</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>개월 선택</label>
                                <select
                                    value={formData.months}
                                    onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                                >
                                    <option value="24">24개월</option>
                                    <option value="36">36개월</option>
                                    <option value="48">48개월</option>
                                    <option value="60">60개월</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>자동이체 희망일</label>
                                <select
                                    value={formData.transferDate}
                                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                >
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}일</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="submit-container">
                        <button
                            type="submit"
                            className="btn-primary submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '처리 중...' : '고객정보 입력 및 문자발송'}
                        </button>
                    </div>
                </form>

                {showPostcode && (
                    <div className="postcode-overlay">
                        <div className="postcode-content">
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: 600 }}>주소 검색</span>
                                <button onClick={() => setShowPostcode(false)}>&times;</button>
                            </div>
                            <DaumPostcode onComplete={handleComplete} style={{ height: '400px' }} />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .modal-content {
                    background: white;
                    padding: 3rem;
                    border-radius: 2.5rem;
                    width: 95%;
                    max-width: 750px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
                    position: relative;
                    /* Hide scrollbar */
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .modal-content::-webkit-scrollbar {
                    display: none;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }
                .modal-header h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.05em;
                }
                .close-btn {
                    font-size: 2.5rem;
                    color: #cbd5e1;
                    cursor: pointer;
                    line-height: 1;
                    background: none;
                    border: none;
                    transition: color 0.2s;
                }
                .close-btn:hover {
                    color: #64748b;
                }
                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .dot {
                    width: 12px;
                    height: 12px;
                    background: #94a3b8;
                    border-radius: 50%;
                }
                .dot.blue {
                    background: #2563eb;
                    box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 640px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #475569;
                    letter-spacing: -0.01em;
                }
                input, select {
                    height: 52px;
                    padding: 0 1.25rem;
                    border-radius: 1rem;
                    border: 1px solid #e2e8f0;
                    font-size: 1rem;
                    width: 100%;
                    background: #f8fafc;
                    font-weight: 400;
                    color: #0f172a;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: inherit;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #2563eb;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }
                .subscription-info-area {
                    background: #f1f5f9;
                    padding: 2.5rem;
                    border-radius: 2rem;
                    border: 1px solid #e2e8f0;
                    margin: 0 -0.5rem;
                }
                .unit-input {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .unit-input .unit {
                    position: absolute;
                    right: 1.25rem;
                    font-weight: 400;
                    color: #94a3b8;
                    font-size: 0.9rem;
                }
                .unit-input.readonly input {
                    background: #e2e8f0;
                    border-color: #cbd5e1;
                    color: #475569;
                    cursor: default;
                }
                .unit-input.highlighted input {
                    background: #ebf2ff;
                    border-color: #bfdbfe;
                    color: #2563eb;
                    font-weight: 700;
                    font-size: 1.2rem;
                }
                .address-row {
                    display: flex;
                    gap: 0.75rem;
                }
                .address-row input {
                    flex: 1;
                }
                .btn-secondary {
                    background: white;
                    color: #0f172a;
                    height: 52px;
                    padding: 0 1.5rem;
                    border-radius: 1rem;
                    font-weight: 800;
                    border: 1px solid #e2e8f0;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .submit-container {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    margin-top: 1rem;
                }
                .submit-btn {
                    height: 64px;
                    font-size: 1.15rem;
                    font-weight: 900;
                    border-radius: 1.25rem;
                    width: 100%;
                    background: #2563eb;
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.4);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    letter-spacing: -0.02em;
                    text-align: center;
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    background: #1d4ed8;
                    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.5);
                }
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #64748b;
                    box-shadow: none;
                }
                .postcode-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1001;
                    backdrop-filter: blur(5px);
                }
                .postcode-content {
                    background: white;
                    width: 500px;
                    border-radius: 2rem;
                    overflow: hidden;
                    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5);
                }
            `}</style>
        </div>
    );
}
