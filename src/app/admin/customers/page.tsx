'use client';

import AdminSidebar from '@/components/AdminSidebar';
import CustomerRegisterModal from '@/components/CustomerRegisterModal';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DaumPostcodeEmbed from 'react-daum-postcode';

type Status =
    | '등록완료'
    | '신용동의'
    | '계약완료'
    | '진행불가'
    | '계약취소'
    | '시공자료요청'
    | '녹취완료'
    | '1차정산완료'
    | '최종정산완료';

interface AuditDocument {
    name: string;
    uploadedAt: string;
    url?: string;
}

interface Customer {
    id: string;
    date: string;
    name: string;
    phone: string;
    birthDate: string;
    address: string;
    amount: string;
    downPayment: string;
    months: string;
    transferDate: string;
    status: Status;
    partnerName: string;
    remarks?: string;
    documents?: Record<string, AuditDocument>;
    ownershipType?: string;
    constructionDate: string;
    statusUpdatedAt?: string;
}

const statusOptions: Status[] = [
    '등록완료',
    '신용동의',
    '계약완료',
    '진행불가',
    '계약취소',
    '시공자료요청',
    '녹취완료',
    '1차정산완료',
    '최종정산완료'
];

const getStatusBadgeStyles = (status: Status) => {
    switch (status) {
        case '1차정산완료':
        case '최종정산완료':
            return { bg: '#ecfdf5', color: '#059669' };
        case '등록완료':
            return { bg: '#f1f5f9', color: '#475569' };
        case '신용동의':
        case '녹취완료':
            return { bg: '#f0f9ff', color: '#0046AD' };
        case '진행불가':
        case '계약취소':
            return { bg: '#fef2f2', color: '#ef4444' };
        case '계약완료':
            return { bg: '#fffbeb', color: '#d97706' };
        case '시공자료요청':
            return { bg: '#f5f3ff', color: '#7c3aed' };
        default:
            return { bg: '#f8fafc', color: '#64748b' };
    }
};

const DocItemKeyed = ({ docName, label, documents, uploading, onUpload, onDelete, priority }: { docName: string, label?: string, documents: Record<string, AuditDocument>, uploading: string | null, onUpload: (name: string, file: File) => void, onDelete: (name: string) => void, priority?: string }) => {
    const file = documents[docName];
    const isSubmitted = !!file;
    const displayLabel = label || docName;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '1.25rem',
            background: isSubmitted ? '#f0fdf4' : '#fff',
            borderRadius: '1.25rem',
            border: isSubmitted ? '2px solid #10b981' : '1px solid #e2e8f0',
            boxShadow: isSubmitted ? '0 10px 15px -3px rgba(16, 185, 129, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'relative',
            transform: isSubmitted ? 'translateY(-2px)' : 'none'
        }}>
            {isSubmitted && (
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#10b981',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 900,
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                    zIndex: 1
                }}>
                    ✓
                </div>
            )}
            <div style={{
                fontSize: '2.5rem',
                opacity: isSubmitted ? 1 : 0.4,
                filter: isSubmitted ? 'none' : 'grayscale(100%)',
                transition: 'all 0.3s'
            }}>
                {isSubmitted ? '📄' : '📁'}
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: isSubmitted ? '#065f46' : '#1e293b', fontWeight: 800, wordBreak: 'keep-all', marginBottom: '0.25rem' }}>
                    {displayLabel}
                </div>
                {priority === '필수' && !isSubmitted && (
                    <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700 }}> (필수)</span>
                )}
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: isSubmitted ? '#059669' : '#94a3b8',
                    marginTop: '0.2rem'
                }}>
                    [{isSubmitted ? '제출완료' : '미제출'}]
                </div>
            </div>

            {isSubmitted ? (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', width: '100%' }}>
                    {file.url && (
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ flex: 1, padding: '0.5rem', background: '#3b82f6', color: 'white', borderRadius: '0.6rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', transition: 'all 0.2s' }}
                        >
                            보기
                        </a>
                    )}
                    <button
                        onClick={() => onDelete(docName)}
                        style={{ padding: '0.5rem 0.75rem', background: 'transparent', color: '#ef4444', borderRadius: '0.6rem', border: '1px solid #fee2e2', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.2s' }}
                    >
                        삭제
                    </button>
                </div>
            ) : (
                <div style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
                    <button
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            border: 'none',
                            borderRadius: '0.75rem',
                            background: priority === '필수' ? '#1e293b' : '#f1f5f9',
                            color: priority === '필수' ? 'white' : '#475569',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                        disabled={!!uploading}
                    >
                        {uploading === docName ? '업로드 중...' : '첨부하기'}
                    </button>
                    <input
                        type="file"
                        accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(docName, f);
                        }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                </div>
            )}
        </div>
    );
};

const CustomerDetailModal = ({ customer, onClose, onUpdate, mode = 'customer', isGuest = false }: { customer: Customer; onClose: () => void; onUpdate: () => void; mode?: 'customer' | 'settlement', isGuest?: boolean }) => {
    const [status, setStatus] = useState<Status>(customer.status);
    const [remarks, setRemarks] = useState(customer.remarks || '');
    const [documents, setDocuments] = useState<Record<string, AuditDocument>>(customer.documents || {});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Editing mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: customer.name,
        phone: customer.phone,
        amount: customer.amount,
        downPayment: String(findVal(customer, ['선납금', 'downPayment']) || '0'),
        address: customer.address,
        months: customer.months,
        transferDate: customer.transferDate,
        constructionDate: findVal(customer, ['시공예정일', '시공일', 'constructionDate']) || '',
        birthDate: customer.birthDate,
        ownershipType: customer.ownershipType || '미지정',
        settlement1Date: findVal(customer, ['settlement1Date', '1차정산일']) || '',
        settlement1Amount: findVal(customer, ['settlement1Amount', '1차정산금']) || '0',
        settlement2Date: findVal(customer, ['settlement2Date', '최종정산일']) || '',
        settlement2Amount: findVal(customer, ['settlement2Amount', '최종정산금']) || '0'
    });
    const [deleting, setDeleting] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    // Helper to find value from customer object (which might have different key names if it's raw)
    function findVal(obj: any, keys: string[]) {
        for (const k of keys) if (obj[k] !== undefined) return obj[k];
        return null;
    }

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxSide = 1920;
                    if (width > height) {
                        if (width > maxSide) { height *= maxSide / width; width = maxSide; }
                    } else {
                        if (height > maxSide) { width *= maxSide / height; height = maxSide; }
                    }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    resolve(dataUrl.split(',')[1]);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (docName: string, file: File) => {
        setUploading(docName);
        try {
            let base64 = '';
            if (file.type.startsWith('image/')) {
                base64 = await compressImage(file);
            } else {
                base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(file);
                });
            }

            const sanitizedPhone = (editData.phone || '').replace(/[^0-9]/g, '');
            const fileName = `${customer.date}_${editData.name}_${sanitizedPhone}_${docName}`;

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'upload', base64, fileName, mimeType: file.type })
            });

            if (!response.ok) throw new Error('업로드 실패');
            const result = await response.json();

            const newDoc: AuditDocument = {
                name: fileName,
                uploadedAt: new Date().toISOString().split('T')[0],
                url: result.url
            };

            const updatedDocs = { ...documents, [docName]: newDoc };
            setDocuments(updatedDocs);
        } catch (err: any) {
            console.error(err);
            alert(`파일 업로드 실패: ${err.message}`);
        } finally {
            setUploading(null);
        }
    };

    const handleMultiplePhotosUpload = async (files: FileList) => {
        setUploading('다중사진');
        try {
            const newDocs = { ...documents };
            let nextIdx = 1;
            for (let i = 0; i < files.length; i++) {
                while (newDocs[`시공 사진 ${nextIdx}`]) nextIdx++;
                if (nextIdx > 30) break;
                const file = files[i];
                const dName = `시공 사진 ${nextIdx}`;
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(file);
                });
                const sanitizedPhone = (editData.phone || '').replace(/[^0-9]/g, '');
                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'upload', base64, fileName: `${customer.date}_${editData.name}_${sanitizedPhone}_${dName}`, mimeType: file.type })
                });
                if (response.ok) {
                    const result = await response.json();
                    newDocs[dName] = { url: result.url, name: file.name, uploadedAt: new Date().toISOString().split('T')[0] };
                }
            }
            setDocuments(newDocs);
            alert('사진 업로드가 완료되었습니다.');
        } catch (error) {
            alert('사진 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteDoc = (docName: string) => {
        const updated = { ...documents };
        delete updated[docName];
        setDocuments(updated);
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 고객 정보를 삭제하시겠습니까?')) return;
        setDeleting(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteCustomer', type: isGuest ? 'guest_customers' : 'customers', id: customer.id })
            });
            if (response.ok) {
                alert('고객 정보가 삭제되었습니다.');
                onUpdate();
                onClose();
            } else throw new Error('Delete failed');
        } catch (err) {
            alert('삭제 실패');
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                action: 'update',
                type: isGuest ? 'guest_customers' : 'customers',
                id: customer.id,
                status: status,
                remarks: remarks,
                documents: JSON.stringify(documents),
                customerName: editData.name,
                phone: editData.phone,
                amount: editData.amount.replace(/,/g, ''),
                downPayment: editData.downPayment.replace(/,/g, ''),
                address: editData.address,
                months: editData.months,
                transferDate: editData.transferDate,
                birthDate: editData.birthDate,
                constructionDate: editData.constructionDate,
                ownershipType: editData.ownershipType,
                settlement1Date: editData.settlement1Date,
                settlement1Amount: editData.settlement1Amount.toString().replace(/,/g, ''),
                settlement2Date: editData.settlement2Date,
                settlement2Amount: editData.settlement2Amount.toString().replace(/,/g, '')
            };
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const resData = await response.json();
                if (resData.result === 'error') {
                    throw new Error(resData.message || 'Back-end save failed');
                }
                alert('변경사항이 저장되었습니다.');
                onUpdate();
                onClose();
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Save failed');
            }
        } catch (err: any) {
            alert('저장 실패: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'white', width: '800px', maxWidth: '100%', borderRadius: '1.5rem', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
                
                <div className="modal-header-container" style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>마스터 고객 관리</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{editData.name} 고객님의 상세 현황 제어실</p>
                    </div>
                    <div className="modal-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => window.open(`/customer/${customer.id}`, '_blank')}
                            style={{ 
                                padding: '0.6rem 1rem', 
                                borderRadius: '0.75rem', 
                                border: '1px solid #3b82f6', 
                                background: 'white', 
                                color: '#3b82f6', 
                                fontSize: '0.875rem', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            🔗 고객 화면
                        </button>
                        <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: isEditing ? '#f1f5f9' : 'white', color: '#0f172a', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <span>{isEditing ? '✕' : '✎'}</span> {isEditing ? '수정 취소' : '정보 수정'}
                        </button>
                        <button className="close-btn" onClick={onClose} style={{ fontSize: '2rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>&times;</button>
                    </div>
                </div>

                <div className="modal-content-container" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div className="modal-info-section" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>👤 신청 고객 기본 정보</h3>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Status)}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', background: '#3b82f6', color: 'white', fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="modal-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>고객명</p>
                                {isEditing ? <input disabled type="text" value={editData.name} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc' }} /> : <p style={{ fontWeight: 700 }}>{editData.name}</p>}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>연락처</p>
                                {isEditing ? <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} /> : <p style={{ fontWeight: 700 }}>{editData.phone}</p>}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>생년월일</p>
                                {isEditing ? <input type="text" value={editData.birthDate} onChange={e => setEditData({...editData, birthDate: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} /> : <p style={{ fontWeight: 700 }}>{editData.birthDate}</p>}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>주택 소유 구분</p>
                                {isEditing ? <select value={editData.ownershipType} onChange={e => setEditData({...editData, ownershipType: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>{['본인소유','가족소유','이사예정','기타'].map(v => <option key={v} value={v}>{v}</option>)}</select> : <p style={{ color: '#3b82f6', fontWeight: 700 }}>{editData.ownershipType}</p>}
                            </div>
                            <div className="grid-span-2" style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>시공 주소</p>
                                {isEditing ? <div style={{ display: 'flex', gap: '0.5rem' }}><input readOnly value={editData.address} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f1f5f9' }} /><button onClick={() => setIsAddressOpen(true)} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700 }}>검색</button></div> : <p style={{ fontWeight: 700 }}>{editData.address}</p>}
                            </div>
                            <div className="financial-card" style={{ gridColumn: '1 / -1', background: '#fffbeb', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #fde68a' }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#92400e', marginBottom: '1.25rem', borderBottom: '1px solid #fef3c7', paddingBottom: '0.75rem' }}>💳 결제 / 구독 정보</p>
                                <div className="modal-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div><p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>최종 견적 총액</p>{isEditing ? <input value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value.replace(/[^0-9]/g,'')})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 800 }}>{Number(editData.amount).toLocaleString()}원</p>}</div>
                                    <div><p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>선납금</p>{isEditing ? <input value={editData.downPayment} onChange={e => setEditData({...editData, downPayment: e.target.value.replace(/[^0-9]/g,'')})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 800 }}>{Number(editData.downPayment).toLocaleString()}원</p>}</div>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}><p style={{ fontSize: '0.7rem', color: '#64748b' }}>잔금</p><p style={{ fontWeight: 900, color: '#ef4444' }}>{(Number(editData.amount.toString().replace(/,/g,'')) - Number(editData.downPayment.toString().replace(/,/g,''))).toLocaleString()}원</p></div>
                                    <div><p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>구독 기간</p>{isEditing ? <select value={editData.months} onChange={e => setEditData({...editData, months: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem' }}>{['24','36','48','60'].map(m => <option key={m} value={m}>{m}개월</option>)}</select> : <p style={{ fontWeight: 800 }}>{editData.months}개월</p>}</div>
                                    <div><p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>매월 이체일</p>{isEditing ? <select value={editData.transferDate} onChange={e => setEditData({...editData, transferDate: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem' }}>{['5','10','15','20','25'].map(d => <option key={d} value={d}>{d}일</option>)}</select> : <p style={{ fontWeight: 800 }}>{editData.transferDate}일</p>}</div>
                                </div>
                            </div>
                            <div className="date-card" style={{ gridColumn: '1 / -1', padding: '1.25rem', background: '#f0fdf4', borderRadius: '1rem', border: '1px solid #bbf7d0' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 900, color: '#166534', marginBottom: '0.75rem' }}>📅 시공 예정일</p>
                                {isEditing ? <input type="date" value={editData.constructionDate} onChange={e => setEditData({...editData, constructionDate: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #34d399', borderRadius: '0.5rem' }} /> : <p style={{ fontWeight: 700, color: '#065f46' }}>{editData.constructionDate || '미지정'}</p>}
                            </div>

                            {mode === 'settlement' && (
                                <div className="settlement-card" style={{ gridColumn: '1 / -1', background: '#f0f9ff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #bae6fd' }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369a1', marginBottom: '1.25rem', borderBottom: '1px solid #e0f2fe', paddingBottom: '0.75rem' }}>💰 정산 관리 (어드민 전용)</p>
                                    <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.4rem' }}>1차 정산 예정일</p>
                                            {isEditing ? <input type="date" value={editData.settlement1Date} onChange={e => setEditData({...editData, settlement1Date: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #3b82f6', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 700 }}>{editData.settlement1Date || '-'}</p>}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.4rem' }}>1차 정산 금액</p>
                                            {isEditing ? <input value={editData.settlement1Amount} onChange={e => setEditData({...editData, settlement1Amount: e.target.value.replace(/[^0-9]/g,'')})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #3b82f6', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 700, color: '#3b82f6' }}>{Number(editData.settlement1Amount).toLocaleString()}원</p>}
                                        </div>
                                    </div>
                                    <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>최종 정산 예정일</p>
                                            {isEditing ? <input type="date" value={editData.settlement2Date} onChange={e => setEditData({...editData, settlement2Date: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #10b981', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 700 }}>{editData.settlement2Date || '-'}</p>}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>최종 정산 금액</p>
                                            {isEditing ? <input value={editData.settlement2Amount} onChange={e => setEditData({...editData, settlement2Amount: e.target.value.replace(/[^0-9]/g,'')})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #10b981', borderRadius: '0.4rem' }} /> : <p style={{ fontWeight: 700, color: '#10b981' }}>{Number(editData.settlement2Amount).toLocaleString()}원</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {mode === 'customer' && (
                        <>
                            {/* 1. Customer Documents Section */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '5px solid #3b82f6' }}>
                                    <span>👤</span> 고객이 등록해야할 서류
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                                    <DocItemKeyed docName="신분증사본" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                    <DocItemKeyed docName="통장사본(자동이체)" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                    {editData.ownershipType === '가족소유' && (
                                        <DocItemKeyed docName="가족관계증명서" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                    )}
                                    {editData.ownershipType === '이사예정' && (
                                        <DocItemKeyed docName="부동산매매계약서" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                    )}
                                </div>
                            </div>

                            {/* 2. Partner Documents Section */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '5px solid #6366f1' }}>
                                    <span>🏢</span> 파트너가 등록해야할 서류
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                                    <DocItemKeyed docName="최종견적서" label="최종견적서" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                </div>
                            </div>

                            {/* 3. Construction Documents Section */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '5px solid #10b981' }}>
                                    <span>🏗️</span> 시공 후 등록해야할 서류
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    <DocItemKeyed docName="시공계약서" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                    <DocItemKeyed docName="시공확인서" documents={documents} uploading={uploading} onUpload={handleFileUpload} onDelete={handleDeleteDoc} priority="필수" />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            📸 시공 완료 사진 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(최소 6장 필요)</span>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <button style={{ padding: '0.6rem 1.25rem', background: '#3b82f6', color: 'white', borderRadius: '0.75rem', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s' }}>
                                                {uploading === '다중사진' ? '업로드 중...' : '사진 일괄 업로드'}
                                            </button>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => e.target.files && handleMultiplePhotosUpload(e.target.files)}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                        {Object.entries(documents)
                                            .filter(([name]) => name.startsWith('시공 사진'))
                                            .sort(([a], [b]) => {
                                                const aNum = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                                                const bNum = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                                                return aNum - bNum;
                                            })
                                            .map(([name, doc]) => (
                                                <div key={name} style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '1/1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                    <img src={doc.url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button 
                                                        onClick={() => handleDeleteDoc(name)}
                                                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))
                                        }
                                        {Object.entries(documents).filter(([name]) => name.startsWith('시공 사진')).length < 6 && (
                                            <div style={{ aspectRatio: '1/1', borderRadius: '1rem', border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>
                                                <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📷</span>
                                                미등록
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.5rem' }}>💬 마스터 관리 메모</label>
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', minHeight: '80px' }} placeholder="심사 특이사항을 기록하세요." />
                    </div>
                </div>

                <div className="modal-footer-container" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={handleDelete} disabled={deleting} style={{ padding: '0.8rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #ef4444', color: '#ef4444', background: 'white', fontWeight: 700, cursor: 'pointer' }}>정보 삭제</button>
                    <div className="spacer" style={{ flex: 1 }} />
                    <button onClick={onClose} style={{ padding: '0.8rem 1.25rem', borderRadius: '0.75rem', background: 'white', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' }}>닫기</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '0.8rem 2rem', borderRadius: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer' }}>{saving ? '저장 중...' : '저장'}</button>
                </div>

                <style jsx>{`
                    @media (max-width: 1024px) {
                        .modal-header-container { flex-direction: column !important; align-items: stretch !important; padding: 1.25rem !important; }
                        .modal-header-actions { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0.5rem !important; margin-top: 1rem !important; }
                        .modal-header-actions button { padding: 0.8rem 0.5rem !important; font-size: 0.8rem !important; justify-content: center !important; }
                        .modal-header-actions .close-btn { display: none !important; }
                        
                        .modal-content-container { padding: 1rem !important; }
                        .modal-info-section { padding: 1.25rem !important; border-radius: 1rem !important; }
                        
                        .modal-grid-3, .modal-grid-2 { grid-template-columns: 1fr !important; gap: 1rem !important; }
                        .grid-span-2 { grid-column: span 1 !important; }
                        
                        .financial-card, .date-card { padding: 1.25rem !important; }
                        
                        .modal-footer-container { 
                            padding: 1.25rem !important; 
                            flex-wrap: wrap !important;
                            gap: 0.5rem !important;
                        }
                        .modal-footer-container .spacer { display: none !important; }
                        .modal-footer-container button { 
                            flex: 1 !important; 
                            padding: 0.875rem 0.5rem !important; 
                            font-size: 0.85rem !important;
                            white-space: nowrap !important;
                            border-radius: 0.75rem !important;
                        }

                        .docs-grid { grid-template-columns: 1fr !important; }
                        .construction-docs-section { padding: 1rem !important; }
                    }
                `}</style>
            </div>

            {isAddressOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '500px', background: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 800 }}>주소 검색</h3>
                            <button onClick={() => setIsAddressOpen(false)}>&times;</button>
                        </div>
                        <DaumPostcodeEmbed onComplete={data => { setEditData({ ...editData, address: data.address }); setIsAddressOpen(false); }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminCustomerList() {
    return (
        <Suspense fallback={<div style={{ background: '#f8fafc', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>로딩 중...</div>}>
            <AdminCustomerListContent />
        </Suspense>
    );
}

function AdminCustomerListContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('전체');
    const [filterPartner, setFilterPartner] = useState('전체');
    const [partners, setPartners] = useState<string[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [datePreset, setDatePreset] = useState('전체');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const searchParams = useSearchParams();

    const fetchAllCustomers = async () => {
        setLoading(true);
        console.log('Fetching all customers for admin...');
        try {
            const [cRes, gRes, pRes] = await Promise.all([
                fetch('/api/proxy?type=customers', { cache: 'no-store' }),
                fetch('/api/proxy?type=guest_customers', { cache: 'no-store' }),
                fetch('/api/proxy?type=partners', { cache: 'no-store' })
            ]);
            const cData = await cRes.json();
            const gData = await gRes.json();
            const pData = await pRes.json();

            console.log('Raw data counts:', { customers: Array.isArray(cData) ? cData.length : 'error', guest: Array.isArray(gData) ? gData.length : 'error' });

            // Merge customers and guest_customers
            const data = [...(Array.isArray(cData) ? cData : []), ...(Array.isArray(gData) ? gData : [])];

            if (Array.isArray(pData)) {
                const uniquePartners = Array.from(new Set(pData.map((p: any) => p['파트너명'] || p['name'] || '').filter(Boolean))) as string[];
                setPartners(uniquePartners.sort());
            }

            if (Array.isArray(data)) {
                const mappedData = data.map((item: any) => {
                    const findVal = (keywords: string[]) => {
                        const keys = Object.keys(item);
                        const normalizedKeywords = keywords.map(k => k.toLowerCase().replace(/\s/g, ''));
                        
                        for (const k of keys) {
                            const normalizedK = k.toLowerCase().replace(/\s/g, '');
                            if (normalizedKeywords.includes(normalizedK)) return item[k];
                        }
                        
                        for (const k of keys) {
                            const normalizedK = k.toLowerCase().replace(/\s/g, '');
                            for (const key of normalizedKeywords) {
                                if (key === 'date' && normalizedK.includes('birth')) continue;
                                if (normalizedK.includes(key)) return item[k];
                            }
                        }
                        return null;
                    };

                    const docsJson = findVal(['docs_json', 'documents', '서류', '서류JSON']);
                    const birthDateRaw = (findVal(['생년월일', 'birthDate']) || '-').toString();
                    const birthDate = (birthDateRaw.includes('T'))
                        ? birthDateRaw.split('T')[0]
                        : birthDateRaw;

                    return {
                        id: item.id || findVal(['고객번호', 'ID', 'id']) || item._id,
                        date: String(findVal(['접수일', 'date']) || '-').split('T')[0],
                        name: findVal(['신청자명', '이름', 'name']) || '이름 없음',
                        phone: findVal(['연락처', 'phone']) || '-',
                        birthDate: birthDate,
                        address: findVal(['주소', 'address']) || '-',
                        amount: findVal(['최종견적가', '견적금액', 'amount']) || '0',
                        downPayment: findVal(['선납금', 'downPayment']) || '0',
                        months: findVal(['구독기간', '구독개월', 'months']) || '-',
                        transferDate: findVal(['이체희망일', '이체일', 'transferDate']) || '-',
                        status: (() => {
                            const s = findVal(['상태', 'status', '진행상태', '상태값']);
                            const normalizedS = String(s || "").trim();
                            if (!normalizedS || normalizedS === '접수' || normalizedS === '신규접수') return '등록완료';
                            return normalizedS as Status;
                        })(),
                        partnerName: findVal(['파트너명', 'partnerName']) || '미지정',
                        remarks: findVal(['비고', 'remarks']) || '',
                        ownershipType: findVal(['주택소유', 'ownershipType']) || '미지정',
                        constructionDate: findVal(['시공예정일', '시공일', 'constructionDate']) || '',
                        statusUpdatedAt: findVal(['상태변경일', 'statusUpdatedAt']) || (item._creationTime ? new Date(item._creationTime).toISOString().split('T')[0] : (findVal(['접수일', 'date']) || '').toString().split('T')[0]),
                        documents: docsJson ? (typeof docsJson === 'string' ? JSON.parse(docsJson) : docsJson) : {},
                        isGuest: !!item.isGuest
                    };
                });
                const sorted = mappedData.sort((a: any, b: any) => {
                    const dateA = a.date !== '-' ? new Date(a.date).getTime() : 0;
                    const dateB = b.date !== '-' ? new Date(b.date).getTime() : 0;
                    if (dateA !== dateB) return dateB - dateA;
                    return String(b.id || "").localeCompare(String(a.id || ""));
                });
                console.log('Mapped and sorted customers count:', sorted.length);
                setCustomers(sorted);
                setFilteredCustomers(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch master customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCustomers();
    }, []);

    useEffect(() => {
        const filtered = customers.filter(c => {
            // 1. Search & Status Filter
            const matchesSearch = c.name.includes(searchTerm) || c.partnerName.includes(searchTerm) || c.phone.includes(searchTerm) || c.address.includes(searchTerm);
            const matchesStatus = filterStatus === '전체' || c.status === filterStatus;
            const matchesPartner = filterPartner === '전체' || c.partnerName === filterPartner;

            // 2. Date Filter
            let matchesDate = true;
            if (c.date && c.date !== '-') {
                const customerDate = new Date(c.date);
                const now = new Date();
                
                if (datePreset !== '전체') {
                    let limitDate = new Date();
                    if (datePreset === '당월') {
                        limitDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    } else if (datePreset === '전월') {
                        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                        return customerDate >= firstOfLastMonth && customerDate <= lastOfLastMonth && matchesSearch && matchesStatus && matchesPartner;
                    } else if (datePreset === '3개월') {
                        limitDate.setMonth(now.getMonth() - 3);
                    } else if (datePreset === '6개월') {
                        limitDate.setMonth(now.getMonth() - 6);
                    } else if (datePreset === '1년') {
                        limitDate.setFullYear(now.getFullYear() - 1);
                    }
                    matchesDate = customerDate >= limitDate;
                } else if (startDate && endDate) {
                    matchesDate = customerDate >= new Date(startDate) && customerDate <= new Date(endDate);
                }
            }

            return matchesSearch && matchesStatus && matchesPartner && matchesDate;
        });
        setFilteredCustomers(filtered);
    }, [searchTerm, filterStatus, filterPartner, datePreset, startDate, endDate, customers]);

    return (
        <div className="admin-page-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b', overflowX: 'hidden', width: '100%' }}>
            <AdminSidebar />
            <main className="admin-main-container" style={{ 
                flex: 1, 
                padding: '2.5rem', 
                marginLeft: '260px', 
                boxSizing: 'border-box', 
                width: 'calc(100% - 260px)', 
                minWidth: 0, 
                position: 'relative' 
            }}>
                <header className="admin-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                    <div className="header-title-section" style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', wordBreak: 'keep-all' }}>전체 고객 관리</h1>
                        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '1rem' }}>모든 파트너사의 신청 내역을 통합 조회하고 관리합니다.</p>
                    </div>
                    <div className="header-action-section" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={() => fetchAllCustomers()} 
                            style={{ 
                                padding: '0.75rem 1.25rem', 
                                borderRadius: '0.75rem', 
                                background: '#fff', 
                                border: '1px solid #e2e8f0', 
                                color: '#475569', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>🔄</span> 새로고침
                        </button>
                        <button 
                            onClick={() => setIsRegisterModalOpen(true)}
                            style={{ 
                                padding: '0.75rem 1.25rem', 
                                borderRadius: '0.75rem', 
                                background: '#3b82f6', 
                                border: 'none', 
                                color: '#fff', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>👤+</span> 신규 등록
                        </button>
                    </div>
                </header>

                <section className="filter-container" style={{ background: '#fff', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                    {/* Search & Status Buttons */}
                    <div className="search-status-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <div className="search-box" style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="고객명, 연락처, 파트너사 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div className="select-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{
                                        padding: '0.5rem 2.5rem 0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.75rem',
                                        color: filterStatus === '전체' ? '#64748b' : '#3b82f6',
                                        background: 'white',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        fontWeight: 800,
                                        minWidth: '130px'
                                    }}
                                >
                                    <option value="전체">모든 상태</option>
                                    {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={filterPartner}
                                    onChange={(e) => setFilterPartner(e.target.value)}
                                    style={{
                                        padding: '0.5rem 2.5rem 0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.75rem',
                                        color: filterPartner === '전체' ? '#64748b' : '#3b82f6',
                                        background: 'white',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        minWidth: '130px'
                                    }}
                                >
                                    <option value="전체">모든 파트너사</option>
                                    {partners.map((p: string) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Presets */}
                    <div className="date-filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', justifyContent: 'space-between' }}>
                        <div className="date-presets" style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '0.5rem', overflowX: 'auto', maxWidth: '100%' }}>
                            {['전체', '당월', '전월', '3개월', '6개월', '1년', '기간선택'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setDatePreset(p)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        borderRadius: '0.375rem',
                                        background: datePreset === p ? 'white' : 'transparent',
                                        color: datePreset === p ? '#3b82f6' : '#64748b',
                                        boxShadow: datePreset === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {datePreset === '기간선택' && (
                            <div className="custom-date-inputs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                                />
                                <span style={{ color: '#94a3b8' }}>~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                                />
                            </div>
                        )}
                        
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                            총 <span style={{ color: '#3b82f6', fontWeight: 900 }}>{filteredCustomers.length}</span>건
                        </div>
                    </div>
                </section>

                {/* Table Section */}
                <div className="desktop-only-table" style={{ 
                    background: '#ffffff', 
                    borderRadius: '1.25rem', 
                    border: '1px solid #e2e8f0', 
                    overflowX: 'auto', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    width: '100%'
                }}>
                    <div style={{ width: '100%', minWidth: 'min-content' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1500px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>신청일</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>고객명</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>연락처</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>파트너사</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>생년월일</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>주소</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>구독 원금</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>구독 기간</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>시공 예정일</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>상태</th>
                                    <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>비고</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#334155', fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>데이터를 불러오는 중...</td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>조건에 맞는 고객 데이터가 없습니다.</td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((c) => {
                                        const badge = getStatusBadgeStyles(c.status);
                                        return (
                                            <tr 
                                                key={c.id} 
                                                onClick={() => setSelectedCustomer(c)}
                                                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '1.25rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{c.date}</td>
                                                <td style={{ padding: '1.25rem 1rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>{c.name}</td>
                                                <td style={{ padding: '1.25rem 1rem', whiteSpace: 'nowrap' }}>{c.phone}</td>
                                                <td style={{ padding: '1.25rem 1rem', color: '#3b82f6', fontWeight: 900, whiteSpace: 'nowrap' }}>{c.partnerName}</td>
                                                <td style={{ padding: '1.25rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>{c.birthDate}</td>
                                                <td style={{ padding: '1.25rem 1rem', minWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>{c.address}</td>
                                                <td style={{ padding: '1.25rem 1rem', fontWeight: 900, color: '#3b82f6', textAlign: 'right', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{Number(c.amount.toString().replace(/,/g, '')).toLocaleString()}원</td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.months}개월</td>
                                                <td style={{ padding: '1.25rem 1rem', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{c.constructionDate || '-'}</td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ 
                                                            display: 'inline-flex',
                                                            padding: '0.3rem 0.75rem', 
                                                            borderRadius: '2rem', 
                                                            fontSize: '0.7rem', 
                                                            fontWeight: 900, 
                                                            background: badge.bg, 
                                                            color: badge.color,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {c.status}
                                                        </span>
                                                        {c.statusUpdatedAt && (
                                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>
                                                                {c.statusUpdatedAt}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#cbd5e1' }}>{c.remarks ? '📝' : '-'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="mobile-cards-container" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>불러오는 중...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터 없음</div>
                    ) : (
                        filteredCustomers.map((c) => {
                            const badge = getStatusBadgeStyles(c.status);
                            return (
                                <div 
                                    key={c.id} 
                                    onClick={() => setSelectedCustomer(c)}
                                    className="customer-mobile-card"
                                    style={{ 
                                        background: 'white', 
                                        borderRadius: '1.25rem', 
                                        padding: '1.5rem', 
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        borderLeft: `5px solid ${badge.color}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 900, marginBottom: '0.25rem' }}>{c.name}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 800 }}>{c.partnerName}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <span style={{ 
                                                padding: '0.3rem 0.75rem', 
                                                borderRadius: '2rem', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 900, 
                                                background: badge.bg, 
                                                color: badge.color 
                                            }}>
                                                {c.status}
                                            </span>
                                            {c.statusUpdatedAt && (
                                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 500 }}>
                                                    {c.statusUpdatedAt}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>신청일</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.date}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>구독원금</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0046AD' }}>{Number(c.amount).toLocaleString()}원</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.phone}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700 }}>상세보기 &gt;</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {selectedCustomer && (
                <CustomerDetailModal 
                    customer={selectedCustomer} 
                    mode="customer"
                    isGuest={(selectedCustomer as any).isGuest || false}
                    onClose={() => setSelectedCustomer(null)} 
                    onUpdate={() => {
                        fetchAllCustomers();
                        setSelectedCustomer(null);
                    }} 
                />
            )}

            {isRegisterModalOpen && (
                <CustomerRegisterModal 
                    isOpen={isRegisterModalOpen} 
                    onClose={() => setIsRegisterModalOpen(false)} 
                    onSuccess={() => {
                        fetchAllCustomers();
                        setIsRegisterModalOpen(false);
                    }}
                />
            )}

            <style jsx>{`
                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0 !important;
                        padding: 1.25rem !important;
                        padding-bottom: 100px !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        overflow-x: hidden !important;
                    }
                    .admin-header h1 {
                        font-size: 1.5rem !important;
                        line-height: 1.2 !important;
                        white-space: normal !important;
                    }
                    .admin-header p {
                        font-size: 0.8rem !important;
                    }
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1.25rem;
                        margin-bottom: 2rem !important;
                        width: 100% !important;
                    }
                    .header-action-section {
                        width: 100%;
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                    }
                    .header-action-section button {
                        width: 100%;
                        justify-content: center;
                        padding: 0.75rem 0.25rem !important;
                        font-size: 0.75rem !important;
                        white-space: nowrap !important;
                    }
                    
                    .filter-container {
                        padding: 1rem !important;
                        margin-bottom: 1.5rem !important;
                    }
                    .search-status-row {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: 0.75rem !important;
                    }
                    .search-box {
                        width: 100%;
                        min-width: unset !important;
                    }
                    .select-row {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        width: 100%;
                        gap: 0.5rem !important;
                    }
                    .select-row > div, .select-row select {
                        width: 100% !important;
                        min-width: unset !important;
                        padding-left: 0.75rem !important;
                        padding-right: 1.75rem !important;
                    }

                    .date-filter-row {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: 1rem;
                    }
                    .date-presets {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 0.5rem !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin-bottom: 0.5rem;
                    }
                    .date-presets button {
                        flex: 1 1 auto !important;
                        min-width: 60px !important;
                        padding: 0.5rem 0.25rem !important;
                        font-size: 0.75rem !important;
                        white-space: nowrap !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .date-presets button[style*="background: white"] {
                        border-color: #3b82f6 !important;
                    }
                    .custom-date-inputs {
                        display: grid !important;
                        grid-template-columns: 1fr auto 1fr;
                        width: 100%;
                        gap: 0.25rem !important;
                    }
                    .custom-date-inputs input {
                        width: 100%;
                        padding: 0.4rem 0.25rem !important;
                        font-size: 0.7rem !important;
                    }

                    .desktop-only-table { display: block !important; width: 100%; overflow-x: auto; }
                    .mobile-cards-container { display: none !important; }
                    
                    .customer-mobile-card:active {
                        transform: scale(0.98);
                        background: #f8fafc;
                    }
                }
            `}</style>
        </div>
    );
}
