export interface LocalizeData {
  taskStep: boolean;
  tr?: string;
  en?: string;
  de?: string;
  fr?: string;
  es?: string;
  it?: string;
  [key: string]: string | boolean | undefined;
}

export interface UserGroupData {
  code: string;
  name: string;
}

export interface MenuLinkItemData {
  id: number;
  code: string;
  taskStep: boolean;
  name: LocalizeData;
  icon?: string;
  displayOrder: number;
  isRoot: boolean;
  active: boolean;
  url?: string;
  menuType: 'ADMIN_PANEL' | 'PUBLIC';
  parentMenuCode?: string | null;
  userGroups: UserGroupData[];
  subMenuLinkItems: MenuLinkItemData[];
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

export interface MenuResponse {
  status: 'SUCCESS' | 'ERROR';
  data?: MenuLinkItemData[];
  errorMessage?: string;
}
