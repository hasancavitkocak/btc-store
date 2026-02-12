// Email gönderme fonksiyonu
// Gerçek uygulamada bu bir API endpoint'e istek atacak
// Şimdilik console'a log yazıyoruz

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  productName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  message?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    console.log('📧 E-posta Gönderiliyor:', {
      to: data.to,
      subject: data.subject,
      body: data.body
    });

    // Gerçek uygulamada burada API çağrısı yapılacak:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.ok;

    // Şimdilik başarılı olduğunu varsayıyoruz
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
}

export function createProductContactEmailBody(data: {
  productName: string;
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
}): string {
  return `
Yeni Ürün İletişim Formu

Ürün: ${data.productName}

Müşteri Bilgileri:
- Ad Soyad: ${data.customerName} ${data.customerSurname}
- Telefon: ${data.customerPhone}
- E-posta: ${data.customerEmail}

Mesaj:
${data.message}

---
Bu e-posta otomatik olarak gönderilmiştir.
  `.trim();
}

export function createCallRequestEmailBody(data: {
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  message?: string;
}): string {
  return `
Yeni Arama Talebi

Müşteri Bilgileri:
- Ad Soyad: ${data.customerName} ${data.customerSurname}
- Telefon: ${data.customerPhone}

${data.message ? `Mesaj:\n${data.message}` : ''}

---
Bu e-posta otomatik olarak gönderilmiştir.
  `.trim();
}
