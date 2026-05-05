# Windows Sunucu Deployment Rehberi

## Gereksinimler

1. **Node.js** (v18 veya üzeri)
2. **Nginx** (Windows için)
3. **PM2** (opsiyonel ama önerilen)

## Kurulum Adımları

### 1. Node.js Kurulumu
- https://nodejs.org/ adresinden Windows için LTS versiyonunu indirin
- Kurulumu tamamlayın ve `node -v` ile kontrol edin

### 2. PM2 Kurulumu (Önerilen)
```cmd
npm install -g pm2
npm install -g pm2-windows-service
```

PM2'yi Windows servisi olarak kurun:
```cmd
pm2-service-install
```

### 3. Nginx Kurulumu
- https://nginx.org/en/download.html adresinden Windows versiyonunu indirin
- C:\nginx gibi bir dizine çıkartın

### 4. Projeyi Sunucuya Aktarma
- Tüm proje dosyalarını sunucuya kopyalayın (örn: D:\btc-store)
- `.env.production` dosyasını oluşturun ve production ayarlarını yapın

### 5. Deployment
Proje dizininde:
```cmd
deploy.bat
```

Bu script:
- Dependencies yükler
- Production build alır
- Gerekli kontrolleri yapar

### 6. Nginx Konfigürasyonu

#### nginx.conf dosyasını düzenleyin:
1. `C:\nginx\conf\nginx.conf` dosyasını açın
2. `http` bloğunun içine şunu ekleyin:
```nginx
include D:/btc-store/nginx.conf;
```

VEYA doğrudan `nginx.conf` içeriğini kopyalayın ve:
- `server_name` kısmını domain adresinizle değiştirin
- Path'leri kontrol edin (D:/btc-store)

#### Nginx'i test edin:
```cmd
cd C:\nginx
nginx -t
```

#### Nginx'i başlatın:
```cmd
cd C:\nginx
start nginx
```

### 7. Next.js Uygulamasını Başlatma

#### Seçenek A: PM2 ile (Önerilen)
```cmd
cd D:\btc-store
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

PM2 komutları:
```cmd
pm2 list              # Çalışan uygulamaları listele
pm2 logs btc-store    # Logları görüntüle
pm2 restart btc-store # Yeniden başlat
pm2 stop btc-store    # Durdur
pm2 delete btc-store  # Sil
```

#### Seçenek B: Manuel başlatma
```cmd
cd D:\btc-store
npm start
```

#### Seçenek C: Windows Service olarak
NSSM (Non-Sucking Service Manager) kullanarak:
1. https://nssm.cc/download adresinden NSSM indirin
2. Komut satırında:
```cmd
nssm install BTCStore "C:\Program Files\nodejs\node.exe"
nssm set BTCStore AppDirectory "D:\btc-store"
nssm set BTCStore AppParameters "node_modules\next\dist\bin\next start"
nssm set BTCStore AppEnvironmentExtra "NODE_ENV=production" "PORT=3000"
nssm start BTCStore
```

## Güncelleme İşlemi

Yeni bir versiyon deploy etmek için:

```cmd
cd D:\btc-store

# Git ile güncelleme (eğer git kullanıyorsanız)
git pull

# Veya dosyaları manuel kopyalayın

# Deployment script'ini çalıştırın
deploy.bat

# PM2 kullanıyorsanız:
pm2 restart btc-store

# Manuel çalıştırıyorsanız, process'i durdurup tekrar başlatın
```

## Nginx Komutları

```cmd
cd C:\nginx

# Başlat
start nginx

# Durdur
nginx -s stop

# Graceful shutdown
nginx -s quit

# Reload (config değişikliklerinden sonra)
nginx -s reload

# Test config
nginx -t
```

## Sorun Giderme

### Port 3000 kullanımda hatası
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Nginx başlamıyor
- Port 80'in başka bir uygulama tarafından kullanılmadığından emin olun
- IIS çalışıyorsa durdurun: `iisreset /stop`

### Build hataları
```cmd
# Cache'i temizle
rmdir /s /q .next
rmdir /s /q node_modules
npm install
npm run build
```

### Environment variables yüklenmiyor
- `.env.production` dosyasının proje root'unda olduğundan emin olun
- Dosya içeriğini kontrol edin
- PM2 kullanıyorsanız `ecosystem.config.js` içindeki env değerlerini kontrol edin

## Güvenlik Önerileri

1. **Firewall**: Sadece 80 ve 443 portlarını dışarıya açın
2. **SSL**: Let's Encrypt veya başka bir SSL sertifikası kullanın
3. **Environment Variables**: Hassas bilgileri `.env.production` içinde tutun
4. **Updates**: Node.js ve Nginx'i güncel tutun
5. **Backup**: Düzenli yedek alın

## SSL Sertifikası Ekleme (HTTPS)

Nginx config'e ekleyin:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate D:/ssl/certificate.crt;
    ssl_certificate_key D:/ssl/private.key;
    
    # ... diğer ayarlar
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Performans İyileştirmeleri

1. **PM2 Cluster Mode**: Birden fazla instance çalıştırın
```javascript
// ecosystem.config.js içinde
instances: 'max', // veya sayı belirtin
exec_mode: 'cluster'
```

2. **Nginx Caching**: Static dosyalar için cache ekleyin
3. **CDN**: Static asset'ler için CDN kullanın

## Monitoring

PM2 ile monitoring:
```cmd
pm2 monit
pm2 logs btc-store --lines 100
```

## Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs`
2. Nginx error loglarını kontrol edin: `C:\nginx\logs\error.log`
3. Next.js build loglarını kontrol edin
