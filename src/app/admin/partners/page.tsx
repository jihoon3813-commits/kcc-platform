'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';

interface Partner {
    id: string;
    name: string;
    owner: string;
    phone: string;
    region: string;
    joinDate: string;
    bizNum: string;
    email: string;
    address: string;
    account: string;
    origin: 'admin' | 'request';
    status: string;
}

const formatDate = (val: string) => {
    if (!val || val === '-') return '-';
    try {
        const date = new Date(val);
        if (isNaN(date.getTime())) return val;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return val;
    }
};

const PartnerDetailModal = ({ partner, onClose, onRefresh, onDelete }: { partner: Partner; onClose: () => void; onRefresh: () => void; onDelete: (id: string) => void }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleApprove = async () => {
        if (!confirm('해당 파트너를 승인하시겠습니까? 승인 즉시 파트너 어드민 로그인이 가능해집니다.')) return;
        setIsUpdating(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updatePartner',
                    id: partner.id,
                    status: '정상',
                    joinDate: new Date().toISOString()
                })
            });
            if (res.ok) {
                alert('파트너 승인이 완료되었습니다.');
                onRefresh();
                onClose();
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResetPassword = async () => {
        if (!confirm('비밀번호를 초기비밀번호(1111)로 초기화하시겠습니까?')) return;
        setIsUpdating(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'changePassword',
                    id: partner.id,
                    newPassword: '1111'
                })
            });
            if (res.ok) {
                alert('비밀번호가 1111로 초기화되었습니다.');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: '#fff', width: '800px', maxWidth: '100%', maxHeight: '95vh', overflowY: 'auto', borderRadius: '1.5rem', border: '1px solid #e2e8f0', padding: '2.5rem', color: '#111827', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827' }}>{partner.name}</h2>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '2rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: partner.status === '정상' ? '#ecfdf5' : '#fffbeb',
                                color: partner.status === '정상' ? '#10b981' : '#d97706',
                                border: `1px solid ${partner.status === '정상' ? '#d1fae5' : '#fef3c7'}`
                            }}>
                                {partner.status || '대기'}
                            </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>파트너 고유 ID: <strong style={{color: '#0046AD'}}>{partner.id}</strong></p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => window.open(`/login?id=${partner.id}&auto=true`, '_blank')}
                            style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', background: '#fff', color: '#0046AD', border: '1px solid #0046AD', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            파트너 어드민 바로가기 ↗
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Row 1: Basic & Business Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'stretch' }}>
                        <section style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                기본 정보
                            </h3>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>대표자명</span>
                                    <span style={{ fontWeight: 600 }}>{partner.owner}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>활동지역</span>
                                    <span style={{ fontWeight: 600 }}>{partner.region}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>가입일</span>
                                    <span style={{ fontWeight: 600 }}>{formatDate(partner.joinDate)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>가입구분</span>
                                    <span style={{ fontWeight: 700, color: partner.origin === 'admin' ? '#3b82f6' : '#10b981' }}>
                                        {partner.origin === 'admin' ? '어드민 직접등록' : '홈페이지 신청'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                사업자 및 정산 정보
                            </h3>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>사업자번호</span>
                                    <span style={{ fontWeight: 600 }}>{partner.bizNum}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>정산 계좌</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{partner.account}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Row 2: Contact & Admin Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'stretch' }}>
                        <section style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                연락처 및 주소
                            </h3>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>전화번호</span>
                                    <span style={{ fontWeight: 600 }}>{partner.phone}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>이메일</span>
                                    <span style={{ fontWeight: 600 }}>{partner.email}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>영업소 주소</span>
                                    <span style={{ fontWeight: 500, lineHeight: 1.4, fontSize: '0.9rem' }}>{partner.address}</span>
                                </div>
                            </div>
                        </section>

                        <section style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#dc2626', borderRadius: '2px' }}></span>
                                관리자 전용 기능
                            </h3>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem' }}>
                                {partner.status !== '정상' && (
                                    <button 
                                        disabled={isUpdating}
                                        onClick={handleApprove}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: '#0046AD', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 70, 173, 0.2)' }}
                                    >
                                        ✅ 파트너 최종 승인하기
                                    </button>
                                )}
                                <button 
                                    disabled={isUpdating}
                                    onClick={handleResetPassword}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '1rem', background: '#fff', color: '#dc2626', border: '1px solid #fee2e2', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    🔑 비밀번호 초기화 (1111)
                                </button>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>승인 시 파트너에게 알림이 전송되지 않으므로 개별 연락 바랍니다.</p>
                                <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                    <button
                                        onClick={() => {
                                            if (confirm('정말로 이 파트너사를 삭제하시겠습니까? 관련 데이터는 유지되나 로그인이 불가능해집니다.')) {
                                                onDelete(partner.id);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '1rem', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', fontWeight: 700, opacity: 0.8 }}
                                    >
                                        🗑️ 파트너 영구 삭제
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                    <button onClick={onClose} style={{ padding: '0.875rem 4rem', borderRadius: '2rem', background: '#1e293b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>닫기</button>
                </div>
            </div>
        </div>
    );
};


export default function AdminPartnerManagement() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [filterOrigin, setFilterOrigin] = useState<'all' | 'admin' | 'request'>('all');
    const [newPartner, setNewPartner] = useState({
        id: '', password: '', name: '', owner: '', phone: '', address: '', region: '', bizNum: '', account: '', email: ''
    });

    const filteredPartners = filterOrigin === 'all' ? partners : partners.filter(p => p.origin === filterOrigin);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/proxy?type=partners');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Filter out guest/test partner from the list
                const validData = data.filter((p: any) => {
                    const pid = p['파트너 ID'] || p['아이디'] || p['ID'] || p['id'] || '';
                    return pid !== 'guest_demo';
                });

                // More robust mapping logic with expanded keywords (including '법인계좌', '활동지역' etc)
                const mapped = validData.map((p: any) => {
                    const find = (...keys: string[]) => {
                        for (const key of keys) {
                            const trimmedKey = key.trim();
                            if (p[trimmedKey] !== undefined && p[trimmedKey] !== null && p[trimmedKey] !== '') {
                                return p[trimmedKey].toString();
                            }
                        }
                        return '-';
                    };

                    const id = find('파트너 ID', '아이디', 'ID', 'id', 'Id', '아이디(ID)');
                    const originVal = find('구분', 'origin', 'type', '가입구분');
                    const isRequest = originVal.toLowerCase().includes('request') || id.toString().toLowerCase().startsWith('req_');

                    return {
                        id,
                        name: find('파트너명', '파트너', '업체명', 'name', 'Name'),
                        owner: find('대표명', '대표자명', '대표자', '대표', 'owner'),
                        phone: find('연락처', '휴대폰', '전화번호', 'phone', '연락처(휴대폰)'),
                        region: find('시공지역', '지역', '활동지역', 'region', 'Region'),
                        joinDate: find('가입일', '가입일시', '등록일', '등록일시', '날짜'),
                        bizNum: find('사업자번호', '사업자', '사업자등록번호', 'bizNum'),
                        email: find('이메일', 'email', 'Email', '메일주소'),
                        address: find('주소', 'address', 'Address', '영업소주소'),
                        account: find('법인계좌', '계좌번호', '정산계좌', '계좌', '입금계좌'),
                        origin: (isRequest ? 'request' : 'admin') as 'request' | 'admin',
                        status: p.status || (isRequest ? '승인대기' : '정상')
                    };
                });
                setPartners(mapped.reverse());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleCreatePartner = async () => {
        if (!newPartner.id || !newPartner.password || !newPartner.name) {
            alert('필수 정보를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'createPartner', ...newPartner, origin: 'admin' })
            });
            if (res.ok) {
                alert('파트너가 성공적으로 등록되었습니다.');
                setShowAddModal(false);
                fetchPartners();
            }
        } catch (err) {
            alert('등록 실패');
        }
    };

    const handleDeletePartner = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'deletePartner', id })
            });
            const data = await res.json();
            if (res.ok && data.result === 'success') {
                alert('파트너사가 성공적으로 삭제되었습니다.');
                setSelectedPartner(null);
                fetchPartners();
            } else {
                alert(`삭제 실패: ${data.message || '알 수 없는 오류'}`);
            }
        } catch (err) {
            console.error(err);
            alert('삭제 과정에서 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#1e293b', overflowX: 'hidden', width: '100%' }}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#0046AD',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#111827', fontWeight: 700 }}>
                        데이터를 처리 중입니다...
                    </p>
                </div>
            )}
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
                <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827' }}>파트너 관리</h1>
                        <p style={{ color: '#64748b' }}>플랫폼에 등록된 모든 파트너사를 관리합니다. 행을 클릭하면 상세 정보를 확인합니다.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => fetchPartners()}
                            disabled={loading}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '0.75rem',
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                color: '#475569',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                gap: '0.5rem',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <span style={{
                                animation: loading ? 'spin 1.5s linear infinite' : 'none',
                                display: 'inline-block',
                                fontSize: '1.1rem'
                            }}>🔄</span>
                            새로고침
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="admin-btn-primary"
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#0046AD', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0, 70, 173, 0.2)' }}
                        >
                            + 신규 파트너 등록
                        </button>
                    </div>
                </header>

                <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div
                        onClick={() => setFilterOrigin('all')}
                        style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'all' ? '#0046AD' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'all' ? '0 4px 15px rgba(0, 70, 173, 0.1)' : 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>누적 파트너 수</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{partners.length} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}>개사</span></div>
                    </div>
                    <div
                        onClick={() => setFilterOrigin('admin')}
                        style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'admin' ? '#0046AD' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'admin' ? '0 4px 15px rgba(0, 70, 173, 0.1)' : 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>어드민 직접 등록</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0046AD' }}>{partners.filter(p => p.origin === 'admin').length} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}>개사</span></div>
                    </div>
                    <div
                        onClick={() => setFilterOrigin('request')}
                        style={{
                            background: '#fff',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'request' ? '#10b981' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'request' ? '0 4px 15px rgba(16, 185, 129, 0.1)' : 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>홈페이지 신청 요청</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{partners.filter(p => p.origin === 'request').length} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 400 }}>건</span></div>
                    </div>
                </div>

                <section style={{ 
                    background: '#fff', 
                    borderRadius: '1.25rem', 
                    border: '1px solid #e2e8f0', 
                    overflowX: 'auto', 
                    boxShadow: 'var(--shadow-sm)',
                    width: '100%'
                }}>
                    <div style={{ width: '100%', minWidth: 'min-content' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                            <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>아이디</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>구분</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>상태</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>파트너사명</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>대표자</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>연락처</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>지역</th>
                                    <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>가입일</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#475569', fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center' }}>로딩 중...</td></tr>
                                ) : filteredPartners.length > 0 ? filteredPartners.map((p, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => setSelectedPartner(p)}
                                        className="hover-row"
                                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', whiteSpace: 'nowrap' }}>{p.id}</td>
                                        <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: p.origin === 'admin' ? '#eff6ff' : '#ecfdf5',
                                                color: p.origin === 'admin' ? '#3b82f6' : '#10b981',
                                                border: `1px solid ${p.origin === 'admin' ? '#dbeafe' : '#d1fae5'}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {p.origin === 'admin' ? '어드민' : '신청'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: p.status === '정상' ? '#ecfdf5' : '#fffbeb',
                                                color: p.status === '정상' ? '#10b981' : '#d97706',
                                                border: `1px solid ${p.status === '정상' ? '#d1fae5' : '#fef3c7'}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {p.status || '대기'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{p.name}</td>
                                        <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{p.owner}</td>
                                        <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{p.phone}</td>
                                        <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{p.region}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(p.joinDate)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {selectedPartner && (
                    <PartnerDetailModal
                        partner={selectedPartner}
                        onClose={() => setSelectedPartner(null)}
                        onRefresh={() => fetchPartners()}
                        onDelete={handleDeletePartner}
                    />
                )}


                {showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
                        <div style={{ background: '#fff', width: '600px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>신규 파트너 등록</h2>
                            <div className="add-modal-grid">
                                <div><label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>아이디(로그인)</label><input type="text" onChange={e => setNewPartner({ ...newPartner, id: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                                <div><label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>비밀번호</label><input type="password" onChange={e => setNewPartner({ ...newPartner, password: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                                <div><label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>파트너사명</label><input type="text" onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                                <div><label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>대표자명</label><input type="text" onChange={e => setNewPartner({ ...newPartner, owner: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>연락처</label><input type="text" onChange={e => setNewPartner({ ...newPartner, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 700 }}>취소</button>
                                <button onClick={handleCreatePartner} style={{ flex: 2, padding: '0.875rem', borderRadius: '0.75rem', background: '#0046AD', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 70, 173, 0.2)' }}>등록하기</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .admin-main-container {
                    flex: 1;
                    margin-left: 260px;
                    padding: 2.5rem;
                    transition: all 0.3s;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 1rem 2rem;
                    margin-bottom: 2rem;
                }

                .add-modal-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0 !important;
                        padding: 1.5rem !important;
                        padding-bottom: 100px !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        overflow-x: hidden !important;
                    }
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1.5rem;
                    }
                    .page-header > div:last-child {
                        width: 100%;
                    }
                    .page-header > div:last-child button {
                        flex: 1;
                        justify-content: center;
                    }
                }

                @media (max-width: 640px) {
                    .page-header > div:last-child {
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .page-header > div:last-child button {
                        width: 100%;
                    }
                    .detail-grid, .add-modal-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
