'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

type FormStatus = 'new' | 'inProgress' | 'completed';

export default function Forms() {
  const t = useTranslations();
  const { callRequests, productContactForms, products } = useStore();
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStatuses, setFormStatuses] = useState<Record<string, FormStatus>>({});

  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'inProgress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'inProgress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: FormStatus) => {
    return t(`admin.${status}`);
  };

  const handleViewDetails = (form: any, type: 'call' | 'product') => {
    setSelectedForm({ ...form, type });
    setIsModalOpen(true);
  };

  const handleStatusChange = (formId: string, newStatus: FormStatus) => {
    setFormStatuses(prev => ({ ...prev, [formId]: newStatus }));
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.forms')}
          </h1>
          <p className="text-gray-600">
            {callRequests.length + productContactForms.length} {t('admin.totalSubmissions')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Call Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('admin.callRequests')} ({callRequests.length})
            </h2>
            {callRequests.length === 0 ? (
              <Card className="p-6">
                <p className="text-gray-500 text-center">{t('admin.noCallRequests')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {callRequests.slice().reverse().map((request) => {
                  const status = formStatuses[request.id] || 'new';
                  return (
                    <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.name')}</p>
                            <p className="font-medium">{request.name} {request.surname}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.phone')}</p>
                            <p className="font-medium">
                              <a href={`tel:${request.phone}`} className="text-blue-900 hover:underline">
                                {request.phone}
                              </a>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.date')}</p>
                            <p className="font-medium text-sm">
                              {new Date(request.createdAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(request.id, e.target.value as FormStatus)}
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(status)}`}
                            >
                              <option value="new">{t('admin.new')}</option>
                              <option value="inProgress">{t('admin.inProgress')}</option>
                              <option value="completed">{t('admin.completed')}</option>
                            </select>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(request, 'call')}
                            className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t('admin.viewDetails')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Contact Forms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('admin.productContactForms')} ({productContactForms.length})
            </h2>
            {productContactForms.length === 0 ? (
              <Card className="p-6">
                <p className="text-gray-500 text-center">{t('admin.noProductForms')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {productContactForms.slice().reverse().map((form) => {
                  const product = products.find((p) => p.id === form.productId);
                  const status = formStatuses[form.id] || 'new';
                  return (
                    <Card key={form.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.product')}</p>
                            <p className="font-medium text-sm">{product ? t(product.nameKey) : form.productId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.name')}</p>
                            <p className="font-medium">{form.name} {form.surname}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.phone')}</p>
                            <p className="font-medium">
                              <a href={`tel:${form.phone}`} className="text-blue-900 hover:underline">
                                {form.phone}
                              </a>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('admin.email')}</p>
                            <p className="font-medium text-sm">
                              <a href={`mailto:${form.email}`} className="text-blue-900 hover:underline">
                                {form.email}
                              </a>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(form.id, e.target.value as FormStatus)}
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(status)}`}
                            >
                              <option value="new">{t('admin.new')}</option>
                              <option value="inProgress">{t('admin.inProgress')}</option>
                              <option value="completed">{t('admin.completed')}</option>
                            </select>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmail(form.email)}
                              className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(form, 'product')}
                              className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedForm?.type === 'call' ? t('admin.callRequests') : t('admin.productContactForms')}
          size="lg"
        >
          {selectedForm && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('admin.name')}</p>
                  <p className="font-medium">{selectedForm.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('admin.surname')}</p>
                  <p className="font-medium">{selectedForm.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('admin.phone')}</p>
                  <p className="font-medium">
                    <a href={`tel:${selectedForm.phone}`} className="text-blue-900 hover:underline">
                      {selectedForm.phone}
                    </a>
                  </p>
                </div>
                {selectedForm.email && (
                  <div>
                    <p className="text-sm text-gray-500">{t('admin.email')}</p>
                    <p className="font-medium">
                      <a href={`mailto:${selectedForm.email}`} className="text-blue-900 hover:underline">
                        {selectedForm.email}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">{t('admin.date')}</p>
                  <p className="font-medium">{new Date(selectedForm.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                {selectedForm.type === 'call' && (
                  <div>
                    <p className="text-sm text-gray-500">{t('admin.kvkkAccepted')}</p>
                    <p className="font-medium">{selectedForm.kvkkAccepted ? t('admin.yes') : t('admin.no')}</p>
                  </div>
                )}
                {selectedForm.productId && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">{t('admin.product')}</p>
                    <p className="font-medium">
                      {products.find(p => p.id === selectedForm.productId)?.nameKey}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedForm.message && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t('admin.message')}</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedForm.message}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedForm.email && (
                  <Button
                    onClick={() => handleSendEmail(selectedForm.email)}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t('admin.sendEmail')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  {t('common.close')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Container>
    </Section>
  );
}
