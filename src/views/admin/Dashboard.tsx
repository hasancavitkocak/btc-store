'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  LayoutDashboard, Image, FolderTree, Package, Users, BookOpen, FileText, 
  MessageSquare, RefreshCw, LucideIcon, Phone, Settings, UserCog, Mail, 
  Shield, Globe, Menu, Building, Handshake, UsersRound, ShoppingCart, Tag,
  Layers, Grid, List, Calendar, Clock, Bell, Star, Heart, Bookmark,
  Search, Filter, Download, Upload, Edit, Trash2, Plus, Minus,
  Check, X, AlertCircle, Info, HelpCircle, Eye, EyeOff, Lock,
  Unlock, Key, Home, Briefcase, Award, Target, TrendingUp, BarChart,
  PieChart, Activity, Zap, Cpu, Database, Server, Cloud, Wifi
} from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { dashboardService, DashboardModule } from '../../services/admin.service';
import { getLocalizedText, getCurrentLocale } from '../../lib/i18n-utils';

export default function Dashboard() {
  const t = useTranslations();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [cardModules, setCardModules] = useState<DashboardModule[]>([]);
  const [quickActionModules, setQuickActionModules] = useState<DashboardModule[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLocale = getCurrentLocale();

  // Icon mapping
  const iconMap: Record<string, LucideIcon> = {
    // Yaygın kullanılanlar
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    UsersRound,
    UserCog,
    Image,
    FileText,
    FolderTree,
    BookOpen,
    MessageSquare,
    Mail,
    Phone,
    Settings,
    Shield,
    Globe,
    Menu,
    Building,
    Handshake,
    Home,
    Briefcase,
    
    // Kategoriler ve organizasyon
    Tag,
    Layers,
    Grid,
    List,
    
    // Zaman ve takvim
    Calendar,
    Clock,
    
    // Bildirim ve işaretler
    Bell,
    Star,
    Heart,
    Bookmark,
    Award,
    Target,
    
    // Arama ve filtre
    Search,
    Filter,
    
    // Dosya işlemleri
    Download,
    Upload,
    
    // Düzenleme işlemleri
    Edit,
    Trash2,
    Plus,
    Minus,
    Check,
    X,
    
    // Bilgi ve uyarılar
    AlertCircle,
    Info,
    HelpCircle,
    
    // Güvenlik
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Key,
    
    // Grafikler ve analiz
    TrendingUp,
    BarChart,
    PieChart,
    Activity,
    
    // Teknoloji
    Zap,
    Cpu,
    Database,
    Server,
    Cloud,
    Wifi,
  };

  const fetchAuthorizedModules = async () => {
    try {
      setLoading(true);
      // CARD tipindeki modülleri count'larıyla birlikte al
      const cardsResponse = await dashboardService.getAuthorizedModulesByTypeWithCounts('CARD');
      const cardsData = (cardsResponse as any).data?.data || (cardsResponse as any).data || [];
      setCardModules(cardsData);

      // QUICK_ACTION tipindeki modülleri al
      const quickActionsResponse = await dashboardService.getAuthorizedModulesByType('QUICK_ACTION');
      const quickActionsData = (quickActionsResponse as any).data?.data || (quickActionsResponse as any).data || [];
      setQuickActionModules(quickActionsData);
    } catch (error) {
      console.error('Failed to fetch authorized modules:', error);
      setToast({ message: t('admin.dashboardPage.modulesLoadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedModules();
  }, []);

  const handleRefresh = () => {
    setToast({ message: t('admin.dashboardPage.refreshing'), type: 'success' });
    fetchAuthorizedModules();
  };

  const stats = cardModules.map(module => {
    const moduleName = getLocalizedText(module.name, currentLocale) || module.code;
    return {
      icon: iconMap[module.icon] || Package,
      label: moduleName,
      count: module.count || 0,
      link: module.link
    };
  });

  const quickActions = quickActionModules.map(module => {
    const moduleName = getLocalizedText(module.name, currentLocale) || module.code;
    const moduleDesc = getLocalizedText(module.description, currentLocale) || '';
    return {
      icon: iconMap[module.icon] || Settings,
      title: moduleName,
      description: moduleDesc,
      link: module.link
    };
  });

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-600">{t('admin.dashboardPage.loading')}</div>
          </div>
        </Container>
      </Section>
    );
  }

  if (cardModules.length === 0 && quickActionModules.length === 0) {
    return (
      <Section>
        <Container>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.dashboardPage.noAccess')}</h2>
            <p className="text-gray-600">{t('admin.dashboardPage.noAccessDescription')}</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600">{t('admin.welcome')}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.dashboardPage.refresh')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.link}>
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

        {quickActions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboardPage.quickActions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.link}>
                    <Card hover className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-100 p-3 rounded-xl">
                          <Icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
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