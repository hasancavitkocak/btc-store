export enum CallRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  CUSTOMER_INFORMED = 'CUSTOMER_INFORMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CallRequestActionType {
  CREATED = 'CREATED',
  ASSIGNED_TO_GROUP = 'ASSIGNED_TO_GROUP',
  ASSIGNED_TO_USER = 'ASSIGNED_TO_USER',
  STATUS_CHANGED = 'STATUS_CHANGED',
  EMAIL_SENT = 'EMAIL_SENT',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CallRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject?: string;
  message?: string;
  status: CallRequestStatus;
  assignedGroup?: string;
  assignedUserId?: number;
  assignedUserName?: string;
  completedAt?: string;
  gdprConsent: boolean;
  ipAddress?: string;
  siteId?: number;
  siteCode?: string;
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
}

export interface CallRequestHistory {
  id: number;
  callRequestId: number;
  actionType: CallRequestActionType;
  description?: string;
  performedByUserId?: number;
  performedByUsername?: string;
  oldStatus?: CallRequestStatus;
  newStatus?: CallRequestStatus;
  comment?: string;
  createdDate: string;
}

export const STATUS_LABELS: Record<CallRequestStatus, string> = {
  [CallRequestStatus.PENDING]: 'Beklemede',
  [CallRequestStatus.ASSIGNED]: 'Atandı',
  [CallRequestStatus.IN_PROGRESS]: 'İşlemde',
  [CallRequestStatus.CUSTOMER_INFORMED]: 'Müşteri Bilgilendirildi',
  [CallRequestStatus.COMPLETED]: 'Tamamlandı',
  [CallRequestStatus.CANCELLED]: 'İptal Edildi',
};

export const STATUS_COLORS: Record<CallRequestStatus, string> = {
  [CallRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CallRequestStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
  [CallRequestStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [CallRequestStatus.CUSTOMER_INFORMED]: 'bg-indigo-100 text-indigo-800',
  [CallRequestStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [CallRequestStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export const ACTION_TYPE_LABELS: Record<CallRequestActionType, string> = {
  [CallRequestActionType.CREATED]: 'Oluşturuldu',
  [CallRequestActionType.ASSIGNED_TO_GROUP]: 'Gruba Atandı',
  [CallRequestActionType.ASSIGNED_TO_USER]: 'Kullanıcıya Atandı',
  [CallRequestActionType.STATUS_CHANGED]: 'Durum Değişti',
  [CallRequestActionType.EMAIL_SENT]: 'Mail Gönderildi',
  [CallRequestActionType.COMMENT_ADDED]: 'Yorum Eklendi',
  [CallRequestActionType.COMPLETED]: 'Tamamlandı',
  [CallRequestActionType.CANCELLED]: 'İptal Edildi',
};
