export type Status =
    | '등록완료'
    | '신용동의'
    | '계약완료'
    | '진행불가'
    | '계약취소'
    | '시공자료요청'
    | '녹취완료'
    | '1차정산완료'
    | '최종정산완료';

export interface AuditDocument {
    name: string;
    type?: string;
    uploadedAt: string;
    url?: string;
}

export interface Customer {
    id: string | number;
    name: string;
    phone: string;
    birthDate: string;
    address: string;
    amount: string;
    downPayment: string;
    months: string;
    transferDate: string;
    constructionDate: string;
    date: string;
    status: Status;
    remarks: string;
    documents: Record<string, AuditDocument>;
    ownershipType?: string;
    statusUpdatedAt?: string;
    contractDate?: string;
    recordingDate?: string;
    settlement1Date?: string;
    settlement1Amount?: string;
    settlement2Date?: string;
    settlement2Amount?: string;
    partnerName?: string;
    createdAt?: number;
    updatedAt?: number;
    lastUpdateType?: string;
    isGuest?: boolean;
}
