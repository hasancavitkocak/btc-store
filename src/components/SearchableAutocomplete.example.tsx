/**
 * SearchableAutocomplete Component - Kullanım Örnekleri
 * 
 * Bu component, search service ile entegre çalışan, sayfalama ve infinite scroll
 * destekli, reusable bir autocomplete component'idir.
 */

import { useState } from 'react';
import SearchableAutocomplete from './SearchableAutocomplete';

// ============================================
// ÖRNEK 1: Ürün Seçimi (Çoklu) - Sadece Aktif Ürünler
// ============================================

interface Product {
  code: string;
  name: { tr: string; en: string };
  active: boolean;
}

function ProductSelector() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  return (
    <SearchableAutocomplete<Product>
      itemType="product"              // Backend model adı
      searchField="name"              // Aranacak alan
      locale="tr"                     // Dil
      selectedItems={selectedProducts}
      onItemsChange={setSelectedProducts}
      getItemKey={(product) => product.code}
      getItemLabel={(product) => product.name.tr || product.name.en}
      placeholder="Ürün ara..."
      label="Ürünler"
      multiple={true}                 // Çoklu seçim
      additionalFilters={[            // Ek filtreler
        { name: 'active', value: true, searchCondition: 'EQUALS' }
      ]}
    />
  );
}

// ============================================
// ÖRNEK 2: Kategori Seçimi (Tekli)
// ============================================

interface Category {
  code: string;
  name: { tr: string; en: string };
}

function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState<Category[]>([]);

  return (
    <SearchableAutocomplete<Category>
      itemType="category"
      searchField="name"
      locale="tr"
      selectedItems={selectedCategory}
      onItemsChange={setSelectedCategory}
      getItemKey={(cat) => cat.code}
      getItemLabel={(cat) => cat.name.tr}
      placeholder="Kategori seç..."
      label="Kategori"
      multiple={false}                // Tekli seçim
    />
  );
}

// ============================================
// ÖRNEK 3: Kullanıcı Seçimi (Email ile arama)
// ============================================

interface User {
  code: string;
  username: string;
  email: string;
  picture?: { absolutePath: string };
}

function UserSelector() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  return (
    <SearchableAutocomplete<User>
      itemType="user"
      searchField="email"             // Email alanında ara
      locale="tr"
      selectedItems={selectedUsers}
      onItemsChange={setSelectedUsers}
      getItemKey={(user) => user.code}
      getItemLabel={(user) => `${user.username} (${user.email})`}
      placeholder="Kullanıcı ara (email)..."
      label="Kullanıcılar"
      multiple={true}
    />
  );
}

// ============================================
// ÖRNEK 4: Banner Seçimi (Başlık ile arama)
// ============================================

interface Banner {
  code: string;
  title: { tr: string; en: string };
  active: boolean;
}

function BannerSelector() {
  const [selectedBanners, setSelectedBanners] = useState<Banner[]>([]);

  return (
    <SearchableAutocomplete<Banner>
      itemType="banner"
      searchField="title"
      locale="tr"
      selectedItems={selectedBanners}
      onItemsChange={setSelectedBanners}
      getItemKey={(banner) => banner.code}
      getItemLabel={(banner) => banner.title.tr || banner.title.en}
      placeholder="Banner ara..."
      label="Bannerlar"
      multiple={true}
      disabled={false}                // Disabled yapılabilir
    />
  );
}

// ============================================
// ÖRNEK 5: Form İçinde Kullanım
// ============================================

function DocumentForm() {
  const [formData, setFormData] = useState({
    title: '',
    products: [] as Product[],
    categories: [] as Category[],
    active: true
  });

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <SearchableAutocomplete<Product>
        itemType="product"
        searchField="name"
        locale="tr"
        selectedItems={formData.products}
        onItemsChange={(products) => setFormData({ ...formData, products })}
        getItemKey={(p) => p.code}
        getItemLabel={(p) => p.name.tr}
        placeholder="Ürün ara..."
        label="İlgili Ürünler"
        multiple={true}
      />

      <SearchableAutocomplete<Category>
        itemType="category"
        searchField="name"
        locale="tr"
        selectedItems={formData.categories}
        onItemsChange={(categories) => setFormData({ ...formData, categories })}
        getItemKey={(c) => c.code}
        getItemLabel={(c) => c.name.tr}
        placeholder="Kategori seç..."
        label="Kategori"
        multiple={false}
      />
    </form>
  );
}

// ============================================
// ÖZELLİKLER
// ============================================

/**
 * 1. Infinite Scroll: Aşağı scroll yapınca otomatik yeni sayfa yüklenir
 * 2. Debounced Search: 300ms bekleyip sonra arama yapar
 * 3. LIKE Search: Backend'e LIKE condition ile gider
 * 4. Sayfalama: 20'şer 20'şer yükler
 * 5. Loading States: Yüklenirken spinner gösterir
 * 6. Empty States: Sonuç yoksa mesaj gösterir
 * 7. Selected Items: Seçili öğeleri chip olarak gösterir
 * 8. Multiple/Single: Çoklu veya tekli seçim
 * 9. Disabled: Devre dışı bırakılabilir
 * 10. Click Outside: Dışarı tıklayınca kapanır
 */

// ============================================
// ÖRNEK 6: Ek Filtreler ile Kullanım
// ============================================

function ActiveProductSelector() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  return (
    <SearchableAutocomplete<Product>
      itemType="product"
      searchField="name"
      locale="tr"
      selectedItems={selectedProducts}
      onItemsChange={setSelectedProducts}
      getItemKey={(p) => p.code}
      getItemLabel={(p) => p.name.tr}
      placeholder="Aktif ürün ara..."
      label="Aktif Ürünler"
      multiple={true}
      additionalFilters={[
        { name: 'active', value: true, searchCondition: 'EQUALS' },
        { name: 'deleted', value: false, searchCondition: 'EQUALS' }
      ]}
    />
  );
}

// ============================================
// BACKEND FİLTRE YAPISI
// ============================================

/**
 * Component otomatik olarak şu filtreyi oluşturur:
 * 
 * {
 *   filters: [
 *     { name: 'active', value: true, searchCondition: 'EQUALS' },           // additionalFilters
 *     { name: 'deleted', value: false, searchCondition: 'EQUALS' },         // additionalFilters
 *     {
 *       name: 'name',                            // searchField prop'u
 *       locale: 'tr',                            // locale prop'u
 *       value: 'kullanıcı girişi',               // input değeri
 *       searchCondition: 'LIKE'                  // Otomatik LIKE
 *     }
 *   ]
 * }
 * 
 * Backend'e giden istek:
 * POST /api/v1/search/{page}/product
 * Body: { filters: [...] }
 * 
 * Backend Response:
 * {
 *   "status": "SUCCESS",
 *   "data": {
 *     "pageNumber": 1,
 *     "pageSize": 20,
 *     "totalPages": 2,
 *     "totalElements": 23,
 *     "content": [...]
 *   }
 * }
 */
