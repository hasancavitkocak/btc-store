'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, 
  CheckCircle, UserPlus, Users, MessageSquare, Clock,
  Shield
} from 'lucide-react';
import { callRequestService, userGroupService } from '@/services/admin.service';
import { 
  CallRequest, 
  CallRequestHistory, 
  CallRequestStatus, 
  STATUS_LABELS, 
  STATUS_COLORS,
  ACTION_TYPE_LABELS 
} from '@/types/callRequest';
import { ApiResponse } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

interface Props {
  requestId: number;
}

export default function CallRequestDetail({ requestId }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState<CallRequest | null>(null);
  const [history, setHistory] = useState<CallRequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CallRequestStatus | ''>('');
  const [comment, setComment] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [userGroups, setUserGroups] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadUserGroups();
  }, [requestId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestResponse, historyResponse] = await Promise.all([
        callRequestService.getById(requestId),
        callRequestService.getHistory(requestId),
      ]);

      if (requestResponse.status === 'SUCCESS' && requestResponse.data) {
        // Handle wrapped data
        const actualRequestData = requestResponse.data.data || requestResponse.data;
        setRequest(actualRequestData as CallRequest);
      }
      if (historyResponse.status === 'SUCCESS' && historyResponse.data) {
        // Handle wrapped data
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
        // Handle wrapped data
        const actualData = response.data.data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        setUserGroups(dataArray);
      }
    } catch (error) {
      console.error('User groups yüklenirken hata:', error);
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

  const handleAssignToGroup = async () => {
    if (!groupCode) return;

    try {
      await callRequestService.assignToGroup(requestId, groupCode);
      setShowAssignModal(false);
      setGroupCode('');
      loadData();
    } catch (error) {
      console.error('Gruba atanırken hata:', error);
      alert('Gruba atanırken bir hata oluştu');
    }
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
            <p className="text-gray-600">{request.subject || 'Konu belirtilmemiş'}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(request.status)}
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

              {request.gdprConsent && (
                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-green-700">
                    KVKK/GDPR onayı verilmiş
                  </div>
                </div>
              )}
            </div>
          </Card>

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
                <div className="text-sm text-gray-500">Oluşturulma</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(request.createdDate)}</div>
              </div>
              
              {request.assignedGroup && (
                <div>
                  <div className="text-sm text-gray-500">Atanan Grup</div>
                  <div className="text-sm font-medium text-gray-900">{request.assignedGroup}</div>
                </div>
              )}
              
              {request.assignedUserName && (
                <div>
                  <div className="text-sm text-gray-500">Atanan Kullanıcı</div>
                  <div className="text-sm font-medium text-gray-900">{request.assignedUserName}</div>
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
            <div className="space-y-3">
              <Button
                onClick={() => setShowAssignModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Gruba Ata
              </Button>
              
              <Button
                onClick={() => setShowStatusModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Durum Güncelle
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
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Durum Güncelle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Durum
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CallRequestStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Durum Seçin</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yorum (Opsiyonel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Durum değişikliği hakkında not ekleyin..."
            />
          </div>

          <div className="flex gap-3">
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
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Güncelle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign to Group Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Gruba Ata"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grup Seçin
            </label>
            <select
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Grup Seçin</option>
              {userGroups.map((group) => (
                <option key={group.code} value={group.code}>
                  {group.name || group.code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowAssignModal(false)}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleAssignToGroup}
              disabled={!groupCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Ata
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
