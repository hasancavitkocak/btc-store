import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Container from '../components/Container';
import Section from '../components/Section';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import RichContentRenderer from '../components/RichContentRenderer';
import Toast from '../components/Toast';

export default function CallRequest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kvkk, addCallRequest } = useStore();
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    kvkkAccepted: false
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.kvkkAccepted) {
      alert(t('callRequest.kvkk'));
      return;
    }

    const submission = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    addCallRequest(submission);
    console.log('Call Request Submitted:', submission);

    setShowToast(true);

    setTimeout(() => {
      navigate('/');
    }, 2000);
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

          <Card className="p-8 md:p-12 shadow-2xl bg-gradient-to-br from-white to-gray-50">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                label={t('callRequest.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-lg"
              />

              <Input
                label={t('callRequest.surname')}
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
                className="text-lg"
              />

              <Input
                label={t('callRequest.phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="text-lg"
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

              <Button type="submit" fullWidth size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all">
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
