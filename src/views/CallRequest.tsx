'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
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
import { LegalDocument } from '../types/legalDocument';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

export default function CallRequest() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [privacyDocument, setPrivacyDocument] = useState<LegalDocument | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    message: '',
    privacyAccepted: false
  });

  // Fetch current Privacy Policy document on mount
  useEffect(() => {
    const fetchPrivacyDocument = async () => {
      try {
        const response = await fetch('http://localhost:9090/webapp/api/v1/public/legal-documents/privacy-policy/current');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'SUCCESS' && result.data) {
            setPrivacyDocument(result.data);
          }
        }
      } catch (error) {
        console.error('Privacy Policy document fetch error:', error);
      }
    };

    fetchPrivacyDocument();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Privacy Policy kontrolü - sadece doküman varsa zorunlu
    if (privacyDocument && !formData.privacyAccepted) {
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
          acceptedLegalDocument: privacyDocument && formData.privacyAccepted ? {
            code: privacyDocument.code
          } : null,
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

  const getPrivacyShortText = () => {
    if (!privacyDocument?.shortText) {
      return t('callRequest.kvkk');
    }
    return getLocalizedText(privacyDocument.shortText, locale) || t('callRequest.kvkk');
  };

  const getPrivacyContent = () => {
    if (!privacyDocument?.content) {
      return '';
    }
    return getLocalizedText(privacyDocument.content, locale);
  };

  const getPrivacyTitle = () => {
    if (!privacyDocument?.title) {
      return t('kvkk.title');
    }
    return getLocalizedText(privacyDocument.title, locale) || t('kvkk.title');
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

              {/* Privacy Policy checkbox - sadece doküman varsa göster */}
              {privacyDocument && (
                <div className="flex items-start gap-3 bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    required
                    className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-900"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 flex-1 leading-relaxed">
                    {getPrivacyShortText()}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-blue-900 hover:underline ml-2 font-semibold"
                    >
                      ({t('callRequest.viewKvkk')})
                    </button>
                  </label>
                </div>
              )}

              <Button type="submit" fullWidth size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all bg-blue-900 hover:bg-blue-800">
                {t('callRequest.submit')}
              </Button>
            </form>
          </Card>
        </div>

        {/* Modal - sadece doküman varsa göster */}
        {privacyDocument && (
          <Modal
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
            title={getPrivacyTitle()}
            size="lg"
          >
            <div className="p-6">
              <RichContentRenderer htmlContent={getPrivacyContent()} />
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                Versiyon: {privacyDocument.version}
              </div>
            </div>
          </Modal>
        )}

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
