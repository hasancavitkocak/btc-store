'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Input from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import Modal from '../components/Modal';
import RichContentRenderer from '../components/RichContentRenderer';
import Toast from '../components/Toast';

export default function CallRequest() {
  const t = useTranslations();
  const router = useRouter();
  const { kvkk, addCallRequest } = useStore();
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    message: '',
    kvkkAccepted: false
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.kvkkAccepted) {
      alert(t('callRequest.kvkk'));
      return;
    }

    try {
      // Backend'e gönder
      const response = await fetch('http://localhost:9090/webapp/api/v1/public/call-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: `${formData.name} ${formData.surname}`.trim(),
          customerEmail: formData.email,
          customerPhone: formData.phone,
          message: formData.message,
          gdprConsent: formData.kvkkAccepted,
        }),
      });

      if (!response.ok) {
        throw new Error('Form gönderilemedi');
      }

      const result = await response.json();
      console.log('Call Request Submitted:', result);

      setShowToast(true);

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              {t('callRequest.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              {t('callRequest.subtitle')}
            </p>
          </div>

          <Card className="p-8 md:p-12 shadow-2xl bg-white border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('callRequest.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label={t('callRequest.surname')}
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  required
                />
              </div>

              <Input
                type="email"
                label={t('callRequest.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <PhoneInput
                label={t('callRequest.phone')}
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                required
              />

              <Textarea
                label={t('callRequest.message')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                placeholder={t('callRequest.messagePlaceholder')}
              />

              <div className="flex items-start gap-3 bg-blue-50 p-5 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="kvkk"
                  checked={formData.kvkkAccepted}
                  onChange={(e) => setFormData({ ...formData, kvkkAccepted: e.target.checked })}
                  required
                  className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-900"
                />
                <label htmlFor="kvkk" className="text-sm text-gray-700 flex-1 leading-relaxed">
                  {t('callRequest.kvkk')}
                  <button
                    type="button"
                    onClick={() => setShowKvkkModal(true)}
                    className="text-blue-900 hover:underline ml-2 font-semibold"
                  >
                    ({t('callRequest.viewKvkk')})
                  </button>
                </label>
              </div>

              <Button type="submit" fullWidth size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all bg-blue-900 hover:bg-blue-800">
                {t('callRequest.submit')}
              </Button>
            </form>
          </Card>
        </div>

        <Modal
          isOpen={showKvkkModal}
          onClose={() => setShowKvkkModal(false)}
          title={t('kvkk.title')}
          size="lg"
        >
          <div className="p-6">
            <RichContentRenderer htmlContent={kvkk.htmlContent} />
          </div>
        </Modal>

        {showToast && (
          <Toast
            message={t('callRequest.success')}
            onClose={() => setShowToast(false)}
          />
        )}
      </Container>
    </Section>
  );
}
