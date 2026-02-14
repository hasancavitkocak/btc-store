# Backend Bağlantı Kurulumu

## Sorun Çözüldü! ✅

### Tespit Edilen Sorunlar:
1. ❌ Backend port 8080 değil, **9090** kullanıyor
2. ❌ Context path eksikti: **/webapp/api**
3. ❌ CORS'a Next.js URL'i eklenmemişti (http://localhost:3000)
4. ❌ Credentials (cookie) desteği eksikti

### Yapılan Düzeltmeler:

#### 1. Environment Değişkenleri
`.env.local` dosyası oluşturuldu:
```env
NEXT_PUBLIC_API_URL=http://localhost:9090/webapp/api
```

#### 2. Backend CORS Ayarları
`webapp/src/main/resources/webapp-local.properties`:
```properties
ui.cors.origin.urls=http://localhost:4200,http://localhost:4300,http://localhost:3000
```

`webapp/src/main/java/com/btc/config/CorsConfig.java`:
- `allowCredentials(true)` eklendi
- `OPTIONS` method eklendi
- `PATCH` method eklendi

#### 3. Frontend API Client
- `credentials: 'include'` tüm fetch isteklerine eklendi
- Default URL güncellendi: `http://localhost:9090/webapp/api`

## Test Adımları

### 1. Backend'i Başlat
```bash
# Backend projesinde
mvn spring-boot:run
# veya IDE'den BtcStoreApplication.java'yı çalıştır
```

Backend şu adreste çalışmalı: http://localhost:9090

### 2. Frontend'i Başlat
```bash
cd btc-store
npm run dev
```

Frontend şu adreste çalışmalı: http://localhost:3000

### 3. Test Sayfasını Aç
http://localhost:3000/test-api

Bu sayfada:
- "Test Backend Health" butonu ile backend'in çalıştığını kontrol edin
- "Test Login" butonu ile login işlemini test edin

### 4. Login Sayfasını Test Et
http://localhost:3000/admin/login

Credentials:
- Username: `admin`
- Password: `123456`

## Kontrol Listesi

Backend çalışıyor mu?
```bash
curl http://localhost:9090/webapp/api/actuator/health
```

CORS ayarları doğru mu?
- ✅ `webapp-local.properties` dosyasında `http://localhost:3000` var mı?
- ✅ Backend yeniden başlatıldı mı?

Frontend environment doğru mu?
- ✅ `.env.local` dosyası var mı?
- ✅ `NEXT_PUBLIC_API_URL=http://localhost:9090/webapp/api` doğru mu?
- ✅ Frontend yeniden başlatıldı mı? (environment değişiklikleri için gerekli)

## Hata Ayıklama

### CORS Hatası Alıyorsanız:
1. Backend'i yeniden başlatın
2. Browser console'da tam hata mesajını kontrol edin
3. Network tab'da OPTIONS request'in başarılı olduğunu kontrol edin

### Connection Refused Hatası:
1. Backend'in çalıştığından emin olun: `http://localhost:9090`
2. Port'un doğru olduğunu kontrol edin (9090)
3. Context path'in doğru olduğunu kontrol edin (/webapp/api)

### 401 Unauthorized:
1. Kullanıcı adı/şifre doğru mu? (admin/123456)
2. Backend'de user var mı?
3. Security config doğru mu?

## Network İsteği Örneği

Login isteği şu şekilde gitmeli:
```
POST http://localhost:9090/webapp/api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "username": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "language": "tr",
  "picture": "",
  "userGroups": ["ADMIN"]
}
```

## Başarılı Bağlantı Sonrası

Artık tüm API istekleri çalışmalı:
- ✅ Login
- ✅ Token refresh
- ✅ Admin panel erişimi
- ✅ CRUD işlemleri
- ✅ File upload

Test sayfasında başarılı sonuç görürseniz, sistem hazır demektir!
