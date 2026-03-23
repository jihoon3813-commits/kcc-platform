'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useState, useEffect } from 'react';

const TEMPLATE_KEYS = [
    { id: 'status_agreed', label: '신용동의 완료 안내', description: '고객 상태가 "신용동의"로 변경되었을 때 발송됩니다.' },
    { id: 'status_completed', label: '계약완료 안내', description: '고객 상태가 "계약완료"로 변경되었을 때 발송됩니다.' },
    { id: 'status_failed', label: '진행불가 안내', description: '고객 상태가 "진행불가"로 변경되었을 때 발송됩니다.' },
    { id: 'status_canceled', label: '계약취소 안내', description: '고객 상태가 "계약취소"로 변경되었을 때 발송됩니다.' },
    { id: 'status_construction', label: '시공자료요청 안내', description: '고객 상태가 "시공자료요청"으로 변경되었을 때 발송됩니다.' },
    { id: 'status_recording', label: '녹취완료 안내', description: '고객 상태가 "녹취완료"로 변경되었을 때 발송됩니다.' },
    { id: 'status_settlement1', label: '1차정산완료 안내', description: '고객 상태가 "1차정산완료"로 변경되었을 때 발송됩니다.' },
    { id: 'status_settlement2', label: '최종정산완료 안내', description: '고객 상태가 "최종정산완료"로 변경되었을 때 발송됩니다.' },
];

export default function SmsSettingsPage() {
    const [activeTab, setActiveTab] = useState<'partner' | 'customer'>('partner');
    const [templates, setTemplates] = useState<Record<string, string>>({});
    const [smsLogs, setSmsLogs] = useState<any[]>([]);
    const [aligoConfig, setAligoConfig] = useState({
        apiKey: '',
        userId: '',
        senderNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const CUSTOMER_TEMPLATE_KEYS = [
        { id: 'customer_registration', label: '신규 등록 안내', description: '고객이 시스템에 신규 등록되었을 때 고객에게 발송됩니다.' },
    ];

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getSmsLogs' })
            });
            const data = await res.json();
            if (data.result === 'success') {
                setSmsLogs(data.value || []);
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch existing settings...
                const resTemplates = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getSetting', key: 'sms_templates' })
                });
                const dataTemplates = await resTemplates.json();
                if (dataTemplates.result === 'success' && dataTemplates.value) {
                    setTemplates(dataTemplates.value);
                }

                const resAligo = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getSetting', key: 'aligo_config' })
                });
                const dataAligo = await resAligo.json();
                if (dataAligo.result === 'success' && dataAligo.value) {
                    setAligoConfig(dataAligo.value);
                }
                
                // Initial log fetch
                await fetchLogs();
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();

        // Refresh logs every 10 seconds
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res1 = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateSetting', key: 'sms_templates', value: templates })
            });
            const data1 = await res1.json();

            const res2 = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateSetting', key: 'aligo_config', value: aligoConfig })
            });
            const data2 = await res2.json();

            if ((res1.ok && (data1.success || data1.result === 'success')) && 
                (res2.ok && (data2.success || data2.result === 'success'))) {
                setLastSaved(new Date().toLocaleTimeString());
                alert('설정이 성공적으로 저장되었습니다.');
            } else {
                const msg = data1.message || data2.message || '저장 중 오류가 발생했습니다.';
                alert(`저장 실패: ${msg}`);
            }
        } catch (error) {
            console.error(error);
            alert('네트워크 오류 또는 서버 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };
    const handleTestSms = async () => {
        const receiver = prompt('테스트 문자를 수신할 핸드폰 번호를 입력하세요 (예: 01012345678)');
        if (!receiver) return;
        
        const message = prompt('테스트 메시지를 입력하세요', '알리고 SMS 연동 테스트 메시지입니다.');
        if (!message) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'testSms', receiver, message })
            });
            const data = await res.json();
            
            if (data.result_code === '1') {
                alert('테스트 문자가 성공적으로 발송되었습니다.');
            } else {
                alert(`발송 실패: ${data.message} (코드: ${data.result_code})`);
            }
        } catch (err) {
            console.error(err);
            alert('테스트 발송 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>데이터 로딩 중...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <AdminSidebar />
            <main style={{ flex: 1, marginLeft: '260px', padding: '2.5rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem' 
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                            SMS 설정
                        </h1>
                        <p style={{ color: '#64748b' }}>
                            상태값 변경 시 발송되는 SMS 문구 및 알리고 API를 설정합니다.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <button 
                            onClick={handleTestSms}
                            disabled={isSaving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.75rem',
                                backgroundColor: '#64748b',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            테스트 문자 발송
                        </button>
                        <div>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.75rem',
                                    backgroundColor: '#0046AD',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? '저장 중...' : '변경사항 저장하기'}
                            </button>
                            {lastSaved && (
                                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                                    ✓ {lastSaved}에 저장됨
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 알리고 API 설정 */}
                <section style={{ 
                    backgroundColor: 'white', 
                    padding: '2rem', 
                    borderRadius: '1.25rem', 
                    border: '1px solid #e2e8f0',
                    marginBottom: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔗</span> 알리고(Aligo) API 설정
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>API Key</label>
                            <input 
                                type="password"
                                value={aligoConfig.apiKey}
                                onChange={(e) => setAligoConfig({ ...aligoConfig, apiKey: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="Aligo API Key"
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>UserID</label>
                            <input 
                                type="text"
                                value={aligoConfig.userId}
                                onChange={(e) => setAligoConfig({ ...aligoConfig, userId: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="Aligo ID"
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>발신번호</label>
                            <input 
                                type="text"
                                value={aligoConfig.senderNumber}
                                onChange={(e) => setAligoConfig({ ...aligoConfig, senderNumber: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', outline: 'none' }}
                                placeholder="02-XXX-XXXX"
                            />
                        </div>
                    </div>
                </section>

                {/* Tab Menu */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginBottom: '2rem', 
                    borderBottom: '1px solid #e2e8f0',
                    padding: '0 0.5rem'
                }}>
                    <button 
                        onClick={() => setActiveTab('partner')}
                        style={{
                            padding: '1rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: activeTab === 'partner' ? '#0046AD' : '#64748b',
                            borderBottom: activeTab === 'partner' ? '3px solid #0046AD' : '3px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        파트너 대상 SMS 문구 설정
                    </button>
                    <button 
                        onClick={() => setActiveTab('customer')}
                        style={{
                            padding: '1rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: activeTab === 'customer' ? '#0046AD' : '#64748b',
                            borderBottom: activeTab === 'customer' ? '3px solid #0046AD' : '3px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '-1px'
                        }}
                    >
                        고객 대상 SMS 문구 설정
                    </button>
                </div>

                {/* SMS 문구 설정 */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            💬 {activeTab === 'partner' ? '파트너' : '고객'} 대상 SMS 문구 설정
                        </h2>
                        <div style={{ padding: '0.4rem 0.8rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                            가용 변수: #{'{고객명}'}, #{'{파트너명}'}, #{'{ID}'}, {activeTab === 'partner' ? "#{'{최종금액}'}" : "#{'{전용URL}'}"}
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {(activeTab === 'partner' ? TEMPLATE_KEYS : CUSTOMER_TEMPLATE_KEYS).map((t) => (
                            <div key={t.id} style={{ 
                                backgroundColor: 'white', 
                                padding: '1.5rem', 
                                borderRadius: '1.25rem', 
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t.label}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.description}</p>
                                </div>
                                <textarea 
                                    value={templates[t.id] || ''}
                                    onChange={(e) => setTemplates({ ...templates, [t.id]: e.target.value })}
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#fafafa',
                                        color: '#334155',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="발송할 문구를 입력해주세요."
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* SMS 발송 로그 */}
                <section style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            📋 SMS 발송 로그 (최근 50건)
                        </h2>
                        <button 
                            onClick={fetchLogs}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            새로고침
                        </button>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>일시</th>
                                    <th style={{ padding: '1rem' }}>수신번호</th>
                                    <th style={{ padding: '1rem' }}>유형</th>
                                    <th style={{ padding: '1rem' }}>상태</th>
                                    <th style={{ padding: '1rem' }}>결과 메시지</th>
                                </tr>
                            </thead>
                            <tbody>
                                {smsLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>발송 로그가 없습니다.</td>
                                    </tr>
                                ) : (
                                    smsLogs.map((log: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{log.receiver}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '0.4rem', 
                                                    fontSize: '0.75rem',
                                                    backgroundColor: log.type === 'registration' ? '#e0f2fe' : '#f1f5f9',
                                                    color: log.type === 'registration' ? '#0369a1' : '#64748b'
                                                }}>
                                                    {log.type === 'registration' ? '신규등록' : log.type === 'status' ? '상태변경' : '테스트'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    color: log.resultCode === '1' ? '#10b981' : '#ef4444',
                                                    fontWeight: 700
                                                }}>
                                                    {log.resultCode === '1' ? '성공' : `실패 (${log.resultCode})`}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{log.resultMessage}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .input-group input:focus {
                    border-color: #0046AD !important;
                    box-shadow: 0 0 0 3px rgba(0, 70, 173, 0.1);
                }
                textarea:focus {
                    border-color: #0046AD !important;
                    background-color: white !important;
                    box-shadow: 0 0 0 3px rgba(0, 70, 173, 0.1);
                }
            `}</style>
        </div>
    );
}
