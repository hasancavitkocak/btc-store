# Admin Menü Dinamik Yükleme Implementasyonu

## Özet
Admin panelindeki menüler artık backend'den dinamik olarak yükleniyor. Menüler `getMenusByType` API endpoint'i üzerinden çekiliyor ve kullanıcının diline göre gösteriliyor.

## Yapılan Değişiklikler

### 1. Yeni Tip Tanımları (`src/types/menu.ts`)
```typescript
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
}
```

### 2. API Endpoint Eklendi (`src/lib/api.ts`)
```typescript
async getMenusByType(menuType: 'ADMIN_PANEL' | 'PUBLIC'): Promise<ApiResponse<any>> {
  return this.get(`/v1/menu-link-items/by-type/${menuType}`);
}
```

**Endpoint:** `GET /v1/menu-link-items/by-type/{menuType}`
- `menuType`: `ADMIN_PANEL` veya `PUBLIC`

### 3. AdminSidebar Güncellendi (`src/components/AdminSidebar.tsx`)

#### Özellikler:
- Menüler backend'den `getMenusByType('ADMIN_PANEL')` ile çekiliyor
- Endpoint: `GET /v1/menu-link-items/by-type/ADMIN_PANEL`
- Kullanıcının diline göre menü isimleri gösteriliyor (`locale` kullanılarak)
- Icon mapping ile backend'den gelen icon string'i Lucide icon'a dönüştürülüyor
- Kullanıcı gruplarına göre menü erişim kontrolü yapılıyor
- `displayOrder` alanına göre menüler sıralanıyor
- `isRoot` ve `active` alanlarına göre filtreleme yapılıyor
- Alt menüler (`subMenuLinkItems`) destekleniyor

#### Icon Mapping:
Backend'den gelen icon string'leri (örn: "LayoutDashboard", "Settings") Lucide React icon'larına map ediliyor. 40+ icon destekleniyor.

#### Yetkilendirme:
- `hasMenuAccess()` fonksiyonu ile kullanıcının menüye erişim yetkisi kontrol ediliyor
- `userGroups` alanı boşsa menü herkese açık
- Kullanıcının grupları `useAuthStore`'dan alınıyor

#### Çoklu Dil Desteği:
- `getMenuName()` fonksiyonu ile menü isimleri kullanıcının diline göre gösteriliyor
- Öncelik sırası: kullanıcının dili > Türkçe > İngilizce

## Kullanım

### Backend'de Menü Oluşturma
```java
MenuLinkItemData menu = new MenuLinkItemData();
menu.setCode("products");
menu.setName(LocalizeData.builder()
    .tr("Ürünler")
    .en("Products")
    .build());
menu.setIcon("Package");
menu.setDisplayOrder(1);
menu.setIsRoot(true);
menu.setActive(true);
menu.setUrl("/admin/products");
menu.setMenuType(MenuType.ADMIN_PANEL);
menu.setUserGroups(Set.of(adminGroup));
```

### Desteklenen Icon'lar
LayoutDashboard, Settings, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare, Phone, Mail, Shield, Edit, Trash2, Plus, Eye, Save, Upload, Download, Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, User, Lock, Key, Globe, Database, Server, Cloud, Activity, BarChart, PieChart, TrendingUp, Award, Target, Briefcase

## Test
1. Backend'de menü verilerini oluşturun
2. Admin paneline giriş yapın
3. Menülerin dinamik olarak yüklendiğini görün
4. Farklı dillerde test edin
5. Farklı kullanıcı gruplarıyla test edin
