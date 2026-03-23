'react';
import { Status } from '@/types/customer';

export const getStatusColor = (status: Status) => {
    switch (status) {
        case '1차정산완료':
        case '최종정산완료': return '#059669';
        case '등록완료': return '#475569';
        case '신용동의':
        case '녹취완료': return '#0046AD';
        case '진행불가':
        case '계약취소': return '#ef4444';
        case '계약완료': return '#d97706';
        case '시공자료요청': return '#7c3aed';
        default: return '#4B5563';
    }
};

export const getStatusBadge = (status: Status, statusUpdatedAt?: string) => {
    let color = '#4B5563';
    let bg = '#F3F4F6';

    switch (status) {
        case '1차정산완료':
        case '최종정산완료':
            color = '#059669';
            bg = '#D1FAE5';
            break;
        case '등록완료':
            color = '#475569';
            bg = '#f1f5f9';
            break;
        case '신용동의':
        case '녹취완료':
            color = '#0046AD';
            bg = '#f0f9ff';
            break;
        case '진행불가':
        case '계약취소':
            color = '#ef4444';
            bg = '#fef2f2';
            break;
        case '계약완료':
            color = '#d97706';
            bg = '#fffbeb';
            break;
        case '시공자료요청':
            color = '#7c3aed';
            bg = '#f5f3ff';
            break;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: bg,
                color: color,
                whiteSpace: 'nowrap'
            }}>
                {status}
            </span>
            {statusUpdatedAt && (
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>
                    {statusUpdatedAt}
                </span>
            )}
        </div>
    );
};
