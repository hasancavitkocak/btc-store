# Requirements Document

## Introduction

Bu özellik, web sitesinin üst menü yapısını güncellemek ve yöneticilerin backoffice panelinden menü öğelerini dinamik olarak yönetebilmesini sağlamak için geliştirilecektir. Mevcut menüden "İletişim" öğesi kaldırılacak ve "SAP Hizmetleri" ile "Sektörel Çözümler" gibi yeni menü öğeleri eklenecektir. Ayrıca, yöneticiler menü öğelerini ekleyebilecek, düzenleyebilecek, silebilecek ve sıralayabilecektir.

## Glossary

- **Menu Management System**: Yöneticilerin web sitesi menü öğelerini oluşturmasına, düzenlemesine, silmesine ve sıralamasına olanak tanıyan backoffice modülü
- **Header Component**: Web sitesinin üst kısmında görünen ve menü öğelerini içeren React bileşeni
- **Menu Item**: Menüde görünen ve bir sayfaya veya URL'ye yönlendiren tekil navigasyon öğesi
- **Admin Panel**: Yöneticilerin içerik yönetimi yaptığı backoffice arayüzü
- **Store**: Uygulama durumunu yöneten Zustand state management sistemi

## Requirements

### Requirement 1

**User Story:** Bir site yöneticisi olarak, mevcut menü yapısını güncellemek istiyorum, böylece "İletişim" öğesi kaldırılsın ve yeni menü öğeleri eklensin

#### Acceptance Criteria

1. WHEN sistem başlatıldığında, THE Menu Management System SHALL "İletişim" menü öğesini menüden kaldırmalıdır
2. WHEN sistem başlatıldığında, THE Menu Management System SHALL "SAP Hizmetleri" menü öğesini menüye eklemelidir
3. WHEN sistem başlatıldığında, THE Menu Management System SHALL "Sektörel Çözümler" menü öğesini menüye eklemelidir
4. THE Header Component SHALL güncellenmiş menü öğelerini doğru sırada görüntülemelidir
5. THE Header Component SHALL her menü öğesi için çeviri anahtarlarını (translation keys) kullanmalıdır

### Requirement 2

**User Story:** Bir site yöneticisi olarak, backoffice panelinden menü öğelerini yönetmek istiyorum, böylece geliştiriciye ihtiyaç duymadan menü değişiklikleri yapabileyim

#### Acceptance Criteria

1. THE Admin Panel SHALL menü yönetimi için ayrı bir sayfa içermelidir
2. WHEN yönetici menü yönetimi sayfasını açtığında, THE Menu Management System SHALL tüm mevcut menü öğelerini liste halinde görüntülemelidir
3. THE Menu Management System SHALL her menü öğesi için ID, etiket anahtarı (labelKey), yol (path) ve sıra bilgilerini görüntülemelidir
4. THE Menu Management System SHALL menü öğelerini sıra numarasına göre artan düzende listelemelidir
5. WHEN yönetici bir menü öğesine tıkladığında, THE Menu Management System SHALL düzenleme formunu açmalıdır

### Requirement 3

**User Story:** Bir site yöneticisi olarak, yeni menü öğeleri eklemek istiyorum, böylece web sitesi navigasyonunu genişletebiliyim

#### Acceptance Criteria

1. THE Menu Management System SHALL "Yeni Menü Öğesi Ekle" butonu içermelidir
2. WHEN yönetici "Yeni Menü Öğesi Ekle" butonuna tıkladığında, THE Menu Management System SHALL boş bir form görüntülemelidir
3. THE Menu Management System SHALL formda etiket anahtarı (labelKey) için zorunlu metin girişi alanı içermelidir
4. THE Menu Management System SHALL formda yol (path) için zorunlu metin girişi alanı içermelidir
5. THE Menu Management System SHALL formda sıra numarası için zorunlu sayı girişi alanı içermelidir
6. WHEN yönetici formu geçerli verilerle doldurduğunda ve kaydet butonuna tıkladığında, THE Menu Management System SHALL yeni menü öğesini Store'a eklemelidir
7. WHEN yeni menü öğesi eklendiğinde, THE Menu Management System SHALL başarı mesajı görüntülemelidir
8. WHEN yeni menü öğesi eklendiğinde, THE Header Component SHALL yeni menü öğesini anında görüntülemelidir

### Requirement 4

**User Story:** Bir site yöneticisi olarak, mevcut menü öğelerini düzenlemek istiyorum, böylece menü içeriğini güncelleyebiliyim

#### Acceptance Criteria

1. THE Menu Management System SHALL her menü öğesi için "Düzenle" butonu içermelidir
2. WHEN yönetici "Düzenle" butonuna tıkladığında, THE Menu Management System SHALL mevcut verilerle dolu bir form görüntülemelidir
3. WHEN yönetici formu güncelleyip kaydet butonuna tıkladığında, THE Menu Management System SHALL menü öğesini Store'da güncellemelidir
4. WHEN menü öğesi güncellendiğinde, THE Menu Management System SHALL başarı mesajı görüntülemelidir
5. WHEN menü öğesi güncellendiğinde, THE Header Component SHALL güncellenmiş menü öğesini anında görüntülemelidir

### Requirement 5

**User Story:** Bir site yöneticisi olarak, gereksiz menü öğelerini silmek istiyorum, böylece menüyü temiz ve düzenli tutabiliyim

#### Acceptance Criteria

1. THE Menu Management System SHALL her menü öğesi için "Sil" butonu içermelidir
2. WHEN yönetici "Sil" butonuna tıkladığında, THE Menu Management System SHALL onay diyalogu görüntülemelidir
3. WHEN yönetici silme işlemini onayladığında, THE Menu Management System SHALL menü öğesini Store'dan kaldırmalıdır
4. WHEN menü öğesi silindiğinde, THE Menu Management System SHALL başarı mesajı görüntülemelidir
5. WHEN menü öğesi silindiğinde, THE Header Component SHALL menü öğesini anında kaldırmalıdır

### Requirement 6

**User Story:** Bir site yöneticisi olarak, menü öğelerinin sırasını değiştirmek istiyorum, böylece menü düzenini optimize edebiliyim

#### Acceptance Criteria

1. THE Menu Management System SHALL menü öğelerini sıra numarasına göre sıralanmış şekilde görüntülemelidir
2. WHEN yönetici bir menü öğesinin sıra numarasını değiştirdiğinde, THE Menu Management System SHALL menü listesini yeni sıraya göre yeniden düzenlemelidir
3. THE Header Component SHALL menü öğelerini sıra numarasına göre artan düzende görüntülemelidir
4. THE Menu Management System SHALL sıra numaralarının benzersiz olmasını zorunlu kılmamalıdır (aynı sıra numarasına sahip öğeler ID'ye göre sıralanmalıdır)

### Requirement 7

**User Story:** Bir site kullanıcısı olarak, güncellenmiş menü yapısını görmek istiyorum, böylece yeni sayfalara kolayca erişebiliyim

#### Acceptance Criteria

1. THE Header Component SHALL tüm aktif menü öğelerini görüntülemelidir
2. WHEN kullanıcı bir menü öğesine tıkladığında, THE Header Component SHALL kullanıcıyı belirtilen yola yönlendirmelidir
3. THE Header Component SHALL menü öğelerini hem masaüstü hem de mobil görünümde görüntülemelidir
4. THE Header Component SHALL her menü öğesi için çeviri sistemini (i18n) kullanmalıdır
5. THE Header Component SHALL menü öğelerini Store'dan gerçek zamanlı olarak almalıdır
