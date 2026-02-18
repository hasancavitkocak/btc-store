export enum CallRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  CUSTOMER_INFORMED = 'CUSTOMER_INFORMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export enum CallRequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum CallRequestActionType {
  CREATED = 'CREATED',
  ASSIGNED_TO_GROUP = 'ASSIGNED_TO_GROUP',
  ASSIGNED_TO_USER = 'ASSIGNED_TO_USER',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  EMAIL_SENT = 'EMAIL_SENT',
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface LocalizedDescription {
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
}

export interface AssignedGroupInfo {
  code: string;
  name: string; // Default name (usually Turkish)
  description?: LocalizedDescription; // All language descriptions
}

export interface AssignedUserInfo {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface CallRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject?: string;
  message?: string;
  priority: CallRequestPriority;
  status: CallRequestStatus;
  
  // Multi-assign fields (detailed)
  assignedGroupsList?: AssignedGroupInfo[];
  assignedUsersList?: AssignedUserInfo[];
  
  // Simple representations (backward compatibility)
  assignedGroups?: string; // Semicolon separated
  assignedUserNames?: string[]; // Array of usernames
  
  // Deprecated fields (backward compatibility)
  assignedGroup?: string;
  assignedUserId?: number;
  assignedUserName?: string;
  assignedUserIds?: number[];
  
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
  [CallRequestStatus.CLOSED]: 'Kapatıldı',
};

export const PRIORITY_LABELS: Record<CallRequestPriority, string> = {
  [CallRequestPriority.LOW]: 'Düşük',
  [CallRequestPriority.MEDIUM]: 'Orta',
  [CallRequestPriority.HIGH]: 'Yüksek',
  [CallRequestPriority.URGENT]: 'Acil',
};

export const STATUS_COLORS: Record<CallRequestStatus, string> = {
  [CallRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CallRequestStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
  [CallRequestStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [CallRequestStatus.CUSTOMER_INFORMED]: 'bg-indigo-100 text-indigo-800',
  [CallRequestStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [CallRequestStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [CallRequestStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

export const PRIORITY_COLORS: Record<CallRequestPriority, string> = {
  [CallRequestPriority.LOW]: 'bg-gray-100 text-gray-700',
  [CallRequestPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
  [CallRequestPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [CallRequestPriority.URGENT]: 'bg-red-100 text-red-700',
};

export const ACTION_TYPE_LABELS: Record<CallRequestActionType, string> = {
  [CallRequestActionType.CREATED]: 'Oluşturuldu',
  [CallRequestActionType.ASSIGNED_TO_GROUP]: 'Gruba Atandı',
  [CallRequestActionType.ASSIGNED_TO_USER]: 'Kullanıcıya Atandı',
  [CallRequestActionType.STATUS_CHANGED]: 'Durum Değişti',
  [CallRequestActionType.PRIORITY_CHANGED]: 'Öncelik Değişti',
  [CallRequestActionType.EMAIL_SENT]: 'Mail Gönderildi',
  [CallRequestActionType.COMMENT_ADDED]: 'Yorum Eklendi',
  [CallRequestActionType.COMPLETED]: 'Tamamlandı',
  [CallRequestActionType.CANCELLED]: 'İptal Edildi',
};
