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
    appCount: number;
    status: '정상' | '정지';
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

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Partners
                const pRes = await fetch('/api/proxy?type=partners');
                const pData = await pRes.json();

                // 2. Fetch Customers for stats
                const cRes = await fetch('/api/proxy?type=customers');
                const cData = await cRes.json();

                // 3. Filter out Guest/Test Data to prevent pollution of stats
                const validPartners = Array.isArray(pData) ? pData.filter((p: any) => {
                    const pid = p['아이디'] || p['id'] || p['ID'] || '';
                    return pid !== 'guest_demo';
                }) : [];

                const validCustomers = Array.isArray(cData) ? cData.filter((c: any) => {
                    const pid = c['파트너ID'] || c['파트너 ID'] || c['partnerId'] || '';
                    return pid !== 'guest_demo';
                }) : [];

                if (Array.isArray(pData)) {
                    const mappedPartners = validPartners.map((p: any) => {
                        const find = (...keys: string[]) => {
                            for (const key of keys) {
                                if (p[key] !== undefined && p[key] !== null && p[key] !== '') {
                                    return p[key].toString();
                                }
                            }
                            return '-';
                        };

                        return {
                            id: find('아이디', 'id', 'ID', 'Id', '아이디(ID)'),
                            name: find('파트너명', 'name', 'Name', '파트너', '업체명'),
                            owner: find('대표자명', '대표자', '대표명', 'owner', '대표'),
                            phone: find('연락처', '휴대폰', 'phone', '전화번호', '연락처(휴대폰)', '연락처 '),
                            region: find('지역', 'region', 'Region', '활동위치', '소속지역'),
                            joinDate: find('가입일', '등록일', 'date', 'JoinDate', '생성일', '등록일시'),
                            appCount: validCustomers.filter((c: any) => c['파트너명'] === (p['파트너명'] || find('파트너명', 'name'))).length,
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
                }

                if (Array.isArray(cData)) {
                    const totalAmt = validCustomers.reduce((acc: number, curr: any) => {
                        const amt = Number(curr['최종 견적가']?.toString().replace(/,/g, '') || curr['견적금액']?.toString().replace(/,/g, '') || 0);
                        return acc + amt;
                    }, 0);

                    setStats({
                        totalPartners: validPartners.length,
                        totalApps: validCustomers.length,
                        pendingApproval: validCustomers.filter((c: any) => c['상태'] === '접수' || c['상태'] === '1차승인(추가 서류 등록 必)').length,
                        totalAmount: totalAmt,
                        newDocsCount: validCustomers.filter((c: any) => c['상태'] === '1차서류 등록완료' || c['상태'] === '최종서류 등록완료').length
                    });

                    // Calculate real-time notifications
                    setNotifications([
                        { label: '신용조회 대기', count: validCustomers.filter((c: any) => c['상태'] === '접수').length, color: '#fbbf24' },
                        { label: '1차 서류 검수', count: validCustomers.filter((c: any) => c['상태'] === '1차서류 등록완료').length, color: '#38bdf8' },
                        { label: '최종 승인 대기', count: validCustomers.filter((c: any) => c['상태'] === '최종서류 등록완료').length, color: '#10b981' },
                        { label: '정산 요청건', count: validCustomers.filter((c: any) => c['상태'] === '녹취완료/정산대기').length, color: '#818cf8' },
                    ]);

                    // Calculate region stats (based on address keywords)
                    const getCount = (keywords: string[]) =>
                        validCustomers.filter((c: any) => keywords.some(k => c['주소']?.includes(k))).length;

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
            } catch (err) {
                console.error('Failed to fetch admin data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    return (
        <div className="admin-page-wrapper" style={{ display: 'flex', backgroundColor: '#020617', minHeight: '100vh' }}>
            <AdminSidebar />
            <main className="admin-main-container">
                {/* Header */}
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                        <p style={{ color: '#64748b' }}>플랫폼의 전체 운영 현황과 파트너 실적을 관리합니다.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', fontWeight: 600, cursor: 'pointer' }}>보고서 다운로드</button>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="stats-grid" style={{ marginBottom: '3rem' }}>
                    {[
                        { label: '누적 파트너사', value: `${stats.totalPartners.toLocaleString()}개`, icon: '🏢', color: '#38bdf8' },
                        { label: '누적 신청 건수', value: `${stats.totalApps.toLocaleString()}건`, icon: '📝', color: '#818cf8' },
                        { label: '승인 대기', value: `${stats.pendingApproval}건`, icon: '⏳', color: '#fbbf24' },
                        { label: '누적 매출액', value: `${(stats.totalAmount / 100000000).toFixed(1)}억`, icon: '💎', color: '#10b981' },
                        {
                            label: '신규등록 서류',
                            value: `${stats.newDocsCount}건`,
                            icon: '📂',
                            color: '#ef4444',
                            link: '/admin/customers?filter=pending_docs',
                            isSpecial: true
                        },
                    ].map((s, i) => (
                        <div key={i}
                            onClick={() => s.link && (window.location.href = s.link)}
                            style={{
                                background: '#0f172a',
                                padding: '1.5rem',
                                borderRadius: '1.25rem',
                                border: '1px solid #1e293b',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                cursor: s.link ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                boxShadow: s.isSpecial ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
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
                    <section style={{ background: '#0f172a', borderRadius: '1.25rem', border: '1px solid #1e293b', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>전국 파트너사 현황</h3>
                            <button style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>신규 파트너 등록</button>
                        </div>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                                <thead style={{ background: '#1e293b', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem' }}>파트너사명</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>지역</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>누적 신청</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>가입일</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>상태</th>
                                        <th style={{ padding: '1rem 1.5rem' }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                                    {recentPartners.map((p, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#fff' }}>{p.name}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>{p.region}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>{p.appCount}건</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>{formatDate(p.joinDate)}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    color: p.status === '정상' ? '#10b981' : '#ef4444',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.status === '정상' ? '#10b981' : '#ef4444' }}></span>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <button style={{ color: '#38bdf8', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>설정</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Bottle-neck Monitoring Section */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #1e293b' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🔔 즉시 업무 알림
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {notifications.map((n, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: '#1e293b', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>{n.label}</span>
                                        <span style={{ color: n.color, fontWeight: 800, fontSize: '1rem' }}>{n.count}건</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #1e293b', flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>지역별 신청 현황</h3>
                            {/* Simple Bar Chart Placeholder */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {regionStats.map((r, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', color: '#94a3b8' }}>
                                            <span>{r.region}</span>
                                            <span>{r.value}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${r.value}%`, height: '100%', background: '#38bdf8' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx>{`
                .admin-main-container {
                    flex: 1;
                    margin-left: 260px;
                    padding: 2.5rem;
                    transition: all 0.3s;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1.5rem;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    border-color: #3b82f640 !important;
                    background: #1e293b !important;
                }

                .dashboard-content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 1280px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 1024px) {
                    .admin-main-container {
                        margin-left: 0;
                        padding: 1.5rem;
                        padding-bottom: 100px;
                    }
                    .dashboard-content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1.5rem;
                        margin-bottom: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
