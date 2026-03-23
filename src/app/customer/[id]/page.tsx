'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerEntryPage({ params }: { params: any }) {
    // Support both Promise (Next.js 15+) and plain object (Next.js 14 or hybrid)
    const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params;
    const id = unwrappedParams?.id;
    
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isClient, setIsClient] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthDate: '',
        address: '',
        amount: '',
        months: '60',
        transferDate: '15',
        ownershipType: '본인소유'
    });

    const [documents, setDocuments] = useState<Record<string, { url: string; uploadedAt: string }>>({});
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const formatAmount = (val: string) => {
        const num = val.replace(/[^0-9]/g, '');
        if (!num) return '';
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        setIsClient(true);
        console.log("Customer component mounted, isClient set to true");
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        const fetchCustomer = async () => {
            console.log(`Starting fetch for customer ID: ${id}`);
            setLoading(true);
            try {
                const url = `/api/proxy?type=customers&id=${id}`;
                console.log(`Fetching from: ${url}`);
                const res = await fetch(url);
                if (!res.ok) {
                    console.error(`Fetch failed with status: ${res.status}`);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                console.log("Received data:", data);
                
                if (Array.isArray(data) && data.length > 0) {
                    const c = data[0];
                    setCustomer(c);
                    setFormData({
                        name: c.name || '',
                        phone: c.phone || '',
                        birthDate: c.birthDate || '',
                        address: c.address || '',
                        amount: formatAmount(c.amount || ''),
                        months: c.months || '60',
                        transferDate: c.transferDate || '15',
                        ownershipType: c.ownershipType || '본인소유'
                    });
                    setDocuments(c.documents || {});
                } else {
                    console.warn("No customer data found for ID:", id);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                showToast('데이터 로딩 중 오류가 발생했습니다.', 'error');
            } finally {
                console.log("Fetch cycle completed, setting loading to false");
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id, isClient]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const res = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'upload',
                        base64,
                        mimeType: file.type
                    })
                });
                const result = await res.json();
                if (result.result === 'success') {
                    const newDocs = {
                        ...documents,
                        [fieldName]: {
                            url: result.url,
                            uploadedAt: new Date().toISOString()
                        }
                    };
                    setDocuments(newDocs);
                    showToast(`${labelMap[fieldName] || fieldName} 등록 완료`);
                    // Auto save after setting state
                    await handleSave(newDocs);
                } else {
                    showToast('업로드에 실패했습니다.', 'error');
                }
            };
        } catch (err) {
            console.error(err);
            showToast('파일 처리 중 오류가 발생했습니다.', 'error');
        } finally {
            setUploadingField(null);
        }
    };

    const labelMap: Record<string, string> = {
        '신분증사본': '신분증 사본',
        '계좌사본': '계좌 사본',
        '가족관계증명서': '가족관계 증명서',
        '부동산매매계약서': '부동산 매매 계약서'
    };

    const handleSave = async (overriddenDocs?: any, newStatus?: string) => {
        setIsSaving(true);
        try {
            const body = {
                action: 'update',
                id: id,
                customerName: formData.name,
                phone: formData.phone,
                birthDate: formData.birthDate,
                address: formData.address,
                amount: formData.amount.replace(/,/g, ''),
                months: formData.months,
                transferDate: formData.transferDate,
                ownershipType: formData.ownershipType,
                documents: JSON.stringify(overriddenDocs || documents),
                status: newStatus || customer?.status
            };

            const res = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const responseData = await res.json();

            if (res.ok && responseData.result !== 'error') {
                setLastSavedAt(new Date().toLocaleTimeString());
                if (newStatus) {
                    setCustomer((prev: any) => ({ ...prev, status: newStatus }));
                }
            } else {
                const errorMsg = responseData.message || '저장에 실패했습니다.';
                showToast(errorMsg, 'error');
            }
        } catch (err: any) {
            console.error('Save operation error:', err);
            showToast('네트워크 오류가 발생했습니다.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save on form change with basic debounce
    useEffect(() => {
        if (!isClient || loading || !customer) return;
        
        const timeout = setTimeout(() => {
            // Only auto-save if something meaningfully changed from the original data
            // For now, simpler: user wants every action auto-saved.
            handleSave();
        }, 1000); 
        
        return () => clearTimeout(timeout);
    }, [formData]);

    if (loading) return <div className="loading">데이터 로딩 중...</div>;
    if (!customer) return <div className="error">고객 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="container">
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
            <header className="header">
                <h1>KCC 구독 솔루션</h1>
                <p>고객 정보 확인 및 서류 등록</p>
            </header>

            <main className="card">
                <section className="info-section">
                    <h2 className="section-title">기본 정보 확인 및 수정</h2>
                    <div className="grid">
                        <div className="input-group">
                            <label>고객명</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>핸드폰</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>생년월일</label>
                            <input value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                        </div>
                        <div className="input-group full-width">
                            <label>시공 주소</label>
                            <textarea 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})} 
                                rows={2}
                                style={{
                                    background: '#020617',
                                    border: '1px solid #334155',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: '#f8fafc',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'inherit',
                                    overflowY: 'hidden',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                                className="hide-scrollbar"
                            />
                        </div>
                        <div className="input-group">
                            <label>최종 견적금액</label>
                            <input 
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: formatAmount(e.target.value)})} 
                                placeholder="0"
                            />
                        </div>
                        <div className="input-group">
                            <label>구독 기간</label>
                            <select value={formData.months} onChange={e => setFormData({...formData, months: e.target.value})}>
                                <option value="24">24개월</option>
                                <option value="36">36개월</option>
                                <option value="48">48개월</option>
                                <option value="60">60개월</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>자동이체 희망일</label>
                            <select value={formData.transferDate} onChange={e => setFormData({...formData, transferDate: e.target.value})}>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}일</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>주택 소유 구분</label>
                            <select value={formData.ownershipType} onChange={e => setFormData({...formData, ownershipType: e.target.value})}>
                                <option value="본인소유">본인소유</option>
                                <option value="가족소유">가족소유</option>
                                <option value="이사예정">이사예정</option>
                            </select>
                        </div>
                    </div>
                </section>

                <hr className="divider" />

                <section className="credit-section">
                    <h2 className="section-title">신용조회 동의 하기</h2>
                    <div className="credit-box">
                        <button 
                            className="btn-capital"
                            onClick={() => window.open('https://m.hankookcapital.co.kr/ib20/mnu/HKMUCR010101', '_blank')}
                        >
                            신용조회 동의하러 가기 (한국캐피탈)
                        </button>
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <button 
                                className={`btn-agree ${(['신용동의', '계약완료', '시공자료요청', '녹취완료', '1차정산완료', '최종정산완료'].includes(customer?.status)) ? 'active' : ''}`}
                                onClick={() => {
                                    const currentStatus = customer?.status || '등록완료';
                                    if (currentStatus === '신용동의') {
                                        // Toggle back to 등록완료
                                        handleSave(undefined, '등록완료');
                                    } else if (['등록완료', '', undefined].includes(currentStatus)) {
                                        // Initial agreement
                                        handleSave(undefined, '신용동의');
                                    } else {
                                        // Already past 신용동의 (계약완료 etc.)
                                        showToast('이미 다음 단계로 진행되어 상태를 변경할 수 없습니다.', 'error');
                                    }
                                }}
                            >
                                {(['신용동의', '계약완료', '시공자료요청', '녹취완료', '1차정산완료', '최종정산완료'].includes(customer?.status)) 
                                    ? '✓ 신용조회 동의 완료됨' 
                                    : '신용조회 동의 완료 후 클릭하세요.'}
                            </button>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                                * 한국캐피탈 페이지에서 동의 완료 후 위 버튼을 꼭 체크해 주세요.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="divider" />

                <section className="upload-section">
                    <h2 className="section-title">필수 서류 등록</h2>
                    <div className="upload-grid">
                        <UploadButton 
                            label="신분증 사본" 
                            fieldName="신분증사본" 
                            isUploaded={!!documents['신분증사본']} 
                            onUpload={handleFileUpload} 
                            isUploading={uploadingField === '신분증사본'}
                        />
                        <UploadButton 
                            label="계좌 사본 (자동이체용)" 
                            fieldName="계좌사본" 
                            isUploaded={!!documents['계좌사본']} 
                            onUpload={handleFileUpload} 
                            isUploading={uploadingField === '계좌사본'}
                        />
                        <UploadButton 
                            label="가족관계 증명서" 
                            fieldName="가족관계증명서" 
                            isUploaded={!!documents['가족관계증명서']} 
                            onUpload={handleFileUpload} 
                            isUploading={uploadingField === '가족관계증명서'}
                            disabled={formData.ownershipType !== '가족소유'}
                        />
                        <UploadButton 
                            label="부동산 매매 계약서" 
                            fieldName="부동산매매계약서" 
                            isUploaded={!!documents['부동산매매계약서']} 
                            onUpload={handleFileUpload} 
                            isUploading={uploadingField === '부동산매매계약서'}
                            disabled={formData.ownershipType !== '이사예정'}
                        />
                    </div>
                </section>

                <div className="footer-actions">
                    <button className="submit-btn" disabled>
                        {isSaving ? '저장 중...' : '✓ 자동으로 저장됨'}
                    </button>
                    {lastSavedAt && (
                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                            마지막 저장 시간: {lastSavedAt}
                        </p>
                    )}
                </div>
            </main>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    background: #0f172a;
                    color: #f8fafc;
                    padding: 2rem 1rem;
                    font-family: 'Inter', sans-serif;
                }
                .header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #38bdf8, #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .header p {
                    color: #94a3b8;
                    margin-top: 0.5rem;
                }
                .card {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 2rem;
                    padding: 2.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: #38bdf8;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 640px) {
                    .grid { grid-template-columns: 1fr; }
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #94a3b8;
                }
                .input-group.full-width {
                    grid-column: 1 / -1;
                }
                input, select {
                    background: #020617;
                    border: 1px solid #334155;
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: #f8fafc;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                }
                input:focus, select:focus {
                    border-color: #38bdf8;
                    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
                }
                .divider {
                    margin: 2.5rem 0;
                    border: 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                @media (max-width: 640px) {
                    .upload-grid { grid-template-columns: 1fr; }
                }
                .footer-actions {
                    margin-top: 3rem;
                    text-align: center;
                }
                .notice {
                    color: #f87171;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                }
                .submit-btn {
                    width: 100%;
                    padding: 1.5rem;
                    border-radius: 1.25rem;
                    background: #1e293b;
                    color: #94a3b8;
                    font-size: 1.25rem;
                    font-weight: 800;
                    border: 1px solid #334155;
                    cursor: not-allowed;
                    transition: all 0.3s;
                }
                .btn-capital {
                    width: 100%;
                    padding: 1.25rem;
                    border-radius: 1rem;
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    color: #38bdf8;
                    font-size: 1.1rem;
                    font-weight: 800;
                    border: 1px solid #38bdf8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-capital:hover {
                    background: #38bdf8;
                    color: white;
                }
                .btn-agree {
                    width: 100%;
                    padding: 1.25rem;
                    border-radius: 1rem;
                    background: #475569;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                }
                .btn-agree.active {
                    background: #10b981;
                    cursor: pointer;
                    box-shadow: none;
                }
                .btn-agree.active:hover {
                    background: #059669;
                }
                .btn-agree:hover:not(.active) {
                    transform: scale(1.02);
                    background: #2563eb;
                }
                .loading {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0f172a;
                    color: white;
                    font-size: 1.25rem;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .toast {
                    position: fixed;
                    top: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #10b981;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    animation: slideDown 0.3s ease-out;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .toast.error {
                    background: #ef4444;
                }
                @keyframes slideDown {
                    from { transform: translate(-50%, -1rem); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

function UploadButton({ label, fieldName, isUploaded, onUpload, isUploading, disabled }: any) {
    return (
        <div className={`upload-box ${disabled ? 'disabled' : ''} ${isUploaded ? 'uploaded' : ''}`}>
            <label className="upload-label">
                <span className="icon">{isUploaded ? '✅' : '📁'}</span>
                <span className="text">{label}</span>
                <span className="status">{isUploading ? '업로드 중...' : isUploaded ? '등록 완료' : '등록 하기'}</span>
                {!disabled && (
                    <input 
                        type="file" 
                        accept="image/*, application/pdf" 
                        onChange={(e) => onUpload(e, fieldName)} 
                        style={{ display: 'none' }} 
                    />
                )}
            </label>
            <style jsx>{`
                .upload-box {
                    background: #020617;
                    border: 2px dashed #334155;
                    border-radius: 1.25rem;
                    transition: all 0.2s;
                }
                .upload-box:not(.disabled):hover {
                    border-color: #38bdf8;
                    background: rgba(56, 189, 248, 0.05);
                }
                .upload-box.uploaded {
                    border-style: solid;
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.05);
                }
                .upload-box.disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    border-style: solid;
                    background: #1e293b;
                }
                .upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2.5rem 1rem;
                    cursor: pointer;
                    width: 100%;
                }
                .upload-box.disabled .upload-label {
                    cursor: not-allowed;
                }
                .icon { font-size: 2rem; margin-bottom: 0.75rem; }
                .text { font-weight: 700; font-size: 1.125rem; margin-bottom: 0.5rem; text-align: center; }
                .status { 
                    font-size: 0.875rem; 
                    font-weight: 600; 
                    color: #64748b; 
                    background: #1e293b;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                }
                .uploaded .status { color: #10b981; background: rgba(16, 185, 129, 0.1); }
            `}</style>
        </div>
    );
}
