import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

export default function Header() {
  const { t } = useTranslation();
  const { header, updateHeader } = useStore();
  const [logo, setLogo] = useState(header.logo);
  const [phone, setPhone] = useState(header.phone);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    updateHeader({ ...header, logo, phone });
    setToast({ message: 'Header updated successfully!', type: 'success' });
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.header')}
          </h1>
          <p className="text-gray-600">Manage header settings</p>
        </div>

        <Card className="p-6 max-w-2xl">
          <div className="space-y-4">
            <Input
              label="Logo Text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="Enter logo text"
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />

            <Button onClick={handleSave} fullWidth>
              Save Changes
            </Button>
          </div>
        </Card>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Container>
    </Section>
  );
}
