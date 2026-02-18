'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { searchService, SearchFormData } from '../../services/search.service';
import { legalDocumentService } from '../../services/legalDocument.service';

type LegalDocumentType = 'KVKK' | 'GDPR' | 'PRIVACY_POLICY' | 'TERMS_OF_USE' | 'COOKIE_POLICY' | 'CONSENT_TEXT';

interface LegalDocument {
  id: number;
  code: string;
  documentType: LegalDocumentType;
  title: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  shortText: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  version: string;
  effectiveDate: string;
  isCurrentVersion: boolean;
  active: boolean;
}

const documentTypeLabels: Record<LegalDocumentType, string> = {
  KVKK: 'KVKK Aydınlatma Metni',
  GDPR: 'GDPR Privacy Policy',
  PRIVACY_POLICY: 'Gizlilik Politikası',
  TERMS_OF_USE: 'Kullanım Koşulları',
  COOKIE_POLICY: 'Çerez Politikası',
  CONSENT_TEXT: 'Onay Metni'
};

export default function LegalDocuments() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; code: string; title: string }>({
    isOpen: false,
    code: '',
    title: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadDocuments();
    }
  }, [page, mounted]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: [],
        sort: { name: 'effectiveDate', direction: 'DESC' }
      };

      const response = await searchService.search<LegalDocument>('legal-document', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setDocuments(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setToast({ message: 'Veri formatı hatalı', type: 'error' });
        }
      } else {
        setToast({ 
          message: response.errorMessage || 'Doküman listesi yüklenirken hata oluştu', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setToast({ message: 'Doküman listesi yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      const response = await legalDocumentService.delete(deleteDialog.code);
      
      if (response.status === 'ERROR') {
        setToast({ 
          message: response.errorMessage || 'Silme işlemi başarısız', 
          type: 'error' 
        });
        return;
      }
      
      setToast({ message: 'Doküman silindi', type: 'success' });
      setDeleteDialog({ isOpen: false, code: '', title: '' });
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setToast({ message: 'Silme işlemi başarısız', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              KVKK / GDPR Yönetimi
            </h1>
            <p className="text-gray-600">
              {totalElements > 0 ? `${totalElements} doküman bulundu` : 'Yasal metinleri ve onay dokümanlarını yönetin'}
            </p>
          </div>
          <Button 
            onClick={() => router.push('/admin/legal-documents/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Doküman
          </Button>
        </div>

        {loading && documents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </Card>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz doküman yok</h3>
            <p className="text-gray-500 mb-4">İlk yasal dokümanınızı oluşturun</p>
            <Button 
              onClick={() => router.push('/admin/legal-documents/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Doküman Ekle
            </Button>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doküman Tipi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Versiyon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yürürlük Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">
                            {documentTypeLabels[doc.documentType]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.title?.tr || doc.code}
                          </div>
                          {doc.shortText?.tr && (
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-md">
                              {doc.shortText.tr}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{doc.version}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {new Date(doc.effectiveDate).toLocaleDateString('tr-TR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {doc.isCurrentVersion && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Güncel
                              </span>
                            )}
                            {!doc.active && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                Pasif
                              </span>
                            )}
                            {doc.active && !doc.isCurrentVersion && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Aktif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/legal-documents/${doc.code}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, code: doc.code, title: doc.title?.tr || doc.code })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Toplam <span className="font-medium">{totalElements}</span> kayıt
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Önceki
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-4">
                    Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Dokümanı Sil"
          message={`"${deleteDialog.title}" dokümanını silmek istediğinizden emin misiniz?`}
          confirmText="Sil"
          cancelText="İptal"
          onConfirm={handleDelete}
          onClose={() => setDeleteDialog({ isOpen: false, code: '', title: '' })}
          type="danger"
        />
      </Container>
    </Section>
  );
}
