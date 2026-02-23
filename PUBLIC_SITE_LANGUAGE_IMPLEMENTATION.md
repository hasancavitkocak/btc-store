# Public Site Dil Yönetimi Implementasyonu

## Özet
Public site için otomatik dil algılama ve kullanıcı tercihine göre dil değiştirme sistemi implementasyonu.

## Özellikler

### 1. Otomatik Dil Algılama
- İlk ziyarette tarayıcının `Accept-Language` header'ından dil algılanır
- Algılanan dil `NEXT_LOCALE` cookie'sine kaydedilir
- Desteklenen diller: `tr`, `en`, `de`, `fr`, `es`, `it`
- Default dil: `tr` (Türkçe)

### 2. Dil Değiştirme
- Header'daki LanguageSwitcher ile kullanıcı dilini değiştirebilir
- Seçilen dil cookie'ye kaydedilir (1 yıl geçerli)
- Sayfa yenilenir ve tüm içerik seçilen dilde gösterilir

### 3. Dinamik Menüler
- Public menüler backend'den `getMenusByType('PUBLIC')` ile çekilir
- Menü isimleri kullanıcının diline göre gösterilir
- Hiyerarşik menü yapısı desteklenir (ana menü + alt menüler)

## Teknik Detaylar

### Middleware (`src/middleware.ts`)
```typescript
// İlk ziyarette tarayıcı dilini algıla
if (!currentLocale) {
  const browserLanguage = request.headers.get('accept-language');
  const primaryLanguage = browserLanguage.split(',')[0].split('-')[0].toLowerCase();
  const supportedLanguages = ['tr', 'en', 'de', 'fr', 'es', 'it'];
  
  if (supportedLanguages.includes(primaryLanguage)) {
    detectedLanguage = primaryLanguage;
  }
  
  response.cookies.set('NEXT_LOCALE', detectedLanguage, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax'
  });
}
```

### LanguageSwitcher (`src/components/LanguageSwitcher.tsx`)
- 6 dil desteği: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca
- Bayrak ikonları ile görsel dil seçimi
- Cookie'ye kayıt ve sayfa yenileme

### Header (`src/components/Header.tsx`)
- Backend'den dinamik menü çekme
- Kullanıcının diline göre menü isimleri
- Hiyerarşik menü yapısı (dropdown)
- Mobil uyumlu menü

## Kullanım Akışı

### İlk Ziyaret
1. Kullanıcı siteyi açar
2. Middleware tarayıcı dilini algılar (örn: İtalyanca)
3. `NEXT_LOCALE=it` cookie'si oluşturulur
4. Site İtalyanca olarak açılır
5. Menüler backend'den çekilir ve İtalyanca gösterilir

### Dil Değiştirme
1. Kullanıcı header'daki dil seçiciyi açar
2. Yeni bir dil seçer (örn: İngilizce)
3. `NEXT_LOCALE=en` cookie'si güncellenir
4. Sayfa yenilenir
5. Tüm içerik İngilizce olarak gösterilir

### Admin Kullanıcısı
1. Admin giriş yapar
2. JWT token'dan kullanıcının dili alınır
3. `NEXT_LOCALE` cookie'si JWT'deki dile güncellenir
4. Admin paneli kullanıcının dilinde açılır

## Backend Entegrasyonu

### Public Menüler
```typescript
// API endpoint
GET /v1/menu-link-items/by-type/PUBLIC

// Response
[
  {
    "code": "home",
    "name": {
      "tr": "Ana Sayfa",
      "en": "Home",
      "de": "Startseite",
      "fr": "Accueil",
      "es": "Inicio",
      "it": "Home"
    },
    "url": "/",
    "displayOrder": 10,
    "isRoot": true,
    "active": true,
    "subMenuLinkItems": []
  }
]
```

## Test Senaryoları

### 1. İlk Ziyaret (Tarayıcı Dili: İtalyanca)
- Beklenen: Site İtalyanca açılır
- Cookie: `NEXT_LOCALE=it`

### 2. Dil Değiştirme (İtalyanca → İngilizce)
- Kullanıcı dil seçiciden İngilizce seçer
- Beklenen: Site İngilizce olarak yenilenir
- Cookie: `NEXT_LOCALE=en`

### 3. Admin Giriş (JWT dili: Türkçe)
- Admin Türkçe dil tercihiyle giriş yapar
- Beklenen: Admin paneli Türkçe açılır
- Cookie: `NEXT_LOCALE=tr`

### 4. Menü Çevirisi
- Backend'den menüler çekilir
- Beklenen: Menüler kullanıcının dilinde gösterilir
- Örnek: "Ürünler" (tr) → "Products" (en) → "Prodotti" (it)

## Notlar
- Cookie 1 yıl geçerlidir
- Desteklenmeyen diller için default Türkçe kullanılır
- Admin kullanıcıları için JWT token'daki dil önceliklidir
- Public kullanıcılar için cookie'deki dil önceliklidir
