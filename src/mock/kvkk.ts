export interface KVKKData {
  textKey: string;
  htmlContent: string;
}

export const kvkkData: KVKKData = {
  textKey: 'kvkk.text',
  htmlContent: `
    <h2>Kişisel Verilerin Korunması Hakkında Bilgilendirme</h2>
    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz aşağıdaki şekilde işlenmektedir:</p>

    <h3>Veri Sorumlusu</h3>
    <p>Şirket Adı: [Şirket Adı]<br>
    Adres: [Adres]<br>
    Telefon: [Telefon]<br>
    E-posta: [E-posta]</p>

    <h3>İşlenen Kişisel Veriler</h3>
    <ul>
      <li>Kimlik bilgileri (ad, soyad)</li>
      <li>İletişim bilgileri (telefon, e-posta)</li>
      <li>Talep içeriği</li>
    </ul>

    <h3>Kişisel Verilerin İşlenme Amacı</h3>
    <p>Kişisel verileriniz, iletişim talebinize cevap verebilmek ve size en uygun hizmeti sunabilmek amacıyla işlenmektedir.</p>

    <h3>Kişisel Verilerin Aktarımı</h3>
    <p>Kişisel verileriniz, yalnızca hizmet kalitesini artırmak ve yasal yükümlülüklerimizi yerine getirmek amacıyla, gerekli güvenlik önlemleri alınarak üçüncü kişilerle paylaşılabilir.</p>

    <h3>Kişisel Veri Sahibinin Hakları</h3>
    <p>KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri:</p>
    <ul>
      <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
      <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
      <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
      <li>Kişisel verilerin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
      <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
      <li>Kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
      <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,</li>
      <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme haklarına sahiptir.</li>
    </ul>

    <p>Bu haklarınızı kullanmak için [e-posta adresi] adresine başvurabilirsiniz.</p>

    <p><strong>Yukarıdaki metni okudum, anladım ve kabul ediyorum.</strong></p>
  `
};
