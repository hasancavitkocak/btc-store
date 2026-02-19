'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, 
  CheckCircle, UserPlus, Users, MessageSquare, Clock,
  Shield, X, XCircle, AlertCircle
} from 'lucide-react';
import { callRequestService, userGroupService, userService } from '@/services/admin.service';
import { 
  CallRequest, 
  CallRequestHistory, 
  CallRequestStatus,
  CallRequestPriority,
  STATUS_LABELS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  ACTION_TYPE_LABELS 
} from '@/types/callRequest';
import { ApiResponse } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

interface Props {
  requestId: number;
}

interface UserOption {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export default function CallRequestDetail({ requestId }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState<CallRequest | null>(null);
  const [history, setHistory] = useState<CallRequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CallRequestStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<CallRequestPriority | ''>('');
  const [comment, setComment] = useState('');
  const [showLegalDocumentDetails, setShowLegalDocumentDetails] = useState(false);
  const [closeComment, setCloseComment] = useState('');
  
  // Multi-select states
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  
  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserOption[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    loadData();
    loadUserGroups();
  }, [requestId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (userSearchQuery.length >= 2) {
        searchUsers();
      } else {
        setUserSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [userSearchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestResponse, historyResponse] = await Promise.all([
        callRequestService.getById(requestId),
        callRequestService.getHistory(requestId),
      ]);

      if (requestResponse.status === 'SUCCESS' && requestResponse.data) {
        const actualRequestData = requestResponse.data.data || requestResponse.data;
        setRequest(actualRequestData as CallRequest);
      }
      if (historyResponse.status === 'SUCCESS' && historyResponse.data) {
        const actualHistoryData = historyResponse.data.data || historyResponse.data;
        const historyArray = Array.isArray(actualHistoryData) ? actualHistoryData : [];
        setHistory(historyArray as CallRequestHistory[]);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      const response = await userGroupService.getAll();
      if (response.status === 'SUCCESS' && response.data) {
        const actualData = (response.data as any).data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        setUserGroups(dataArray);
      }
    } catch (error) {
      console.error('User groups yüklenirken hata:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchingUsers(true);
      const response = await userService.search(userSearchQuery);
      if (response.status === 'SUCCESS' && response.data) {
        const actualData = (response.data as any).data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        setUserSearchResults(dataArray);
      }
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;

    try {
      await callRequestService.updateStatus(requestId, selectedStatus, comment);
      setShowStatusModal(false);
      setComment('');
      setSelectedStatus('');
      loadData();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      alert('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleUpdatePriority = async () => {
    if (!selectedPriority) return;

    try {
      await callRequestService.updatePriority(requestId, selectedPriority);
      setShowPriorityModal(false);
      setSelectedPriority('');
      loadData();
    } catch (error) {
      console.error('Öncelik güncellenirken hata:', error);
      alert('Öncelik güncellenirken bir hata oluştu');
    }
  };

  const handleAssign = async () => {
    if (selectedGroups.length === 0 && selectedUsers.length === 0) {
      alert('En az bir grup veya kullanıcı seçmelisiniz');
      return;
    }

    try {
      // Assign to groups
      if (selectedGroups.length > 0) {
        if (selectedGroups.length === 1) {
          await callRequestService.assignToGroup(requestId, selectedGroups[0]);
        } else {
          await callRequestService.assignToGroups(requestId, selectedGroups);
        }
      }

      // Assign to users
      if (selectedUsers.length > 0) {
        const userIds = selectedUsers.map(u => u.id);
        if (userIds.length === 1) {
          await callRequestService.assignToUser(requestId, userIds[0]);
        } else {
          await callRequestService.assignToUsers(requestId, userIds);
        }
      }

      setShowAssignModal(false);
      setSelectedGroups([]);
      setSelectedUsers([]);
      setUserSearchQuery('');
      setUserSearchResults([]);
      loadData();
    } catch (error) {
      console.error('Atama yapılırken hata:', error);
      alert('Atama yapılırken bir hata oluştu');
    }
  };

  const handleCloseRequest = async () => {
    try {
      await callRequestService.closeRequest(requestId, closeComment);
      setShowCloseModal(false);
      setCloseComment('');
      loadData();
    } catch (error) {
      console.error('Çağrı kapatılırken hata:', error);
      alert('Çağrı kapatılırken bir hata oluştu');
    }
  };

  const toggleGroup = (groupCode: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupCode) 
        ? prev.filter(g => g !== groupCode)
        : [...prev, groupCode]
    );
  };

  const addUser = (user: UserOption) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: CallRequestStatus) => {
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: CallRequestPriority) => {
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${PRIORITY_COLORS[priority]}`}>
        {PRIORITY_LABELS[priority]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Call request bulunamadı</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Call Request #{request.id}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">İsim</div>
                  <div className="font-medium text-gray-900">{request.customerName}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <a href={`mailto:${request.customerEmail}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {request.customerEmail}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <a href={`tel:${request.customerPhone}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {request.customerPhone}
                  </a>
                </div>
              </div>

              {request.ipAddress && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">IP Adresi</div>
                    <div className="font-medium text-gray-900">{request.ipAddress}</div>
                  </div>
                </div>
              )}

              {request.acceptedLegalDocument && (
                <div className="bg-green-50 rounded-lg border border-green-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowLegalDocumentDetails(!showLegalDocumentDetails)}
                    className="w-full flex items-center justify-between p-4 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <div className="text-sm text-green-700 font-semibold">
                          Gizlilik Sözleşmesi Onayı Verilmiş
                        </div>
                        <div className="text-xs text-green-600 mt-0.5">
                          {showLegalDocumentDetails ? 'Detayları gizle' : 'Detayları görmek için tıklayın'}
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-green-600 transition-transform duration-200 ${
                        showLegalDocumentDetails ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showLegalDocumentDetails && (
                    <div className="border-t border-green-200 animate-fadeIn">
                      <div className="p-4 space-y-2 text-xs bg-white">
                        {/* Document Type */}
                        {request.acceptedLegalDocument.documentType && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Tip:</span>
                            <span className="text-gray-700 bg-green-50 px-2 py-1 rounded">
                              {request.acceptedLegalDocument.documentType}
                            </span>
                          </div>
                        )}
                        
                        {/* Title */}
                        {request.acceptedLegalDocument.title?.tr && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Başlık:</span>
                            <span className="text-gray-700">{request.acceptedLegalDocument.title.tr}</span>
                          </div>
                        )}
                        
                        {/* Version */}
                        {request.acceptedLegalDocument.version && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Versiyon:</span>
                            <span className="text-green-700 font-semibold">{request.acceptedLegalDocument.version}</span>
                          </div>
                        )}
                        
                        {/* Effective Date */}
                        {request.acceptedLegalDocument.effectiveDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Yürürlük Tarihi:</span>
                            <span className="text-gray-700">
                              {new Date(request.acceptedLegalDocument.effectiveDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        )}
                        
                        {/* Code */}
                        {request.acceptedLegalDocument.code && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium min-w-[100px]">Kod:</span>
                            <span className="text-gray-600 font-mono text-[10px]">
                              {request.acceptedLegalDocument.code}
                            </span>
                          </div>
                        )}
                        
                        {/* Short Text Preview */}
                        {request.acceptedLegalDocument.shortText?.tr && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-500 font-medium">Onaylanan Metin:</span>
                            <p className="text-gray-700 italic mt-1 bg-gray-50 p-2 rounded">
                              "{request.acceptedLegalDocument.shortText.tr}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Product Info */}
          {request.product && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlgili Ürün</h2>
              <div className="flex gap-4">
                {request.product.images && request.product.images.length > 0 && (
                  <img
                    src={request.product.images[0].absolutePath}
                    alt={request.product.name?.tr || request.product.name?.en || 'Ürün'}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {request.product.name?.tr || request.product.name?.en || 'İsimsiz Ürün'}
                  </h3>
                  {request.product.shortDescription?.tr && (
                    <p className="text-sm text-gray-600 mb-2">
                      {request.product.shortDescription.tr}
                    </p>
                  )}
                  {request.product.categories && request.product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {request.product.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {cat.name?.tr || cat.name?.en || cat.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Message */}
          {request.message && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mesaj</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
              </div>
            </Card>
          )}

          {/* History Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tarihçe</h2>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Clock className={`w-5 h-5 ${index === 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {ACTION_TYPE_LABELS[item.actionType]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.performedByUsername || 'System'} • {formatDate(item.createdDate)}
                        </div>
                      </div>
                      {item.oldStatus && item.newStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded ${STATUS_COLORS[item.oldStatus]}`}>
                            {STATUS_LABELS[item.oldStatus]}
                          </span>
                          <span>→</span>
                          <span className={`px-2 py-1 rounded ${STATUS_COLORS[item.newStatus]}`}>
                            {STATUS_LABELS[item.newStatus]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-700 mb-2">{item.description}</p>
                    )}
                    
                    {item.comment && (
                      <div className="bg-gray-50 p-3 rounded-lg mt-2">
                        <div className="text-sm text-gray-500 mb-1">Yorum:</div>
                        <p className="text-gray-700">{item.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hızlı Bilgi</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Durum</div>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Öncelik</div>
                <div className="mt-1">{getPriorityBadge(request.priority)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Oluşturulma</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(request.createdDate!)}</div>
              </div>
              
              {request.assignedGroups && request.assignedGroups.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500">Atanan Gruplar</div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.assignedGroups.map(g => g.description?.tr || g.description?.en || g.code || 'N/A').join(', ')}
                  </div>
                </div>
              )}
              
              {request.assignedUsers && request.assignedUsers.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500">Atanan Kullanıcılar</div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.assignedUsers.map(u => u.username).join(', ')}
                  </div>
                </div>
              )}
              
              {request.completedAt && (
                <div>
                  <div className="text-sm text-gray-500">Tamamlanma</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(request.completedAt)}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">İşlemler</h3>
            
            {request.status === CallRequestStatus.CLOSED ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Bu çağrı kapatılmıştır. İşlem yapılamaz.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Atama Yap
                </Button>
                
                <Button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Durum Güncelle
                </Button>

                <Button
                  onClick={() => setShowPriorityModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Öncelik Güncelle
                </Button>

                <Button
                  onClick={() => setShowCloseModal(true)}
                  className="w-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Çağrıyı Kapat
                </Button>

                <div className="pt-3 border-t border-gray-200">
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center transition-colors mb-2"
                  >
                    Mail Gönder
                  </a>
                  <a
                    href={`tel:${request.customerPhone}`}
                    className="block w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center transition-colors"
                  >
                    Telefon Et
                  </a>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Durum Güncelle"
        size="md"
      >
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yeni Durum
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CallRequestStatus)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Durum Seçin</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yorum (Opsiyonel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              placeholder="Durum değişikliği hakkında not ekleyin..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowStatusModal(false)}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!selectedStatus}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Güncelle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Priority Update Modal */}
      <Modal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        title="Öncelik Güncelle"
        size="md"
      >
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yeni Öncelik
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as CallRequestPriority)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Öncelik Seçin</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Öncelik Seviyeleri:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>Düşük:</strong> Standart takip</li>
              <li>• <strong>Orta:</strong> Normal öncelik (varsayılan)</li>
              <li>• <strong>Yüksek:</strong> Hızlı yanıt gerekli</li>
              <li>• <strong>Acil:</strong> Anında müdahale gerekli</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowPriorityModal(false)}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleUpdatePriority}
              disabled={!selectedPriority}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Güncelle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedGroups([]);
          setSelectedUsers([]);
          setUserSearchQuery('');
          setUserSearchResults([]);
        }}
        title="Atama Yap"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gruplar (Çoklu Seçim)
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
              {userGroups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Grup bulunamadı</p>
              ) : (
                <div className="space-y-2">
                  {userGroups.map((group) => (
                    <label key={group.code} className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-blue-200">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.code)}
                        onChange={() => toggleGroup(group.code)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{group.name || group.code}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedGroups.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedGroups.length} grup seçildi
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGroups([])}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">VE/VEYA</span>
            </div>
          </div>

          {/* User Search & Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kullanıcılar (Arama ile Ekle)
            </label>
            <div className="relative">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Kullanıcı ara (isim, email, kullanıcı adı)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchingUsers && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {userSearchResults.length > 0 && (
              <div className="mt-3 border border-gray-300 rounded-lg max-h-64 overflow-y-auto bg-white shadow-lg">
                {userSearchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => addUser(user)}
                    disabled={selectedUsers.some(u => u.id === user.id)}
                    className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.username}</div>
                        {user.email && <div className="text-sm text-gray-500 mt-1">{user.email}</div>}
                        {(user.firstName || user.lastName) && (
                          <div className="text-sm text-gray-600 mt-1">{user.firstName} {user.lastName}</div>
                        )}
                      </div>
                      {selectedUsers.some(u => u.id === user.id) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Seçildi</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {userSearchQuery.length > 0 && userSearchQuery.length < 2 && (
              <p className="mt-2 text-sm text-gray-500">En az 2 karakter girin...</p>
            )}

            {userSearchQuery.length >= 2 && !searchingUsers && userSearchResults.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">Kullanıcı bulunamadı</p>
            )}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-700">Seçili Kullanıcılar ({selectedUsers.length}):</div>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Tümünü Kaldır
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{user.username}</div>
                        {user.email && <div className="text-xs text-gray-500 truncate mt-1">{user.email}</div>}
                      </div>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="ml-3 p-1.5 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                        title="Kaldır"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedGroups([]);
                setSelectedUsers([]);
                setUserSearchQuery('');
                setUserSearchResults([]);
              }}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selectedGroups.length === 0 && selectedUsers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Ata ({selectedGroups.length + selectedUsers.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Request Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Çağrıyı Kapat"
        size="md"
      >
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Bu çağrıyı kapatmak istediğinizden emin misiniz? Kapatılan çağrılar sonlandırılmış olarak işaretlenir.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kapanış Notu (Opsiyonel)
            </label>
            <textarea
              value={closeComment}
              onChange={(e) => setCloseComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              placeholder="Çağrının kapatılma sebebini açıklayın..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => setShowCloseModal(false)}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleCloseRequest}
              className="flex-1 bg-gray-600 hover:bg-gray-700"
            >
              Kapat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
