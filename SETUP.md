# Next.js Kurulum ve Çalıştırma Rehberi

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
btc-store/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Çok dilli sayfa yapısı
│   │   │   ├── (public)/            # Genel sayfalar (route group)
│   │   │   │   ├── page.tsx         # Ana sayfa (/)
│   │   │   │   ├── products/        # Ürünler sayfaları
│   │   │   │   ├── stories/         # Hikayeler sayfaları
│   │   │   │   ├── references/      # Referanslar
│   │   │   │   └── call-request/    # Arama talebi
│   │   │   ├── admin/               # Admin paneli
│   │   │   │   ├── page.tsx         # Dashboard
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   └── ...
│   │   │   └── layout.tsx           # Locale layout
│   │   ├── layout.tsx               # Root layout
│   │   ├── robots.ts                # SEO robots.txt
│   │   └── sitemap.ts               # SEO sitemap
│   ├── components/                   # Yeniden kullanılabilir bileşenler
│   ├── i18n/                        # Çoklu dil desteği
│   │   ├── locales/                 # Dil dosyaları (tr, en, de, fr, es, ar)
│   │   └── request.ts               # next-intl yapılandırması
│   ├── layouts/                     # Layout bileşenleri
│   ├── pages/                       # Sayfa bileşenleri (legacy)
│   ├── store/                       # Zustand state yönetimi
│   └── middleware.ts                # Next.js middleware (dil yönlendirme)
├── public/                          # Statik dosyalar
├── next.config.mjs                  # Next.js yapılandırması
├── tsconfig.json                    # TypeScript yapılandırması
└── tailwind.config.js               # Tailwind CSS yapılandırması
```

## 🌍 Desteklenen Diller

- 🇹🇷 Türkçe (tr) - Varsayılan
- 🇬🇧 İngilizce (en)
- 🇩🇪 Almanca (de)
- 🇫🇷 Fransızca (fr)
- 🇪🇸 İspanyolca (es)
- 🇸🇦 Arapça (ar)

## 🔧 Yapılandırma

### Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# Linting
npm run lint

# Type checking
npm run typecheck
```

## 🎯 Özellikler

### ✅ SEO Optimizasyonu
- Server-side rendering (SSR)
- Static site generation (SSG)
- Metadata API ile dinamik meta etiketleri
- Otomatik sitemap.xml
- robots.txt yapılandırması
- OpenGraph ve Twitter Card desteği

### ✅ Performans
- Otomatik kod bölme (code splitting)
- Image optimization (next/image kullanımı önerilir)
- Font optimization
- Lazy loading

### ✅ Çoklu Dil Desteği
- next-intl ile entegrasyon
- URL tabanlı dil yönlendirme
- Otomatik dil algılama
- 6 dil desteği

### ✅ Geliştirici Deneyimi
- TypeScript desteği
- Hot module replacement
- Fast refresh
- ESLint yapılandırması

## 🚢 Deployment

### Vercel (Önerilen)

1. GitHub'a push yapın
2. [Vercel](https://vercel.com)'e gidin
3. Projeyi import edin
4. Ortam değişkenlerini ekleyin
5. Deploy edin

### Diğer Platformlar

```bash
# Build
npm run build

# Çıktı: .next/ klasörü
# Node.js sunucusu gerektirir
npm start
```

## 🔍 Sayfa Rotaları

### Genel Sayfalar
- `/` - Ana sayfa
- `/products` - Ürünler listesi
- `/products/[id]` - Ürün detayı
- `/products/[id]/contact` - Ürün iletişim formu
- `/stories` - Hikayeler
- `/stories/[id]` - Hikaye detayı
- `/references` - Referanslar
- `/call-request` - Arama talebi formu

### Admin Sayfaları
- `/admin` - Dashboard
- `/admin/header` - Header yönetimi
- `/admin/banners` - Banner yönetimi
- `/admin/categories` - Kategori yönetimi
- `/admin/products` - Ürün yönetimi
- `/admin/references` - Referans yönetimi
- `/admin/stories` - Hikaye yönetimi
- `/admin/kvkk` - KVKK metni yönetimi
- `/admin/forms` - Form kayıtları

## 🐛 Sorun Giderme

### Port zaten kullanımda
```bash
# Farklı port kullanın
PORT=3001 npm run dev
```

### Modül bulunamadı hataları
```bash
# node_modules'ü temizleyin ve yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

### Build hataları
```bash
# Type checking yapın
npm run typecheck

# Linting yapın
npm run lint
```

## 📚 Daha Fazla Bilgi

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [next-intl Dokümantasyonu](https://next-intl-docs.vercel.app/)
- [Tailwind CSS Dokümantasyonu](https://tailwindcss.com/docs)
- [Supabase Dokümantasyonu](https://supabase.com/docs)

## 🎉 Başarıyla Tamamlandı!

Projeniz React (Vite) yapısından Next.js 14 App Router yapısına başarıyla dönüştürüldü. SEO optimizasyonu, çoklu dil desteği ve modern Next.js özellikleri ile artık production-ready durumda!
