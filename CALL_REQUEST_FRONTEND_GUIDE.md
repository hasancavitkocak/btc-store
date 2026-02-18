# Call Request Yönetim Paneli - Frontend Rehberi

## 📦 Oluşturulan Dosyalar

### Types (1 dosya)
```
src/types/
└── callRequest.ts - TypeScript type definitions ve enum'lar
```

### Services (1 güncelleme)
```
src/services/
└── admin.service.ts - Call Request ve Email Template servisleri eklendi
```

### Views (3 dosya)
```
src/views/admin/
├── CallRequestsAdmin.tsx - Tüm call request'leri listeleyen admin ekranı
├── MyCallRequests.tsx - Kullanıcının kendi işlerini gösteren ekran
└── CallRequestDetail.tsx - Call request detay ve işlem ekranı
```

### App Router Pages (3 dosya)
```
src/app/admin/call-requests/
├── page.tsx - Tüm çağrılar listesi
├── [id]/page.tsx - Detay sayfası
└── my-requests/page.tsx - Benim işlerim
```

### Components (1 güncelleme)
```
src/components/
└── AdminSidebar.tsx - Call Request menüsü eklendi
```

## 🎨 Ekran Özellikleri

### 1. Tüm Çağrılar Ekranı (`/admin/call-requests`)

**Özellikler:**
- ✅ İstatistik kartları (Toplam, Beklemede, Atandı, İşlemde, vb.)
- ✅ Durum filtreleme
- ✅ Arama (isim, email, telefon, konu)
- ✅ Tablo görünümü
- ✅ Müşteri bilgileri (isim, email, telefon)
- ✅ Durum badge'leri (renkli)
- ✅ Atama bilgileri
- ✅ Oluşturulma tarihi
- ✅ Detay butonu

**Kullanım:**
```typescript
// Tüm call request'leri getir
const response = await callRequestService.getAll();

// Statüye göre filtrele
const response = await callRequestService.getByStatus('PENDING');
```

### 2. Benim İşlerim Ekranı (`/admin/call-requests/my-requests`)

**Özellikler:**
- ✅ Kullanıcıya atanmış işler
- ✅ İstatistikler (Toplam, Bugün Eklenen, Acil)
- ✅ Öncelik göstergesi (🔴 Acil, 🟠 Öncelikli, 🟢 Normal)
- ✅ Kart görünümü (daha detaylı)
- ✅ Hızlı iletişim butonları (Mail, Telefon)
- ✅ Detay & İşlem Yap butonu

**Öncelik Hesaplama:**
- 🔴 Acil: 24 saatten eski
- 🟠 Öncelikli: 12-24 saat arası
- 🟢 Normal: 12 saatten yeni

**Kullanım:**
```typescript
// Benim işlerimi getir
const response = await callRequestService.getMyRequests();
```

### 3. Call Request Detay Ekranı (`/admin/call-requests/[id]`)

**Sol Kolon:**
- ✅ Müşteri bilgileri (isim, email, telefon, IP)
- ✅ GDPR/KVKK onay durumu
- ✅ Mesaj içeriği
- ✅ Tarihçe timeline (tüm işlemler)
  - İşlem tipi
  - Yapan kişi
  - Tarih/saat
  - Durum değişiklikleri
  - Yorumlar

**Sağ Kolon:**
- ✅ Hızlı bilgi kartı
- ✅ İşlem butonları:
  - Gruba Ata
  - Durum Güncelle
  - Mail Gönder
  - Telefon Et

**Modal'lar:**
- ✅ Durum Güncelleme Modal
  - Durum seçimi
  - Yorum ekleme
- ✅ Gruba Atama Modal
  - Grup seçimi

**Kullanım:**
```typescript
// Detay getir
const response = await callRequestService.getById(requestId);

// Tarihçe getir
const historyResponse = await callRequestService.getHistory(requestId);

// Gruba ata
await callRequestService.assignToGroup(requestId, 'sales_employee_group');

// Durum güncelle
await callRequestService.updateStatus(requestId, 'CUSTOMER_INFORMED', 'Müşteri ile görüşüldü');
```

## 🎨 UI/UX Özellikleri

### Renk Kodları (Status)
```typescript
PENDING: 'bg-yellow-100 text-yellow-800'           // Sarı
ASSIGNED: 'bg-blue-100 text-blue-800'              // Mavi
IN_PROGRESS: 'bg-purple-100 text-purple-800'       // Mor
CUSTOMER_INFORMED: 'bg-indigo-100 text-indigo-800' // İndigo
COMPLETED: 'bg-green-100 text-green-800'           // Yeşil
CANCELLED: 'bg-red-100 text-red-800'               // Kırmızı
```

### İkonlar
```typescript
User - Kullanıcı bilgileri
Mail - Email
Phone - Telefon
Calendar - Tarih
Clock - Zaman
MapPin - IP Adresi
Shield - GDPR/KVKK
CheckCircle - Tamamlama
Users - Grup
Eye - Görüntüleme
```

### Responsive Design
- ✅ Mobile-first yaklaşım
- ✅ Grid layout (responsive)
- ✅ Tablo overflow (horizontal scroll)
- ✅ Kart görünümü (mobile uyumlu)

## 📱 Ekran Görüntüleri

### Tüm Çağrılar
```
┌─────────────────────────────────────────────────┐
│ Call Request Yönetimi                           │
│ Tüm müşteri çağrılarını görüntüleyin           │
├─────────────────────────────────────────────────┤
│ [Toplam: 45] [Beklemede: 12] [Atandı: 8] ...  │
├─────────────────────────────────────────────────┤
│ [Arama...] [Durum Filtresi ▼]                  │
├─────────────────────────────────────────────────┤
│ Müşteri    │ Konu      │ Durum    │ Atanan    │
│ ─────────────────────────────────────────────  │
│ Ahmet Y.   │ Ürün Bil. │ PENDING  │ -         │
│ Mehmet K.  │ Destek    │ ASSIGNED │ Sales     │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

### Benim İşlerim
```
┌─────────────────────────────────────────────────┐
│ Benim İşlerim                                   │
│ Size atanmış call request'leri yönetin         │
├─────────────────────────────────────────────────┤
│ [Toplam: 5] [Bugün: 2] [Acil: 1]              │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐│
│ │ 🔴 Acil - Ürün Bilgisi                      ││
│ │ Ahmet Yılmaz                                ││
│ │ ahmet@example.com | +905551234567           ││
│ │ [Detay & İşlem] [Mail] [Ara]               ││
│ └─────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────┐│
│ │ 🟢 Normal - Destek Talebi                   ││
│ │ ...                                         ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Detay Ekranı
```
┌─────────────────────────────────────────────────┐
│ [← Geri] Call Request #123                     │
│                                    [PENDING]    │
├──────────────────────┬──────────────────────────┤
│ Müşteri Bilgileri    │ Hızlı Bilgi             │
│ 👤 Ahmet Yılmaz      │ Oluşturulma: ...        │
│ 📧 ahmet@...         │ Atanan Grup: Sales      │
│ 📱 +9055...          │                         │
│ 📍 IP: 192.168...    │ İşlemler                │
│ ✅ GDPR Onaylı       │ [Gruba Ata]            │
│                      │ [Durum Güncelle]        │
│ Mesaj                │ [Mail Gönder]           │
│ ┌──────────────────┐ │ [Telefon Et]           │
│ │ Ürün hakkında... │ │                         │
│ └──────────────────┘ │                         │
│                      │                         │
│ Tarihçe              │                         │
│ ⏰ Oluşturuldu       │                         │
│    System • 10:00    │                         │
│ ⏰ Gruba Atandı      │                         │
│    System • 10:01    │                         │
│ ⏰ Mail Gönderildi   │                         │
│    System • 10:01    │                         │
└──────────────────────┴──────────────────────────┘
```

## 🔧 Kurulum ve Kullanım

### 1. Backend'in Çalıştığından Emin Olun
```bash
# Backend projesini başlatın
cd btcstore
mvn spring-boot:run

# RabbitMQ projesini başlatın
cd btcstorerabbit
mvn spring-boot:run
```

### 2. Frontend'i Başlatın
```bash
cd btc-store
npm install
npm run dev
```

### 3. Admin Paneline Giriş Yapın
```
URL: http://localhost:3000/admin/login
```

### 4. Call Request Menüsüne Gidin
```
Sidebar > Form & İletişim > Call Requests
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: Admin Tüm Çağrıları Görüntüler
1. `/admin/call-requests` sayfasına git
2. İstatistikleri gör
3. Durum filtresini kullan
4. Arama yap
5. Detaya git

### Senaryo 2: Kullanıcı Kendi İşlerini Görür
1. `/admin/call-requests/my-requests` sayfasına git
2. Atanmış işleri gör
3. Öncelik durumunu kontrol et
4. Hızlı iletişim butonlarını kullan
5. Detaya git ve işlem yap

### Senaryo 3: Call Request İşleme
1. Detay sayfasına git
2. Müşteri bilgilerini gör
3. Tarihçeyi incele
4. "Gruba Ata" butonuna tıkla
5. Grup seç ve ata
6. "Durum Güncelle" butonuna tıkla
7. Yeni durum seç
8. Yorum ekle
9. Güncelle

### Senaryo 4: Müşteri ile İletişim
1. Detay sayfasında
2. "Mail Gönder" butonuna tıkla → Email client açılır
3. "Telefon Et" butonuna tıkla → Telefon uygulaması açılır
4. Görüşme sonrası durumu güncelle
5. Yorum ekle

## 📊 API Entegrasyonu

### Service Metodları
```typescript
// Call Request Service
callRequestService.getAll()                          // Tüm request'ler
callRequestService.getById(id)                       // Detay
callRequestService.getByStatus(status)               // Statüye göre
callRequestService.getMyRequests()                   // Benim işlerim
callRequestService.assignToGroup(id, groupCode)      // Gruba ata
callRequestService.assignToUser(id, userId)          // Kullanıcıya ata
callRequestService.updateStatus(id, status, comment) // Durum güncelle
callRequestService.getHistory(id)                    // Tarihçe

// Email Template Service
emailTemplateService.getAll()                        // Tüm template'ler
emailTemplateService.getActive()                     // Aktif template'ler
emailTemplateService.getByCode(code)                 // Template detay
emailTemplateService.save(data)                      // Kaydet
emailTemplateService.delete(code)                    // Sil
```

## 🎨 Özelleştirme

### Renkleri Değiştirme
```typescript
// src/types/callRequest.ts
export const STATUS_COLORS: Record<CallRequestStatus, string> = {
  [CallRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  // Diğer durumlar...
};
```

### Yeni Durum Ekleme
```typescript
// 1. Enum'a ekle
export enum CallRequestStatus {
  // Mevcut durumlar...
  NEW_STATUS = 'NEW_STATUS',
}

// 2. Label ekle
export const STATUS_LABELS: Record<CallRequestStatus, string> = {
  // Mevcut labellar...
  [CallRequestStatus.NEW_STATUS]: 'Yeni Durum',
};

// 3. Renk ekle
export const STATUS_COLORS: Record<CallRequestStatus, string> = {
  // Mevcut renkler...
  [CallRequestStatus.NEW_STATUS]: 'bg-pink-100 text-pink-800',
};
```

## 🐛 Troubleshooting

### Problem: Call Request'ler görünmüyor
**Çözüm:**
1. Backend çalışıyor mu kontrol et
2. Console'da API hatalarını kontrol et
3. JWT token'ın geçerli olduğundan emin ol

### Problem: Durum güncellenmiyor
**Çözüm:**
1. Kullanıcının yetkisi var mı kontrol et
2. Backend log'larını kontrol et
3. RabbitMQ çalışıyor mu kontrol et

### Problem: Tarihçe görünmüyor
**Çözüm:**
1. History API endpoint'i çalışıyor mu kontrol et
2. Call request ID'si doğru mu kontrol et

## 📝 Notlar

- Tüm tarihler Türkçe formatında gösterilir
- Telefon ve email linkleri otomatik çalışır
- GDPR onayı olmayan request'ler işaretlenir
- Öncelik renkleri otomatik hesaplanır
- Responsive tasarım tüm cihazlarda çalışır

---

**Hazırlayan:** Kiro AI Assistant  
**Tarih:** 2024-02-18  
**Frontend Framework:** Next.js 14 + TypeScript  
**UI Library:** Tailwind CSS + Lucide Icons
