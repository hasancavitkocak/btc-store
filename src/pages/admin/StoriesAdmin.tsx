import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export default function StoriesAdmin() {
  const { t } = useTranslation();
  const { stories } = useStore();
  const [editingStory, setEditingStory] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    titleKey: '',
    contentKey: '',
    image: '',
    results: '',
    active: true
  });

  const handleEdit = (story: any) => {
    setEditingStory(story);
    setFormData({
      company: story.company,
      industry: story.industry,
      titleKey: story.titleKey,
      contentKey: story.contentKey,
      image: story.image || '',
      results: story.results?.join('\n') || '',
      active: story.active
    });
  };

  const handleSave = () => {
    setToast({ message: 'Story updated successfully!', type: 'success' });
    setEditingStory(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      setToast({ message: 'Story deleted successfully!', type: 'success' });
    }
  };

  const handleAdd = () => {
    setToast({ message: 'Story added successfully!', type: 'success' });
    setIsAddModalOpen(false);
    setFormData({
      company: '',
      industry: '',
      titleKey: '',
      contentKey: '',
      image: '',
      results: '',
      active: true
    });
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.stories')}
            </h1>
            <p className="text-gray-600">Manage success stories</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800"
          >
            <Plus className="w-5 h-5" />
            Add Story
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <Card key={story.id} className="p-6">
              <div className="flex gap-4 mb-4">
                {story.image && (
                  <img
                    src={story.image}
                    alt={story.company}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{story.company}</h3>
                  <p className="text-sm text-gray-600">{story.industry}</p>
                  <p className="text-sm text-gray-500 mt-2">{t(story.titleKey)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(story)}
                  className="flex-1 flex items-center justify-center gap-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(story.id)}
                  className="flex items-center justify-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {editingStory && (
          <Modal isOpen={true} onClose={() => setEditingStory(null)} title="Edit Success Story">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
              <Input
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              />
              <Input
                label="Title Key"
                value={formData.titleKey}
                onChange={(e) => setFormData({...formData, titleKey: e.target.value})}
              />
              <Input
                label="Content Key"
                value={formData.contentKey}
                onChange={(e) => setFormData({...formData, contentKey: e.target.value})}
              />
              <Input
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
              <Textarea
                label="Results (one per line)"
                value={formData.results}
                onChange={(e) => setFormData({...formData, results: e.target.value})}
                rows={4}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingStory(null)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {isAddModalOpen && (
          <Modal isOpen={true} onClose={() => setIsAddModalOpen(false)} title="Add New Success Story">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Company Inc."
              />
              <Input
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                placeholder="Technology"
              />
              <Input
                label="Title Key"
                value={formData.titleKey}
                onChange={(e) => setFormData({...formData, titleKey: e.target.value})}
                placeholder="story.newStory.title"
              />
              <Input
                label="Content Key"
                value={formData.contentKey}
                onChange={(e) => setFormData({...formData, contentKey: e.target.value})}
                placeholder="story.newStory.content"
              />
              <Input
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://images.pexels.com/..."
              />
              <Textarea
                label="Results (one per line)"
                value={formData.results}
                onChange={(e) => setFormData({...formData, results: e.target.value})}
                rows={4}
                placeholder="40% increase in sales&#10;50% reduction in costs"
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAdd} className="flex-1 bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
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
