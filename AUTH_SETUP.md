# Authentication Kurulum Dokümantasyonu

## Genel Bakış

Bu proje JWT token bazlı authentication sistemi kullanmaktadır. Backend Spring Boot, frontend Next.js ile entegre çalışmaktadır.

## Yapı

### Backend (Spring Boot)
- `/login` endpoint'i ile kullanıcı girişi
- JWT token üretimi (access token + refresh token)
- `/token/refresh` endpoint'i ile token yenileme
- Bearer token ile korunan admin rotaları

### Frontend (Next.js)
- Cookie bazlı token yönetimi
- Otomatik token refresh mekanizması
- Middleware ile rota koruması
- Zustand ile state yönetimi

## Kullanım

### 1. Environment Değişkenleri

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Login İşlemi

```typescript
import { useAuthStore } from '@/store/useAuthStore';

const login = useAuthStore((state) => state.login);

const handleLogin = async () => {
  const result = await login('username', 'password');
  
  if (result.success) {
    // Başarılı giriş
    router.push('/admin');
  } else {
    // Hata mesajı
    console.error(result.error);
  }
};
```

### 3. API Çağrıları

#### Basit GET isteği
```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.get('/v1/products');
if (response.status === 'SUCCESS') {
  console.log(response.data);
}
```

#### Query parametreleri ile GET
```typescript
const response = await apiClient.get('/v1/products', {
  params: { page: 1, size: 10, search: 'laptop' }
});
```

#### POST isteği
```typescript
const response = await apiClient.post('/v1/products', {
  name: 'Yeni Ürün',
  price: 1000
});
```

#### File Upload
```typescript
import { mediaService } from '@/services/admin.service';

const file = event.target.files[0];
const response = await mediaService.upload(file);
```

### 4. Servis Kullanımı

```typescript
import { productService } from '@/services/admin.service';

// Tüm ürünleri getir
const products = await productService.getAll();

// Sayfalama ile getir
const products = await productService.getAll({ 
  page: 1, 
  size: 20, 
  search: 'laptop' 
});

// Tek ürün getir
const product = await productService.getById('123');

// Yeni ürün oluştur
const newProduct = await productService.create({
  name: 'Yeni Ürün',
  price: 1000
});

// Ürün güncelle
const updated = await productService.update('123', {
  name: 'Güncellenmiş Ürün'
});

// Ürün sil
await productService.delete('123');
```

### 5. Auth Store Kullanımı

```typescript
import { useAuthStore } from '@/store/useAuthStore';

// Component içinde
const { currentUser, isAuthenticated, logout } = useAuthStore();

// Kullanıcı bilgisi
console.log(currentUser?.username);
console.log(currentUser?.firstName);
console.log(currentUser?.userGroups);

// Grup kontrolü
const isAdmin = useAuthStore((state) => state.hasUserGroup('ADMIN'));

// Logout
const handleLogout = () => {
  logout();
  router.push('/admin/login');
};
```

## Token Yönetimi

### Otomatik Token Refresh
API client otomatik olarak token'ı yeniler:
1. API isteği 401 döndüğünde
2. Refresh token ile yeni access token alınır
3. İstek otomatik olarak tekrar denenir
4. Refresh başarısız olursa login sayfasına yönlendirilir

### Token Saklama
- `accessToken`: 7 gün cookie'de saklanır
- `refreshToken`: 30 gün cookie'de saklanır
- Kullanıcı bilgileri: Zustand persist ile localStorage'da

## Middleware Koruması

`/admin/*` rotaları otomatik olarak korunur:
- Token yoksa `/admin/login` sayfasına yönlendirir
- `/admin/login` sayfası hariç tüm admin rotaları korunur

## Güvenlik

- HTTPS kullanımı önerilir (production)
- Cookie'ler `SameSite=Lax` ile korunur
- Token'lar `HttpOnly` olarak saklanabilir (backend tarafında)
- CORS ayarları backend'de yapılandırılmalı

## Örnek Kullanım Senaryosu

```typescript
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const response = await productService.getAll({ page: 1, size: 20 });
    
    if (response.status === 'SUCCESS') {
      setProducts(response.data);
    } else {
      console.error(response.errorMessage);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const response = await productService.delete(id);
    
    if (response.status === 'SUCCESS') {
      loadProducts(); // Listeyi yenile
    }
  };

  return (
    <div>
      <h1>Hoş geldin, {currentUser?.firstName}</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name}
              <button onClick={() => handleDelete(product.id)}>Sil</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Troubleshooting

### Token sürekli expire oluyor
- Backend'de token expire sürelerini kontrol edin
- Refresh token endpoint'inin çalıştığından emin olun

### CORS hatası alıyorum
- Backend CORS ayarlarını kontrol edin
- `CorsConfig.java` dosyasında frontend URL'ini ekleyin

### Login sonrası yönlendirme çalışmıyor
- Browser console'da hata var mı kontrol edin
- Cookie'lerin doğru set edildiğini kontrol edin
- Middleware'in doğru çalıştığını kontrol edin
