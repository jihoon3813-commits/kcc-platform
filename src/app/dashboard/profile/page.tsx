'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

interface Partner {
    id: string;
    name: string;
    owner: string;
    phone: string;
    address: string;
    region: string;
    bizNum: string;
    account: string;
    email: string;
    joinDate: string;
    status: string;
}

export default function PartnerProfile() {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [stats, setStats] = useState({ totalSales: 0, settledAmount: 0 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (partnerName: string) => {
        try {
            const response = await fetch('/api/proxy?type=customers');
            const data = await response.json();
            if (Array.isArray(data)) {
                // Filter by partnerName (Column M in Sheet1)
                const myCustomers = data.filter((item: Record<string, string | number>) => item['파트너명'] === partnerName || !item['파트너명']); // Fallback for old data

                let sales = 0;
                let settled = 0;

                myCustomers.forEach((c: Record<string, string | number>) => {
                    const amountString = (c['최종 견적가'] || c['견적금액'] || '0').toString().replace(/,/g, '');
                    const amount = Number(amountString);
                    sales += amount;
                    if (c['상태'] === '정산완료') {
                        settled += amount;
                    }
                });

                setStats({ totalSales: sales, settledAmount: settled });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('kcc_partner');
        if (stored) {
            const p = JSON.parse(stored);
            setPartner({
                ...p,
                status: 'Premium Partner'
            });
            fetchStats(p.name);
        }
        setLoading(false);
    }, []);

    if (loading || !partner) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

    const formatCurrency = (amount: number) => {
        if (amount >= 100000000) {
            const eok = Math.floor(amount / 100000000);
            const man = Math.floor((amount % 100000000) / 10000);
            return `${eok}억 ${man > 0 ? man.toLocaleString() + '만' : ''}원`;
        }
        return `${(amount / 10000).toLocaleString()}만원`;
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-main">
                <header className="mobile-header">
                    <div>
                        <h1 style={{ fontSize: '1.875rem' }}>파트너 정보</h1>
                        <p style={{ color: 'var(--muted)' }}>가입된 파트너사의 상세 정보와 실적을 확인합니다.</p>
                    </div>
                </header>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>
                                👤
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem' }}>{partner.name}</h2>
                                <span style={{ background: '#EBF5FF', color: '#1E40AF', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>
                                    {partner.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <InfoItem label="아이디" value={partner.id} />
                            <InfoItem label="대표자명" value={partner.owner} />
                            <InfoItem label="연락처" value={partner.phone} />
                            <InfoItem label="이메일" value={partner.email} />
                            <InfoItem label="사업자번호" value={partner.bizNum} />
                            <InfoItem label="법인 계좌번호" value={partner.account} />
                            <InfoItem label="사업장 주소" value={partner.address} />
                            <InfoItem label="가입일" value={partner.joinDate || '-'} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>누적 성과 요약</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>누적 매출액</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(stats.totalSales)}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>누적 정산액</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(stats.settledAmount)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>계정 관리</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsEditModalOpen(true)}>파트너 정보 수정</button>
                                <button onClick={() => setIsPasswordModalOpen(true)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#ef4444', fontWeight: 600, background: 'none', cursor: 'pointer' }}>비밀번호 변경</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isEditModalOpen && (
                <EditPartnerModal
                    partner={partner}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(updated) => {
                        const newP = { ...partner, ...updated };
                        setPartner(newP);
                        localStorage.setItem('kcc_partner', JSON.stringify(newP));
                    }}
                />
            )}

            {isPasswordModalOpen && (
                <PasswordModal
                    partnerId={partner.id}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>{label}</p>
            <p style={{ fontWeight: 600, color: '#1e293b' }}>{value}</p>
        </div>
    );
}

function EditPartnerModal({ partner, onClose, onUpdate }: { partner: Partner, onClose: () => void, onUpdate: (p: Partial<Partner>) => void }) {
    const [formData, setFormData] = useState({
        name: partner.name,
        owner: partner.owner,
        phone: partner.phone,
        address: partner.address,
        bizNum: partner.bizNum,
        account: partner.account,
        email: partner.email
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'updatePartner',
                    id: partner.id,
                    ...formData
                })
            });

            if (response.ok) {
                onUpdate(formData);
                alert('정보가 수정되었습니다.');
                onClose();
            }
        } catch (e) {
            console.error(e);
            alert('수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>파트너 정보 수정</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="input-field">
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>파트너명</label>
                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>대표자명</label>
                            <input value={formData.owner} onChange={e => setFormData({ ...formData, owner: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>연락처</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>이메일</label>
                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>사업자번호</label>
                            <input value={formData.bizNum} onChange={e => setFormData({ ...formData, bizNum: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>법인 계좌번호</label>
                            <input value={formData.account} onChange={e => setFormData({ ...formData, account: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>사업장 주소</label>
                        <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: 'white' }} onClick={onClose}>취소</button>
                    <button style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PasswordModal({ partnerId, onClose }: { partnerId: string, onClose: () => void }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않거나 입력되지 않았습니다.');
            return;
        }
        setSaving(true);
        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'changePassword',
                    id: partnerId,
                    newPassword
                })
            });
            if (response.ok) {
                alert('비밀번호가 변경되었습니다.');
                onClose();
            }
        } catch (e) {
            console.error(e);
            alert('비밀번호 변경에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>비밀번호 변경</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>새 비밀번호</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#666' }}>비밀번호 확인</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', background: 'white' }} onClick={onClose}>취소</button>
                    <button style={{ flex: 2, padding: '0.75rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700 }} onClick={handleSave} disabled={saving}>
                        {saving ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </div>
        </div>
    );
}
