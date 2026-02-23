# Çoklu Dil Desteği Implementasyonu

## Özet

Anasayfada seçilen dil (tr, en, de, fr, es, it) artık tüm sayfalarda ve servis dönüşlerinde kullanılıyor.

## Yapılan Değişiklikler

### 1. Yardımcı Fonksiyon Oluşturuldu

**Dosya:** `src/lib/i18n-utils.ts`

- `getLocalizedText()`: Çoklu dil objelerinden seçili dile göre metni döndürür
- `getCurrentLocale()`: Cookie'den mevcut dili alır
- Fallback mekanizması: İstenen dilde metin yoksa Türkçe'ye düşer

### 2. API İsteklerine Dil Desteği Eklendi

**Dosya:** `src/lib/api.ts`

- Tüm API isteklerine `Accept-Language` header'ı eklendi
- Tüm API isteklerine `isoCode` query parametresi eklendi (örn: `?isoCode=tr`)
- Cookie'den alınan dil bilgisi backend'e gönderiliyor
- Upload işlemlerinde de dil desteği eklendi

**Örnek API İsteği:**
```
GET /api/v1/public/products?isoCode=tr
Headers: Accept-Language: tr
```

### 3. Dil Dosyaları Tamamlandı

Tüm dil dosyaları (tr, en, de, fr, es, it) aynı yapıya getirildi ve eksik çeviriler eklendi:

- `common.products`: "ürün" / "products" / "Produkte" / "produits" / "productos" / "prodotti"
- `common.seeMore`: "Daha Fazla Göster" / "See More" / vb.
- `common.viewAll`: "Tümünü Gör" / "View All" / vb.
- `product.features`: "Ürün Özellikleri" / "Product Features" / vb.
- `callRequest.email`: "E-posta Adresiniz" / "Your Email Address" / vb.
- `callRequest.message`: "Mesajınız (Opsiyonel)" / "Your Message (Optional)" / vb.
- `callRequest.messagePlaceholder`: Placeholder metinleri
- `productContact.messagePlaceholder`: Placeholder metinleri
- `admin` bölümüne eksik alanlar eklendi (partners, documents, sectors, menus, callRequests, emailTemplates, siteSettings, parameters)

### 4. View Dosyaları Güncellendi

Aşağıdaki view dosyalarında `.tr` kullanımı yerine `getLocalizedText()` fonksiyonu kullanılmaya başlandı:

#### Products.tsx
- Kategori adları ve açıklamaları
- Ürün adları ve kısa açıklamaları
- Kategori filtre butonları

#### ProductDetail.tsx
- Ürün adı, açıklaması ve kategorileri
- Ürün özellikleri
- Doküman başlıkları ve açıklamaları

#### Home.tsx
- Banner başlıkları ve alt başlıkları
- Kategori adları ve açıklamaları
- Partner ve referans isimleri

#### Stories.tsx & StoryDetail.tsx
- Başarı hikayesi başlıkları
- HTML içerik

#### ProductContact.tsx & CallRequest.tsx
- Ürün adları
- Gizlilik politikası metinleri

### 5. Component'ler

Aşağıdaki component'ler zaten `useLocale()` kullanıyordu, ek değişiklik gerekmedi:

- **Header.tsx**: Menü adları için locale kullanıyor
- **Footer.tsx**: Footer menüleri için locale kullanıyor
- **TopBanner.tsx**: Banner metni için locale kullanıyor
- **LanguageSwitcher.tsx**: Dil değiştirme işlevi

### 6. Store Güncellemesi

**Dosya:** `src/store/useStore.ts`

Store zaten backend'den gelen çoklu dil verilerini doğru şekilde işliyordu. Ek değişiklik gerekmedi.

## Kullanım Örneği

```typescript
import { useLocale } from 'next-intl';
import { getLocalizedText, SupportedLocale } from '@/lib/i18n-utils';

export default function MyComponent() {
  const locale = useLocale() as SupportedLocale;
  
  // Çoklu dil objesi
  const product = {
    name: {
      tr: 'Ürün Adı',
      en: 'Product Name',
      de: 'Produktname',
      fr: 'Nom du produit',
      es: 'Nombre del producto',
      it: 'Nome del prodotto'
    }
  };
  
  // Seçili dile göre metni al
  const productName = getLocalizedText(product.name, locale);
  
  return <h1>{productName}</h1>;
}
```

## Backend Entegrasyonu

Backend'in aşağıdaki özellikleri desteklemesi gerekiyor:

1. **Accept-Language Header'ı**: API isteklerinde gönderilen `Accept-Language` header'ını okuyup, response'larda ilgili dili kullanmalı

2. **isoCode Query Parametresi**: Tüm API isteklerinde `isoCode` parametresi gönderiliyor (örn: `?isoCode=tr`). Backend bu parametreyi okuyup ilgili dilde veri dönmeli.

3. **Çoklu Dil Objeleri**: Tüm metin alanları aşağıdaki formatta dönmeli:
```json
{
  "name": {
    "tr": "Türkçe metin",
    "en": "English text",
    "de": "Deutscher Text",
    "fr": "Texte français",
    "es": "Texto español",
    "it": "Testo italiano"
  }
}
```

4. **Desteklenen Diller**: tr, en, de, fr, es, it

## API İstek Örnekleri

```bash
# Ürünleri getir (Türkçe)
GET /api/v1/public/products?isoCode=tr
Headers: Accept-Language: tr

# Ürünleri getir (İngilizce)
GET /api/v1/public/products?isoCode=en
Headers: Accept-Language: en

# Kategori filtreli ürünler (Almanca)
GET /api/v1/public/products?category=crm&isoCode=de
Headers: Accept-Language: de

# Ürün detayı (Fransızca)
GET /api/v1/public/products/product-code?isoCode=fr
Headers: Accept-Language: fr
```

## Test Senaryosu

1. Anasayfada dil seçiciyi kullanarak dili değiştirin
2. Farklı sayfalara gidin (Ürünler, Ürün Detay, Hikayeler, vb.)
3. Tüm metinlerin seçilen dilde göründüğünü doğrulayın
4. API isteklerinde `Accept-Language` header'ının ve `isoCode` parametresinin gönderildiğini kontrol edin (Browser DevTools > Network)
5. Backend response'larında doğru dilde veri geldiğini doğrulayın

## Notlar

- Dil seçimi cookie'de (`NEXT_LOCALE`) saklanıyor ve 1 yıl boyunca geçerli
- Fallback mekanizması sayesinde eksik çeviriler Türkçe olarak gösteriliyor
- Middleware otomatik olarak tarayıcı dilini algılayıp ilk ziyarette uygun dili seçiyor
- Tüm dil dosyaları aynı yapıya sahip ve tüm çeviriler tamamlandı
- Her API isteğine otomatik olarak `isoCode` parametresi ekleniyor
