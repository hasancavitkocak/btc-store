'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
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
import { productService, ProductData } from '../services/product.service';
import { getLocalizedText, SupportedLocale } from '../lib/i18n-utils';

interface LegalDocument {
  code: string;
  title: { tr?: string; en?: string };
  shortText: { tr?: string; en?: string };
  content: { tr?: string; en?: string };
  version?: string;
}

export default function ProductContact() {
  const params = useParams();
  const code = params?.id as string;
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [privacyDocument, setPrivacyDocument] = useState<LegalDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    message: '',
    kvkkAccepted: false
  });

  useEffect(() => {
    if (code) {
      loadProduct(code);
      loadPrivacyPolicy();
    }
  }, [code]);

  const loadProduct = async (productCode: string) => {
    try {
      setLoading(true);
      const data = await productService.getPublicProductByCode(productCode);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrivacyPolicy = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api';
      const response = await fetch(`${apiUrl}/v1/public/legal-documents/privacy-policy/current`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'SUCCESS' && result.data) {
          setPrivacyDocument(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading privacy policy:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Privacy Policy kontrolü - sadece doküman varsa zorunlu
    if (privacyDocument && !formData.kvkkAccepted) {
      alert(t('callRequest.kvkk'));
      return;
    }

    try {
      setSubmitting(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/webapp/api';
      const response = await fetch(`${apiUrl}/v1/public/products/${code}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: `${formData.name} ${formData.surname}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          message: formData.message,
          product: {
            code: code
          },
          acceptedLegalDocument: privacyDocument && formData.kvkkAccepted ? {
            code: privacyDocument.code
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Form gönderilemedi');
      }

      const result = await response.json();
      
      if (result.status === 'SUCCESS') {
        setShowToast(true);
        setTimeout(() => {
          router.push(`/products/${code}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPrivacyContent = () => {
    if (!privacyDocument?.content) return '';
    return getLocalizedText(privacyDocument.content, locale);
  };

  const getPrivacyShortText = () => {
    if (!privacyDocument?.shortText) {
      return t('callRequest.kvkk');
    }
    return getLocalizedText(privacyDocument.shortText, locale) || t('callRequest.kvkk');
  };

  const getPrivacyTitle = () => {
    if (!privacyDocument?.title) {
      return t('kvkk.title');
    }
    return getLocalizedText(privacyDocument.title, locale) || t('kvkk.title');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <Section>
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('common.back')}</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('productContact.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {getLocalizedText(product.name, locale) || product.code}
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('productContact.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label={t('productContact.surname')}
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
              />

              <PhoneInput
                label={t('productContact.phone')}
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                required
              />

              <Input
                label={t('productContact.email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Textarea
                label={t('productContact.message')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                placeholder={t('productContact.messagePlaceholder')}
              />

              {/* Privacy Policy checkbox - sadece doküman varsa göster */}
              {privacyDocument && (
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
                    {getPrivacyShortText()}
                    <button
                      type="button"
                      onClick={() => setShowKvkkModal(true)}
                      className="text-blue-900 hover:underline ml-2 font-semibold"
                    >
                      ({t('callRequest.viewKvkk')})
                    </button>
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                className="bg-blue-900 hover:bg-blue-800"
                disabled={submitting}
              >
                {submitting ? 'Gönderiliyor...' : t('productContact.submit')}
              </Button>
            </form>
          </Card>
        </div>

        {/* Modal - sadece doküman varsa göster */}
        {privacyDocument && (
          <Modal
            isOpen={showKvkkModal}
            onClose={() => setShowKvkkModal(false)}
            title={getPrivacyTitle()}
            size="lg"
          >
            <div className="p-6">
              <RichContentRenderer htmlContent={getPrivacyContent()} />
              {privacyDocument.version && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  Versiyon: {privacyDocument.version}
                </div>
              )}
            </div>
          </Modal>
        )}

        {showToast && (
          <Toast
            message={t('productContact.success')}
            onClose={() => setShowToast(false)}
          />
        )}
      </Container>
    </Section>
  );
}
