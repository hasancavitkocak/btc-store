export enum LegalDocumentType {
  KVKK = 'KVKK',
  GDPR = 'GDPR',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS_OF_USE = 'TERMS_OF_USE',
  COOKIE_POLICY = 'COOKIE_POLICY',
  CONSENT_TEXT = 'CONSENT_TEXT',
}

export interface LocalizedText {
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
}

export interface LegalDocument {
  id: number;
  code: string;
  documentType: LegalDocumentType;
  title: LocalizedText;
  content: LocalizedText;
  shortText: LocalizedText;
  version: string;
  effectiveDate?: string;
  isCurrentVersion: boolean;
  active: boolean;
  siteId?: number;
  siteCode?: string;
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
}
