import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Save, X } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Textarea from '../../components/Textarea';
import RichContentRenderer from '../../components/RichContentRenderer';
import Toast from '../../components/Toast';
import { kvkkData } from '../../mock/kvkk';

export default function KVKK() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState(kvkkData.htmlContent);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleSave = () => {
    setToast({ message: 'KVKK content updated successfully!', type: 'success' });
    setIsEditing(false);
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.kvkk')}
            </h1>
            <p className="text-gray-600">Manage KVKK content</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800"
            >
              <Edit2 className="w-5 h-5" />
              Edit Content
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card className="p-8">
            <Textarea
              label="HTML Content"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} className="flex-1 bg-blue-900 hover:bg-blue-800">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setHtmlContent(kvkkData.htmlContent);
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <RichContentRenderer htmlContent={htmlContent} />
          </Card>
        )}

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
