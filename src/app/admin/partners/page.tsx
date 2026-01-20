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

// PartnerDetailModal component
const PartnerDetailModal = ({ partner, onClose }: { partner: Partner; onClose: () => void }) => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }} onClick={onClose}>
            <div style={{ background: '#0f172a', width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.25rem', border: '1px solid #334155', padding: '2rem', color: '#fff' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>파트너 상세 정보</h2>
                <div className="detail-grid">
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>아이디</div>
                    <div style={{ fontSize: '1rem' }}>{partner.id}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>파트너사명</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{partner.name}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>대표자명</div>
                    <div style={{ fontSize: '1rem' }}>{partner.owner}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>연락처</div>
                    <div style={{ fontSize: '1rem' }}>{partner.phone}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>이메일</div>
                    <div style={{ fontSize: '1rem' }}>{partner.email}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>지역</div>
                    <div style={{ fontSize: '1rem' }}>{partner.region}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>주소</div>
                    <div style={{ fontSize: '1rem' }}>{partner.address}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>사업자번호</div>
                    <div style={{ fontSize: '1rem' }}>{partner.bizNum}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>정산계좌</div>
                    <div style={{ fontSize: '1rem' }}>{partner.account}</div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>가입구분</div>
                    <div style={{ fontSize: '1rem' }}>
                        <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: partner.origin === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: partner.origin === 'admin' ? '#3b82f6' : '#10b981',
                            border: `1px solid ${partner.origin === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                        }}>
                            {partner.origin === 'admin' ? '어드민 직접등록' : '신청 요청'}
                        </span>
                    </div>

                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>가입일</div>
                    <div style={{ fontSize: '1rem' }}>{formatDate(partner.joinDate)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#334155', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>닫기</button>
                    {/* <button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>수정</button> */}
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
                        origin: (isRequest ? 'request' : 'admin') as 'request' | 'admin'
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

    return (
        <div className="admin-page-wrapper" style={{ display: 'flex', backgroundColor: '#020617', minHeight: '100vh' }}>
            {loading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #1e293b',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#94a3b8', fontWeight: 700 }}>
                        데이터를 처리 중입니다...
                    </p>
                </div>
            )}
            <AdminSidebar />
            <main className="admin-main-container">
                <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>파트너 관리</h1>
                        <p style={{ color: '#64748b' }}>플랫폼에 등록된 모든 파트너사를 관리합니다. 행을 클릭하면 상세 정보를 확인합니다.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="admin-btn-primary"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        + 신규 파트너 등록
                    </button>
                </header>

                <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div
                        onClick={() => setFilterOrigin('all')}
                        style={{
                            background: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'all' ? '#3b82f6' : '#1e293b'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'all' ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>누적 파트너 수</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{partners.length} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>개사</span></div>
                    </div>
                    <div
                        onClick={() => setFilterOrigin('admin')}
                        style={{
                            background: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'admin' ? '#3b82f6' : '#1e293b'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'admin' ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>어드민 직접 등록</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{partners.filter(p => p.origin === 'admin').length} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>개사</span></div>
                    </div>
                    <div
                        onClick={() => setFilterOrigin('request')}
                        style={{
                            background: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: `2px solid ${filterOrigin === 'request' ? '#10b981' : '#1e293b'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filterOrigin === 'request' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
                        }}
                    >
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>홈페이지 신청 요청</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{partners.filter(p => p.origin === 'request').length} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>건</span></div>
                    </div>
                </div>

                <section style={{ background: '#0f172a', borderRadius: '1.25rem', border: '1px solid #1e293b', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead style={{ background: '#1e293b', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem' }}>아이디</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>구분</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>파트너사명</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>대표자</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>연락처</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>지역</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>가입일</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>로딩 중...</td></tr>
                                ) : filteredPartners.length > 0 ? filteredPartners.map((p, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => setSelectedPartner(p)}
                                        className="hover-row"
                                        style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                                    >
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.id}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                background: p.origin === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: p.origin === 'admin' ? '#3b82f6' : '#10b981',
                                                border: `1px solid ${p.origin === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                            }}>
                                                {p.origin === 'admin' ? '어드민' : '신청'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#fff' }}>{p.name}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.owner}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.phone}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.region}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{formatDate(p.joinDate)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {selectedPartner && (
                    <PartnerDetailModal
                        partner={selectedPartner}
                        onClose={() => setSelectedPartner(null)}
                    />
                )}


                {showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowAddModal(false)}>
                        <div style={{ background: '#0f172a', width: '600px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.25rem', border: '1px solid #334155', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>신규 파트너 등록</h2>
                            <div className="add-modal-grid">
                                <div><label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>아이디(로그인)</label><input type="text" onChange={e => setNewPartner({ ...newPartner, id: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /></div>
                                <div><label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>비밀번호</label><input type="password" onChange={e => setNewPartner({ ...newPartner, password: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /></div>
                                <div><label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>파트너사명</label><input type="text" onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /></div>
                                <div><label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>대표자명</label><input type="text" onChange={e => setNewPartner({ ...newPartner, owner: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#94a3b8', fontSize: '0.75rem' }}>연락처</label><input type="text" onChange={e => setNewPartner({ ...newPartner, phone: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', background: '#334155', color: '#fff', border: 'none', cursor: 'pointer' }}>취소</button>
                                <button onClick={handleCreatePartner} style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>등록하기</button>
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
                    marginBottom: 2rem;
                }

                .add-modal-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0;
                        padding: 1.5rem;
                        padding-bottom: 100px;
                    }
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 640px) {
                    .detail-grid, .add-modal-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
