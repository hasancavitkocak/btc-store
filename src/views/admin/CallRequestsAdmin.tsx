'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Filter, Phone, Mail, User, Calendar, Clock } from 'lucide-react';
import { callRequestService } from '@/services/admin.service';
import { CallRequest, CallRequestStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/callRequest';
import { ApiResponse } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function CallRequestsAdmin() {
  const router = useRouter();
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<CallRequestStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCallRequests();
  }, [filterStatus]);

  const loadCallRequests = async () => {
    try {
      setLoading(true);
      const response = filterStatus === 'ALL' 
        ? await callRequestService.getAll()
        : await callRequestService.getByStatus(filterStatus);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.status === 'SUCCESS' && response.data) {
        // Response.data is wrapped again, so we need response.data.data
        const actualData = response.data.data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        console.log('Setting callRequests:', dataArray);
        setCallRequests(dataArray as CallRequest[]);
      } else {
        console.log('Response not successful or no data');
        setCallRequests([]);
      }
    } catch (error) {
      console.error('Call requests yüklenirken hata:', error);
      setCallRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = callRequests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.customerName.toLowerCase().includes(searchLower) ||
      request.customerEmail.toLowerCase().includes(searchLower) ||
      request.customerPhone.includes(searchTerm) ||
      (request.subject && request.subject.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: CallRequestStatus) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    );
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

  const getStatusCount = (status: CallRequestStatus) => {
    return callRequests.filter(r => r.status === status).length;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Call Request Yönetimi
        </h1>
        <p className="text-gray-600">Tüm müşteri çağrılarını görüntüleyin ve yönetin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('ALL')}>
          <div className="text-sm text-gray-600 mb-1">Toplam</div>
          <div className="text-2xl font-bold text-gray-900">{callRequests.length}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus(CallRequestStatus.PENDING)}>
          <div className="text-sm text-gray-600 mb-1">Beklemede</div>
          <div className="text-2xl font-bold text-yellow-600">{getStatusCount(CallRequestStatus.PENDING)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus(CallRequestStatus.ASSIGNED)}>
          <div className="text-sm text-gray-600 mb-1">Atandı</div>
          <div className="text-2xl font-bold text-blue-600">{getStatusCount(CallRequestStatus.ASSIGNED)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus(CallRequestStatus.IN_PROGRESS)}>
          <div className="text-sm text-gray-600 mb-1">İşlemde</div>
          <div className="text-2xl font-bold text-purple-600">{getStatusCount(CallRequestStatus.IN_PROGRESS)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus(CallRequestStatus.CUSTOMER_INFORMED)}>
          <div className="text-sm text-gray-600 mb-1">Bilgilendirildi</div>
          <div className="text-2xl font-bold text-indigo-600">{getStatusCount(CallRequestStatus.CUSTOMER_INFORMED)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus(CallRequestStatus.COMPLETED)}>
          <div className="text-sm text-gray-600 mb-1">Tamamlandı</div>
          <div className="text-2xl font-bold text-green-600">{getStatusCount(CallRequestStatus.COMPLETED)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="İsim, email, telefon veya konu ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CallRequestStatus | 'ALL')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri Bilgileri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Arama kriterlerine uygun sonuç bulunamadı' : 'Henüz call request bulunmuyor'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <User className="w-4 h-4 text-gray-400" />
                          {request.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {request.customerEmail}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {request.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {request.subject || '-'}
                      </div>
                      {request.message && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {request.message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      {request.assignedUserName ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{request.assignedUserName}</div>
                          {request.assignedGroup && (
                            <div className="text-gray-600 text-xs">{request.assignedGroup}</div>
                          )}
                        </div>
                      ) : request.assignedGroup ? (
                        <div className="text-sm text-gray-600">{request.assignedGroup}</div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Atanmamış</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.createdDate ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.createdDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/call-requests/${request.id}`)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
