'use client';

import { useState } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { Customer, AuditDocument, Status } from '@/types/customer';
import { getStatusBadge, getStatusColor } from '@/utils/statusUtils';

interface CustomerDetailModalProps {
    customer: Customer;
    isGuest: boolean;
    isAdmin?: boolean;
    onClose: () => void;
    onUpdate: (c: Customer) => void;
    mode?: 'customer' | 'settlement';
}

export function DocItemKeyed({ docName, label, documents, uploading, onUpload, onDelete, priority }: { docName: string, label?: string, documents: Record<string, AuditDocument>, uploading: string | null, onUpload: (name: string, file: File) => void, onDelete: (name: string) => void, priority?: string }) {
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
}

export default function CustomerDetailModal({ customer, isGuest, isAdmin = false, onClose, onUpdate, mode = 'customer' }: CustomerDetailModalProps) {
    const [status, setStatus] = useState<Status>(customer.status);
    const [remarks, setRemarks] = useState(customer.remarks);
    const [documents, setDocuments] = useState<Record<string, AuditDocument>>(customer.documents || {});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Editing mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: customer.name,
        phone: customer.phone,
        amount: customer.amount,
        downPayment: customer.downPayment || '0',
        address: customer.address,
        months: customer.months,
        transferDate: customer.transferDate,
        constructionDate: customer.constructionDate || '',
        birthDate: customer.birthDate,
        ownershipType: customer.ownershipType || '미지정',
        settlement1Date: customer.settlement1Date || '',
        settlement1Amount: customer.settlement1Amount || '0',
        settlement2Date: customer.settlement2Date || '',
        settlement2Amount: customer.settlement2Amount || '0'
    });
    const [deleting, setDeleting] = useState(false);
    const [isAddressOpen, setIsAddressOpen] = useState(false);

    const firstRoundDocs = [
        '신분증사본', '통장사본(자동이체)', '부동산 등기부 등본(원본)',
        '부동산 매매 계약서 사본(등기 불가일 경우)', '가족관계 증명서(등기가 가족 명의일 경우)', '최종 견적서'
    ];
    const secondRoundDocs = ['시공 계약서'];

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
                        if (width > maxSide) {
                            height *= maxSide / width;
                            width = maxSide;
                        }
                    } else {
                        if (height > maxSide) {
                            width *= maxSide / height;
                            height = maxSide;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress as JPEG with 0.75 quality
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
                const base64Promise = new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const b64 = (reader.result as string).split(',')[1];
                        resolve(b64);
                    };
                    reader.readAsDataURL(file);
                });
                base64 = await base64Promise;
            }

            const sanitizedPhone = (editData.phone || '').replace(/[^0-9]/g, '');
            const fileName = `${customer.date}_${editData.name}_${sanitizedPhone}_${docName}`;

            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'upload',
                    base64: base64,
                    fileName: fileName,
                    mimeType: file.type
                })
            });

            if (!response.ok) throw new Error('Proxy server error');
            const result = await response.json();

            if (result.result === 'error') {
                throw new Error(result.message || 'GAS upload failed');
            }

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
                if (nextIdx > 30) break; // Limit

                const file = files[i];
                const dName = `시공 사진 ${nextIdx}`;

                let base64 = '';
                const base64Promise = new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(file);
                });
                base64 = await base64Promise;

                const sanitizedPhone = (editData.phone || '').replace(/[^0-9]/g, '');
                const fileName = `${customer.date}_${editData.name}_${sanitizedPhone}_${dName}`;

                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'upload',
                        base64: base64,
                        fileName: fileName,
                        mimeType: file.type
                    })
                });

                if (!response.ok) throw new Error('업로드 실패');
                const result = await response.json();

                newDocs[dName] = {
                    url: result.url,
                    name: file.name,
                    uploadedAt: new Date().toISOString().split('T')[0]
                };
            }
            setDocuments(newDocs);
            alert('시공 사진이 업로드 되었습니다.');
        } catch (error) {
            console.error(error);
            alert('사진 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(null);
        }
    };


    const handleDeleteDoc = (docName: string) => {
        const updatedDocs = { ...documents };
        delete updatedDocs[docName];
        setDocuments(updatedDocs);
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 고객 정보를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.')) return;

        setDeleting(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deleteCustomer',
                    type: isGuest ? 'guest_customers' : 'customers',
                    id: customer.id
                })
            });

            if (response.ok) {
                alert('고객 정보가 삭제되었습니다.');
                window.location.reload(); 
            } else {
                throw new Error('Delete failed');
            }
        } catch (err) {
            console.error(err);
            alert('삭제에 실패했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalStatus = status;

            const payload = {
                action: 'update',
                type: isGuest ? 'guest_customers' : 'customers',
                id: String(customer.id || ""),
                status: String(finalStatus || ""),
                remarks: String(remarks || ""),
                documents: JSON.stringify(documents),
                customerName: String(editData.name || ""),
                phone: String(editData.phone || ""),
                amount: String(editData.amount || "0").replace(/,/g, ''),
                downPayment: String(editData.downPayment || "0").replace(/,/g, ''),
                address: String(editData.address || ""),
                months: String(editData.months || "60"),
                transferDate: String(editData.transferDate || "15"),
                birthDate: String(editData.birthDate || ""),
                constructionDate: String(editData.constructionDate || ""),
                ownershipType: String(editData.ownershipType || ""),
                settlement1Date: String(editData.settlement1Date || ""),
                settlement1Amount: String(editData.settlement1Amount || "0").replace(/,/g, ''),
                settlement2Date: String(editData.settlement2Date || ""),
                settlement2Amount: String(editData.settlement2Amount || "0").replace(/,/g, '')
            };

            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.result === 'error') {
                    throw new Error(resData.message || 'Back-end save failed');
                }

                onUpdate({
                    ...customer,
                    status: finalStatus,
                    remarks,
                    documents,
                    name: editData.name,
                    phone: editData.phone,
                    amount: editData.amount,
                    downPayment: editData.downPayment,
                    address: editData.address,
                    months: editData.months,
                    transferDate: editData.transferDate,
                    birthDate: editData.birthDate,
                    constructionDate: editData.constructionDate,
                    ownershipType: editData.ownershipType,
                    settlement1Date: editData.settlement1Date,
                    settlement1Amount: editData.settlement1Amount,
                    settlement2Date: editData.settlement2Date,
                    settlement2Amount: editData.settlement2Amount
                });
                alert('변경사항이 저장되었습니다.');
                onClose();
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || '서버 응답 오류 (HTTP ' + response.status + ')');
            }
        } catch (err: any) {
            console.error('Save error details:', err);
            alert('저장 실패: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(2, 6, 23, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
            padding: '1rem', backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'white', width: '800px', maxWidth: '100%', borderRadius: '1.5rem', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '92vh'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header-container" style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>고객 상세 정보</h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>{editData.name} 고객님의 심사 서류 및 진행 현황입니다.</p>
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
                                gap: '0.4rem'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                        >
                            🔗 고객 화면
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                background: isEditing ? '#f1f5f9' : 'white',
                                color: '#0f172a',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <span>{isEditing ? '✕' : '✎'}</span>
                            {isEditing ? '수정 취소' : '정보 수정'}
                        </button>
                        <button className="close-btn" onClick={onClose} style={{ fontSize: '2rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>&times;</button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="modal-content-container" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    {/* Basic Info Card */}
                    <div className="modal-info-section" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>👤 신청 고객 기본 정보</h3>
                            {getStatusBadge(status)}
                        </div>

                        <div className="modal-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
                            {/* Row 1: Basic Info */}
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>고객명</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 400 }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{editData.name}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>연락처</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 400 }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{editData.phone}</p>
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>생년월일 (YYMMDD-G)</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.birthDate}
                                        placeholder="811115-1"
                                        onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 400 }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{editData.birthDate}</p>
                                )}
                            </div>

                            {/* Row 2: Ownership and Address */}
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>주택 소유 구분</p>
                                {isEditing ? (
                                    <select
                                        value={editData.ownershipType}
                                        onChange={(e) => setEditData({ ...editData, ownershipType: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 400 }}
                                    >
                                        <option value="본인소유">본인소유</option>
                                        <option value="가족소유">가족소유</option>
                                        <option value="이사예정">이사예정</option>
                                        <option value="기타">기타</option>
                                    </select>
                                ) : (
                                    <p style={{ fontWeight: 500, color: '#3b82f6', fontSize: '1rem' }}>{editData.ownershipType || '미지정'}</p>
                                )}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>시공 주소</p>
                                {isEditing ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={editData.address}
                                            readOnly
                                            style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f1f5f9', fontSize: '0.9rem', fontWeight: 400 }}
                                        />
                                        <button
                                            onClick={() => setIsAddressOpen(true)}
                                            style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#3b82f6', color: 'white', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            주소 찾기
                                        </button>
                                    </div>
                                ) : (
                                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-all' }}>{editData.address}</p>
                                )}
                            </div>

                            {/* Row 3: Financial Info Section (Full Width) */}
                            <div className="modal-financial-section" style={{ gridColumn: '1 / -1', background: '#fffbeb', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #fde68a' }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#92400e', marginBottom: '1.25rem', borderBottom: '1px solid #fef3c7', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>💳</span> 결제 / 구독 정보
                                </p>
                                <div className="modal-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'stretch' }}>
                                    {/* Item 1 */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>최종 견적 총액</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.amount}
                                                onChange={(e) => setEditData({ ...editData, amount: e.target.value.replace(/[^0-9,]/g, '') })}
                                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 400 }}
                                            />
                                        ) : (
                                            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{Number(editData.amount.toString().replace(/,/g, '')).toLocaleString()}원</p>
                                        )}
                                    </div>
                                    {/* Item 2 */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>선납금</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.downPayment}
                                                onChange={(e) => setEditData({ ...editData, downPayment: e.target.value.replace(/[^0-9,]/g, '') })}
                                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 400 }}
                                            />
                                        ) : (
                                            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{Number(editData.downPayment.toString().replace(/,/g, '')).toLocaleString()}원</p>
                                        )}
                                    </div>
                                    {/* Item 3: Residual Box */}
                                    <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #fef3c7' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>구독 정산 대상 잔금</p>
                                        <p style={{ fontWeight: 900, color: '#ef4444', fontSize: '1.2rem' }}>
                                            {(() => {
                                                const total = Number(editData.amount.toString().replace(/,/g, ''));
                                                const down = Number(editData.downPayment.toString().replace(/,/g, ''));
                                                return (total - down).toLocaleString();
                                            })()}원
                                        </p>
                                    </div>
                                    {/* Row 2 - Item 4: Monthly Fee Box */}
                                    <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #bfdbfe' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.2rem' }}>월 구독료 (이자 포함)</p>
                                        <p style={{ fontWeight: 900, color: '#2563eb', fontSize: '1.25rem' }}>
                                            {(() => {
                                                const total = Number(editData.amount.toString().replace(/,/g, ''));
                                                const down = Number(editData.downPayment.toString().replace(/,/g, ''));
                                                const remaining = total - down;
                                                const months = parseInt(editData.months);
                                                if (isNaN(months) || months <= 0) return '- ';
                                                const rates: Record<number, number> = { 24: 0.167, 36: 0.176, 48: 0.205, 60: 0.24 };
                                                const rate = rates[months] || 0.24;
                                                const monthlyFee = remaining / (months * (1 - rate));
                                                const truncated = Math.floor(monthlyFee / 100) * 100;
                                                return truncated.toLocaleString();
                                            })()}원
                                        </p>
                                    </div>
                                    {/* Row 2 - Item 5 */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>구독 기간</p>
                                        {isEditing ? (
                                            <select
                                                value={editData.months}
                                                onChange={(e) => setEditData({ ...editData, months: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 400 }}
                                            >
                                                <option value="24">24개월</option>
                                                <option value="36">36개월</option>
                                                <option value="48">48개월</option>
                                                <option value="60">60개월</option>
                                            </select>
                                        ) : (
                                            <p style={{ fontWeight: 800, color: '#0f172a' }}>{editData.months}개월</p>
                                        )}
                                    </div>
                                    {/* Row 2 - Item 6 */}
                                    <div style={{ padding: '0.75rem' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>자동이체 지정일</p>
                                        {isEditing ? (
                                            <select
                                                value={editData.transferDate}
                                                onChange={(e) => setEditData({ ...editData, transferDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #fbbf24', borderRadius: '0.4rem', fontSize: '0.85rem', fontWeight: 400 }}
                                            >
                                                {['5', '10', '15', '20', '25'].map(d => <option key={d} value={d}>매월 {d}일</option>)}
                                            </select>
                                        ) : (
                                            <p style={{ fontWeight: 800, color: '#0f172a' }}>매월 {editData.transferDate}일</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Construction Schedule (Full Width) */}
                            <div className="modal-date-section" style={{ gridColumn: '1 / -1', padding: '1.25rem', background: '#f0fdf4', borderRadius: '1rem', border: '1px solid #bbf7d0' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 900, color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📅</span> 시공 예정일 정보
                                </p>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editData.constructionDate}
                                        onChange={(e) => setEditData({ ...editData, constructionDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #34d399', borderRadius: '0.5rem', background: 'white', fontSize: '1rem', fontWeight: 400 }}
                                    />
                                ) : (
                                    <p style={{ fontWeight: 500, color: '#065f46', fontSize: '1.1rem' }}>
                                        {editData.constructionDate || '미지정 (수정 버튼을 눌러 선택해주세요)'}
                                    </p>
                                )}
                            </div>
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

                    {mode === 'settlement' && (
                        /* Settlement Management Section */
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', borderLeft: '5px solid #10b981' }}>
                                💰 정산 관리
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                {/* 1st Settlement */}
                                <div style={{ padding: '1.5rem', background: '#f0f9ff', borderRadius: '1.25rem', border: '1px solid #bae6fd' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0369a1', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📅</span> 1차 정산 정보
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.4rem' }}>1차 정산 예정일</label>
                                            <input
                                                type="date"
                                                value={editData.settlement1Date}
                                                onChange={(e) => setEditData({ ...editData, settlement1Date: e.target.value })}
                                                disabled={!isAdmin || !isEditing}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '0.6rem', 
                                                    border: '1px solid #bae6fd', 
                                                    borderRadius: '0.5rem', 
                                                    fontSize: '0.9rem', 
                                                    backgroundColor: (!isAdmin || !isEditing) ? '#f8fafc' : 'white',
                                                    color: '#0369a1',
                                                    cursor: (!isAdmin || !isEditing) ? 'default' : 'text'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.4rem' }}>1차 정산 금액</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={Number(editData.settlement1Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setEditData({ ...editData, settlement1Amount: val });
                                                    }}
                                                    disabled={!isAdmin || !isEditing}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.6rem', 
                                                        paddingRight: '2rem', 
                                                        border: '1px solid #bae6fd', 
                                                        borderRadius: '0.5rem', 
                                                        fontSize: '0.9rem', 
                                                        textAlign: 'right', 
                                                        fontWeight: 700, 
                                                        backgroundColor: (!isAdmin || !isEditing) ? '#f8fafc' : 'white',
                                                        color: '#0369a1',
                                                        cursor: (!isAdmin || !isEditing) ? 'default' : 'text'
                                                    }}
                                                />
                                                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#64748b' }}>원</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2nd Settlement */}
                                <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '1.25rem', border: '1px solid #bbf7d0' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#166534', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📅</span> 최종 정산 정보
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>최종 정산 예정일</label>
                                            <input
                                                type="date"
                                                value={editData.settlement2Date}
                                                onChange={(e) => setEditData({ ...editData, settlement2Date: e.target.value })}
                                                disabled={!isAdmin || !isEditing}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '0.6rem', 
                                                    border: '1px solid #bbf7d0', 
                                                    borderRadius: '0.5rem', 
                                                    fontSize: '0.9rem', 
                                                    backgroundColor: (!isAdmin || !isEditing) ? '#f8fafc' : 'white',
                                                    color: '#166534',
                                                    cursor: (!isAdmin || !isEditing) ? 'default' : 'text'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>최종 정산 금액</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={Number(editData.settlement2Amount?.toString().replace(/,/g, '') || 0).toLocaleString()}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        setEditData({ ...editData, settlement2Amount: val });
                                                    }}
                                                    disabled={!isAdmin || !isEditing}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '0.6rem', 
                                                        paddingRight: '2rem', 
                                                        border: '1px solid #bbf7d0', 
                                                        borderRadius: '0.5rem', 
                                                        fontSize: '0.9rem', 
                                                        textAlign: 'right', 
                                                        fontWeight: 700, 
                                                        backgroundColor: (!isAdmin || !isEditing) ? '#f8fafc' : 'white',
                                                        color: '#166534',
                                                        cursor: (!isAdmin || !isEditing) ? 'default' : 'text'
                                                    }}
                                                />
                                                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#64748b' }}>원</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>💬 심사/시공 관련 메모</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.875rem', minHeight: '80px', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="특이사항이나 보완이 필요한 내용을 입력하세요."
                        />
                    </div>
                </div>

                <div className="modal-footer-container" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #ef4444', background: 'white', fontWeight: 800, color: '#ef4444', fontSize: '0.875rem', cursor: 'pointer' }}
                        onClick={handleDelete}
                        disabled={deleting}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                        {deleting ? '처리 중...' : '신청 정보 삭제'}
                    </button>

                    <div className="spacer" style={{ flex: 1 }}></div>

                    <button
                        style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                    <button
                        style={{ padding: '0.875rem 2.5rem', borderRadius: '0.75rem', background: '#3b82f6', fontWeight: 900, color: 'white', border: 'none', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', opacity: (saving || uploading) ? 0.7 : 1 }}
                        onClick={handleSave}
                        disabled={saving || !!uploading}
                    >
                        {saving ? '저장 중...' : '변경 내용 저장하기'}
                    </button>
                </div>
                <style jsx>{`
                    @media (max-width: 1024px) {
                        .modal-header-container { flex-direction: column !important; align-items: stretch !important; padding: 1.25rem !important; }
                        .modal-content-container { padding: 0.75rem !important; }
                        .modal-footer-container { flex-direction: column-reverse !important; gap: 0.75rem !important; padding: 1.25rem !important; }
                        .modal-footer-container .spacer { display: none; }
                        .modal-footer-container button { width: 100% !important; margin: 0 !important; white-space: nowrap !important; word-break: keep-all !important; }
                        
                        .modal-grid-3, .modal-grid-2 { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
                        .modal-grid-3 > div, .modal-grid-2 > div { grid-column: span 1 !important; }
                        
                        .modal-header-actions {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 0.5rem !important;
                            margin-top: 1rem;
                            width: 100%;
                        }
                        .modal-header-actions button {
                            padding: 0.75rem !important;
                            font-size: 0.8rem !important;
                            justify-content: center;
                            white-space: nowrap !important;
                            word-break: keep-all !important;
                        }
                        .modal-header-actions .close-btn { display: none; }

                        .modal-info-section, .modal-financial-section, .modal-doc-section, .modal-date-section {
                            padding: 1.25rem !important;
                            border-radius: 1rem !important;
                            margin-bottom: 1.5rem !important;
                        }
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
                        <DaumPostcodeEmbed
                            onComplete={(data: any) => {
                                setEditData({ ...editData, address: data.address });
                                setIsAddressOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
