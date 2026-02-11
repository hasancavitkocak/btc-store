import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Image, FolderTree, Package, Users, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';

export default function Dashboard() {
  const { t } = useTranslation();
  const { banners, categories, products, references, stories, callRequests, productContactForms } = useStore();

  const stats = [
    { icon: Image, label: t('admin.banners'), count: banners.length, link: '/admin/banners' },
    { icon: FolderTree, label: t('admin.categories'), count: categories.length, link: '/admin/categories' },
    { icon: Package, label: t('admin.products'), count: products.length, link: '/admin/products' },
    { icon: Users, label: t('admin.references'), count: references.length, link: '/admin/references' },
    { icon: BookOpen, label: t('admin.stories'), count: stories.length, link: '/admin/stories' },
    { icon: MessageSquare, label: t('admin.forms'), count: callRequests.length + productContactForms.length, link: '/admin/forms' }
  ];

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600">Welcome to the admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.link}>
                <Card hover className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/admin/forms">
              <Card hover className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  View Form Submissions
                </h3>
                <p className="text-gray-600">
                  {callRequests.length + productContactForms.length} total submissions
                </p>
              </Card>
            </Link>
            <Link to="/admin/header">
              <Card hover className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Update Header Settings
                </h3>
                <p className="text-gray-600">
                  Manage logo, phone, and menu items
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}