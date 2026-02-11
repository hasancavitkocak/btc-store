import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Toast from '../../components/Toast';

export default function Categories() {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    nameKey: '',
    descriptionKey: '',
    image: '',
    icon: '',
    showOnHome: true,
    order: 0
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      nameKey: '',
      descriptionKey: '',
      image: '',
      icon: '',
      showOnHome: true,
      order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      nameKey: category.nameKey,
      descriptionKey: category.descriptionKey,
      image: category.image,
      icon: category.icon,
      showOnHome: category.showOnHome,
      order: category.order
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setToast({ message: 'Category updated successfully!', type: 'success' });
    } else {
      const newCategory = {
        ...formData,
        id: Date.now().toString()
      };
      addCategory(newCategory as any);
      setToast({ message: 'Category added successfully!', type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
      setToast({ message: 'Category deleted successfully!', type: 'success' });
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.categories')}
            </h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <Button onClick={openAddModal} className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.sort((a, b) => a.order - b.order).map((category) => (
            <Card key={category.id} className="p-6">
              <div className="flex gap-4">
                <img
                  src={category.image}
                  alt={t(category.nameKey)}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t(category.nameKey)}</h3>
                  <p className="text-gray-600 text-sm mb-2">{t(category.descriptionKey)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${category.showOnHome ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {category.showOnHome ? 'On Home' : 'Hidden'}
                    </span>
                    <span className="text-xs text-gray-500">Order: {category.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          size="lg"
        >
          <div className="p-6 space-y-4">
            <Input
              label="Name Key (translation key)"
              value={formData.nameKey}
              onChange={(e) => setFormData({ ...formData, nameKey: e.target.value })}
              placeholder="category.crm.name"
            />
            <Input
              label="Description Key (translation key)"
              value={formData.descriptionKey}
              onChange={(e) => setFormData({ ...formData, descriptionKey: e.target.value })}
              placeholder="category.crm.description"
            />
            <Input
              label="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Icon Name (Lucide React)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Users"
            />
            <Input
              label="Order"
              type="number"
              value={formData.order.toString()}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showOnHome"
                checked={formData.showOnHome}
                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="showOnHome" className="text-sm font-medium text-gray-700">
                Show on Home Page
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} fullWidth className="bg-blue-900 hover:bg-blue-800">
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

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
