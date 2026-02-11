'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
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

export default function ProductContact() {
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations();
  const router = useRouter();
  const { products, addProductContactForm, kvkk } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    message: '',
    kvkkAccepted: false
  });

  const product = products.find((p) => p.id === id);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.kvkkAccepted) {
      alert(t('callRequest.kvkk'));
      return;
    }

    const submission = {
      id: Date.now().toString(),
      productId: id!,
      ...formData,
      createdAt: new Date().toISOString()
    };

    addProductContactForm(submission);
    console.log('Product Contact Form Submitted:', submission);

    setShowToast(true);

    setTimeout(() => {
      router.push(`/products/${id}`);
    }, 2000);
  };

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
              {t(product.nameKey)}
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

              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="kvkk"
                  checked={formData.kvkkAccepted}
                  onChange={(e) => setFormData({ ...formData, kvkkAccepted: e.target.checked })}
                  required
                  className="mt-1 w-5 h-5 text-blue-900 rounded focus:ring-2 focus:ring-blue-900"
                />
                <label htmlFor="kvkk" className="text-sm text-gray-700 flex-1">
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

              <Button type="submit" fullWidth size="lg" className="bg-blue-900 hover:bg-blue-800">
                {t('productContact.submit')}
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
            message={t('productContact.success')}
            onClose={() => setShowToast(false)}
          />
        )}
      </Container>
    </Section>
  );
}
