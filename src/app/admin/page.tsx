'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
interface Partner {
    id: string;
    name: string;
    region: string;
    joinDate: string;
    appCount: number;
    status: '정상' | '정지';
    owner: string;
    phone: string;
    email: string;
    address: string;
    bizNum: string;
    account: string;
}

interface Stats {
    totalPartners: number;
    totalApps: number;
    pendingApproval: number;
    totalAmount: number;
    newDocsCount: number;
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

const PartnerDetailModal = ({ partner, onClose, onDelete, onRefresh }: { partner: Partner; onClose: () => void; onDelete: (id: string) => void; onRefresh: () => void }) => {
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: '#fff', width: '800px', maxWidth: '100%', maxHeight: '95vh', overflowY: 'auto', borderRadius: '1.5rem', border: '1px solid #e2e8f0', color: '#111827', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                
                <div className="modal-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827' }}>{partner.name}</h2>
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
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>파트너 고유 ID: <strong style={{color: '#0046AD'}}>{partner.id}</strong></p>
                    </div>
                    <div className="modal-header-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => window.open(`/login?id=${partner.id}&auto=true`, '_blank')}
                            style={{ padding: '0.6rem 1rem', borderRadius: '0.75rem', background: '#fff', color: '#0046AD', border: '1px solid #0046AD', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                        >
                            파트너 어드민 바로가기 ↗
                        </button>
                        <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}>&times;</button>
                    </div>
                </div>

                <div className="modal-content-container" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Row 1: Basic & Business Info */}
                        <section className="modal-info-section">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                기본 정보
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>대표자명</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.owner}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>활동지역</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.region}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>가입일</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(partner.joinDate)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>정산 계좌</span>
                                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{partner.account}</span>
                                </div>
                            </div>
                        </section>

                        <section className="modal-info-section">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                사업자 정보
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>사업자번호</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.bizNum}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>연락처</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.phone}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>이메일</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.email}</span>
                                </div>
                            </div>
                        </section>

                        {/* Row 2: Location & Admin Actions */}
                        <section className="modal-info-section">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#0046AD', borderRadius: '2px' }}></span>
                                영업소 주소
                            </h3>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                                <span style={{ fontWeight: 500, lineHeight: 1.5, fontSize: '0.875rem', color: '#1e293b' }}>{partner.address}</span>
                            </div>
                        </section>

                        <section className="modal-info-section">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '4px', height: '14px', background: '#ef4444', borderRadius: '2px' }}></span>
                                관리자 권한
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fff1f2', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #ffe4e6' }}>
                                {partner.status !== '정상' && (
                                    <button 
                                        disabled={isUpdating}
                                        onClick={handleApprove}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: '#0046AD', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        승인 처리하기
                                    </button>
                                )}
                                <button 
                                    disabled={isUpdating}
                                    onClick={handleResetPassword}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: '#fff', color: '#dc2626', border: '1px solid #ffe4e6', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    비밀번호 초기화
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('정말로 이 파트너사를 삭제하시겠습니까?')) {
                                            onDelete(partner.id);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', fontWeight: 700, opacity: 0.8 }}
                                >
                                    삭제
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="modal-footer-container" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={onClose} style={{ padding: '0.875rem 3rem', borderRadius: '2rem', background: '#1e293b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}>닫기</button>
                </div>

                <style jsx>{`
                    @media (max-width: 1024px) {
                        .modal-header-container { flex-direction: column !important; align-items: stretch !important; padding: 1.25rem !important; }
                        .modal-content-container { padding: 1rem !important; }
                        .modal-footer-container { padding: 1.25rem !important; }
                        .modal-footer-container button { width: 100% !important; border-radius: 0.75rem !important; }
                        
                        .modal-grid-2 { grid-template-columns: 1fr !important; gap: 1rem !important; }
                        
                        .modal-header-actions {
                            display: grid !important;
                            grid-template-columns: 1fr !important;
                            gap: 0.5rem !important;
                            margin-top: 1rem;
                            width: 100%;
                        }
                        .modal-header-actions button {
                            padding: 0.875rem !important;
                            font-size: 0.85rem !important;
                            justify-content: center;
                            white-space: nowrap !important;
                            word-break: keep-all !important;
                        }
                        .modal-header-actions .close-btn { display: none; }

                        .modal-info-section {
                            background: white !important;
                            border: 1px solid #e2e8f0 !important;
                            padding: 1.25rem !important;
                            border-radius: 1rem !important;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        }
                        .modal-info-section h3 { margin-bottom: 1rem !important; }
                        .modal-info-section > div { padding: 0 !important; background: transparent !important; border: none !important; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalPartners: 0,
        totalApps: 0,
        pendingApproval: 0,
        totalAmount: 0,
        newDocsCount: 0
    });
    const [recentPartners, setRecentPartners] = useState<Partner[]>([]);
    const [notifications, setNotifications] = useState([
        { label: '신용조회 대기', count: 0, color: '#fbbf24' },
        { label: '1차 서류 검수', count: 0, color: '#38bdf8' },
        { label: '최종 승인 대기', count: 0, color: '#10b981' },
        { label: '정산 요청건', count: 0, color: '#818cf8' },
    ]);
    const [regionStats, setRegionStats] = useState([
        { region: '서울/수도권', value: 0 },
        { region: '경기/인천', value: 0 },
        { region: '영남권', value: 0 },
        { region: '호남권', value: 0 },
    ]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [newPartner, setNewPartner] = useState({
        id: '', password: '', name: '', owner: '', phone: '', address: '', region: '', bizNum: '', account: '', email: ''
    });

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([
                fetch('/api/proxy?type=partners'),
                fetch('/api/proxy?type=customers')
            ]);
            const pData = await pRes.json();
            const cData = await cRes.json();

            if (Array.isArray(pData) && Array.isArray(cData)) {
                // Filter out Guest/Test Data to prevent pollution of stats
                const validPartners = pData.filter((p: Record<string, string | number | null>) => {
                    const pid = p['아이디'] || p['id'] || p['ID'] || '';
                    return pid !== 'guest_demo';
                });
                const validCustomers = cData.filter((c: Record<string, string | number | null>) => {
                    const pid = c['파트너ID'] || c['파트너 ID'] || c['partnerId'] || '';
                    return pid !== 'guest_demo';
                });

                const mappedPartners = validPartners.map((p: Record<string, string | number | null>) => {
                    const find = (...keys: string[]) => {
                        for (const k of keys) {
                            if (p[k] !== undefined && p[k] !== null && p[k] !== '') {
                                return p[k]!.toString();
                            }
                        }
                        return '-';
                    };

                    return {
                        id: find('아이디', 'id', 'ID', 'Id', '아이디(ID)'),
                        name: find('파트너명', 'name', 'Name', '파트너', '업체명'),
                        owner: find('대표자명', '대표자', '대표명', 'owner', '대표'),
                        phone: find('연락처', '휴대폰', 'phone', '전화번호', '연락처(휴대폰)', '연락처 '),
                        email: find('이메일', 'email', 'Email', '메일주소'),
                        bizNum: find('사업자번호', '사업자', '사업자등록번호', 'bizNum'),
                        address: find('주소', 'address', 'Address', '영업소주소'),
                        account: find('법인계좌', '계좌번호', '정산계좌', '계좌', '입금계좌'),
                        region: find('지역', 'region', 'Region', '활동위치', '소속지역'),
                        joinDate: find('가입일', '등록일', 'date', 'JoinDate', '생성일', '등록일시'),
                        appCount: validCustomers.filter((c: Record<string, string | number | null>) => c['파트너명'] === (p['파트너명'] || find('파트너명', 'name'))).length,
                        status: '정상' as const
                    };
                });

                const sortedPartners = mappedPartners.sort((a, b) => {
                    const dateA = new Date(a.joinDate).getTime();
                    const dateB = new Date(b.joinDate).getTime();
                    if (dateA !== dateB) return dateB - dateA;
                    return b.id.localeCompare(a.id);
                });
                setRecentPartners(sortedPartners.slice(0, 5));

                const totalAmt = validCustomers.reduce((acc: number, curr: Record<string, string | number | null>) => {
                    const amt = Number(curr['최종 견적가']?.toString().replace(/,/g, '') || curr['견적금액']?.toString().replace(/,/g, '') || 0);
                    return acc + amt;
                }, 0);

                setStats({
                    totalPartners: validPartners.length,
                    totalApps: validCustomers.length,
                    pendingApproval: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '접수' || c['상태'] === '1차승인(추가 서류 등록 必)').length,
                    totalAmount: totalAmt,
                    newDocsCount: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '1차서류 등록완료' || c['상태'] === '최종서류 등록완료').length
                });

                // Calculate real-time notifications
                setNotifications([
                    { label: '신용조회 대기', count: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '접수').length, color: '#fbbf24' },
                    { label: '1차 서류 검수', count: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '1차서류 등록완료').length, color: '#38bdf8' },
                    { label: '최종 승인 대기', count: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '최종서류 등록완료').length, color: '#10b981' },
                    { label: '정산 요청건', count: validCustomers.filter((c: Record<string, string | number | null>) => c['상태'] === '녹취완료/정산대기').length, color: '#818cf8' },
                ]);

                // Calculate region stats (based on address keywords)
                const getCount = (keywords: string[]) =>
                    validCustomers.filter((c: Record<string, string | number | null>) => keywords.some(k => c['주소']?.toString().includes(k))).length;

                const total = validCustomers.length || 1;
                const seoul = getCount(['서울', '세종']);
                const gyeonggi = getCount(['경기', '인천']);
                const yeongnam = getCount(['경북', '경남', '대구', '부산', '울산']);
                const honam = getCount(['전북', '전남', '광주', '제주', '충북', '충남', '대전', '강원']);

                setRegionStats([
                    { region: '서울/세종', value: Math.round((seoul / total) * 100) },
                    { region: '경기/인천', value: Math.round((gyeonggi / total) * 100) },
                    { region: '영남권', value: Math.round((yeongnam / total) * 100) },
                    { region: '호남/기타', value: Math.round((honam / total) * 100) },
                ]);
            }
        } catch {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleCreatePartner = async () => {
        if (!newPartner.id || !newPartner.password || !newPartner.name) {
            alert('필수 정보를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'createPartner', ...newPartner, origin: 'admin' })
            });
            if (res.ok) {
                alert('파트너가 성공적으로 등록되었습니다.');
                setShowAddModal(false);
                setNewPartner({ id: '', password: '', name: '', owner: '', phone: '', address: '', region: '', bizNum: '', account: '', email: '' });
                fetchAdminData();
            }
        } catch {
            alert('등록 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePartner = async (partnerId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({ action: 'deletePartner', id: partnerId })
            });

            if (res.ok) {
                alert('파트너사가 삭제되었습니다.');
                setSelectedPartner(null);
                fetchAdminData();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch {
            alert('삭제 중 오류가 발생했습니다.');
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
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.125rem', color: '#1e293b', fontWeight: 700, letterSpacing: '-0.025em' }}>
                        관리 데이터를 불러오는 중입니다...
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
                {/* Header */}
                <header className="admin-header">
                    <div className="header-title-section">
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', wordBreak: 'keep-all' }}>총괄 관리 대시보드</h1>
                        <p style={{ color: '#64748b' }}>플랫폼의 전체 운영 현황과 파트너 실적을 관리합니다.</p>
                    </div>
                    <div className="header-action-section">
                        <button
                            onClick={() => fetchAdminData()}
                            disabled={loading}
                            className="refresh-btn"
                        >
                            <span style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none', display: 'inline-block' }}>🔄</span>
                            새로고침
                        </button>
                        <button className="report-btn">보고서 다운로드</button>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="stats-grid" style={{ marginBottom: '3rem' }}>
                    {[
                        { label: '누적 파트너사', value: `${stats.totalPartners.toLocaleString()}개`, icon: '🏢', color: '#0ea5e9', link: '/admin/partners' },
                        { label: '누적 신청 건수', value: `${stats.totalApps.toLocaleString()}건`, icon: '📝', color: '#6366f1', link: '/admin/customers' },
                        { label: '승인 대기', value: `${stats.pendingApproval}건`, icon: '⏳', color: '#d97706', link: '/admin/customers?filter=pending' },
                        { label: '누적 매출액', value: `${(stats.totalAmount / 100000000).toFixed(1)}억`, icon: '💎', color: '#059669', link: '/admin/settlement' },
                        {
                            label: '신규등록 서류',
                            value: `${stats.newDocsCount}건`,
                            icon: '📂',
                            color: '#dc2626',
                            link: '/admin/customers?filter=pending_docs',
                            isSpecial: true
                        },
                    ].map((s, i) => (
                        <div key={i}
                            onClick={() => s.link && router.push(s.link)}
                            style={{
                                background: '#ffffff',
                                padding: '1.5rem',
                                borderRadius: '1.25rem',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                cursor: s.link ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                boxShadow: s.isSpecial ? '0 0 15px rgba(239, 68, 68, 0.05)' : 'var(--shadow-sm)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="stat-card"
                        >
                            {s.isSpecial && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>{s.label}</span>
                                <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</h2>
                        </div>
                    ))}
                </section>

                {/* Main Content Area */}
                <div className="dashboard-content-grid">
                    {/* Partner Table Section */}
                    <section style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827' }}>전국 파트너사 현황</h3>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#0046AD', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                신규 파트너 등록
                            </button>
                        </div>
                        <div className="desktop-only-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                            <div style={{ width: '100%', minWidth: 'min-content' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                                <thead style={{ background: '#f8fafc', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>파트너사명</th>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>지역</th>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>누적 신청</th>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>가입일</th>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>상태</th>
                                        <th style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody style={{ color: '#475569', fontSize: '0.875rem' }}>
                                    {recentPartners.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>등록된 파트너사가 없습니다.</td>
                                        </tr>
                                    ) : recentPartners.map((p, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>{p.name}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{p.region}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/customers?partnerName=${encodeURIComponent(p.name)}`);
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: '#0046AD', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: 'inherit', whiteSpace: 'nowrap' }}
                                                >
                                                    {p.appCount}건
                                                </button>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>{formatDate(p.joinDate)}</td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    color: p.status === '정상' ? '#059669' : '#dc2626',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.status === '정상' ? '#10b981' : '#ef4444' }}></span>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPartner(p);
                                                    }}
                                                    style={{ color: '#0046AD', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                    설정
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="mobile-cards-container" style={{ display: 'none', padding: '1rem', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
                            {recentPartners.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>등록된 파트너사가 없습니다.</div>
                            ) : recentPartners.map((p, i) => (
                                <div key={i} className="partner-card" onClick={() => setSelectedPartner(p)} style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>{p.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.region}</span>
                                        </div>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            background: p.status === '정상' ? '#ecfdf5' : '#fffbeb',
                                            color: p.status === '정상' ? '#10b981' : '#d97706',
                                            border: `1px solid ${p.status === '정상' ? '#d1fae5' : '#fef3c7'}`
                                        }}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.2rem' }}>누적 신청</span>
                                            <span style={{ fontWeight: 800, color: '#0046AD' }}>{p.appCount}건</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.2rem' }}>가입일</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{formatDate(p.joinDate)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/admin/customers?partnerName=${encodeURIComponent(p.name)}`);
                                            }}
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}
                                        >
                                            신청목록
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPartner(p);
                                            }}
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: '#0046AD', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}
                                        >
                                            상세설정
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Bottle-neck Monitoring Section */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🔔 즉시 업무 알림
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.map((n, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{n.label}</span>
                                        <span style={{ color: n.color, fontWeight: 800, fontSize: '1rem' }}>{n.count}건</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>지역별 신청 현황</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {regionStats.map((r, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', color: '#64748b' }}>
                                            <span>{r.region}</span>
                                            <span>{r.value}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${r.value}%`, height: '100%', background: '#0046AD' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Modals */}
            {selectedPartner && (
                <PartnerDetailModal
                    partner={selectedPartner}
                    onClose={() => setSelectedPartner(null)}
                    onDelete={handleDeletePartner}
                    onRefresh={fetchAdminData}
                />
            )}

            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
                    <div style={{ background: '#ffffff', width: '600px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>신규 파트너 등록</h2>
                        <div className="add-modal-grid">
                            <div><label style={{ color: '#64748b', fontSize: '0.75rem' }}>아이디(로그인)</label><input type="text" value={newPartner.id} onChange={e => setNewPartner({ ...newPartner, id: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                            <div><label style={{ color: '#64748b', fontSize: '0.75rem' }}>비밀번호</label><input type="password" value={newPartner.password} onChange={e => setNewPartner({ ...newPartner, password: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                            <div><label style={{ color: '#64748b', fontSize: '0.75rem' }}>파트너사명</label><input type="text" value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                            <div><label style={{ color: '#64748b', fontSize: '0.75rem' }}>대표자명</label><input type="text" value={newPartner.owner} onChange={e => setNewPartner({ ...newPartner, owner: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                            <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#64748b', fontSize: '0.75rem' }}>연락처</label><input type="text" value={newPartner.phone} onChange={e => setNewPartner({ ...newPartner, phone: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#111827' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>취소</button>
                            <button onClick={handleCreatePartner} style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: '#0046AD', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>등록하기</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
    .admin-main-container {
        flex: 1;
        margin-left: 260px;
        padding: 2.5rem;
        transition: all 0.3s;
        width: calc(100% - 260px);
        min-width: 0;
    }

    .admin-header {
        margin-bottom: 3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
    }

    .header-action-section {
        display: flex;
        gap: 1rem;
        flex-shrink: 0;
    }

    .refresh-btn {
        padding: 0.75rem 1.5rem;
        borderRadius: 0.75rem;
        background: #ffffff;
        color: #475569;
        border: 1px solid #e2e8f0;
        fontWeight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        box-shadow: var(--shadow-sm);
    }

    .refresh-btn:hover {
        background: #f8fafc;
        transform: translateY(-1px);
    }

    .report-btn {
        padding: 0.75rem 1.5rem;
        borderRadius: 0.75rem;
        background: #0046AD;
        color: #fff;
        border: none;
        fontWeight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 10px -2px rgba(0, 70, 173, 0.3);
    }

    .report-btn:hover {
        background: #003380;
        transform: translateY(-1px);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1.5rem;
    }

    .stat-card:hover {
        transform: translateY(-5px);
        border-color: #0046AD40 !important;
        box-shadow: var(--shadow-lg) !important;
    }

    .dashboard-content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .add-modal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem 2rem;
        margin-bottom: 2rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @media (max-width: 1280px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 1024px) {
        .admin-main-container {
            margin-left: 0 !important;
            padding: 1.25rem !important;
            padding-bottom: 100px !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
        }
        .dashboard-content-grid {
            grid-template-columns: 1fr !important;
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
            padding: 0.875rem 0.25rem !important;
            font-size: 0.8rem !important;
        }
        .desktop-only-table { display: none !important; }
        .mobile-cards-container { 
            display: flex !important; 
            padding: 0 !important;
            background: transparent !important;
        }
        
        .partner-card {
            background: white;
            border-radius: 1.25rem;
            border: 1px solid #e2e8f0;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);
            border-left: 5px solid #0046AD;
            margin-bottom: 1rem;
        }
        .partner-card:active { transform: scale(0.98); }
    }

    @media (max-width: 640px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
        .header-action-section {
            width: 100%;
            flex-direction: column;
            gap: 0.75rem;
        }
        .refresh-btn, .report-btn {
            width: 100%;
            justify-content: center;
            padding: 0.875rem;
        }
    }
`}</style>
        </div>
    );
}
