'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Phone, Mail, User, Calendar, CheckCircle } from 'lucide-react';
import { callRequestService } from '@/services/admin.service';
import { 
  CallRequest, 
  CallRequestStatus, 
  STATUS_LABELS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS
} from '@/types/callRequest';
import { ApiResponse } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function MyCallRequests() {
  const router = useRouter();
  const [myRequests, setMyRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const response = await callRequestService.getMyRequests();
      
      if (response.status === 'SUCCESS' && response.data) {
        // Response.data is wrapped again, so we need response.data.data
        const actualData = response.data.data || response.data;
        const dataArray = Array.isArray(actualData) ? actualData : [];
        setMyRequests(dataArray as CallRequest[]);
      } else {
        setMyRequests([]);
      }
    } catch (error) {
      console.error('Benim işlerim yüklenirken hata:', error);
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getPriorityColor = (createdDate: string) => {
    const hoursSinceCreated = (Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) return 'text-red-600';
    if (hoursSinceCreated > 12) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Benim İşlerim
        </h1>
        <p className="text-gray-600">Size atanmış call request'leri görüntüleyin ve yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Toplam İşlerim</div>
              <div className="text-3xl font-bold text-gray-900">{myRequests.length}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Bugün Eklenen</div>
              <div className="text-3xl font-bold text-purple-600">
                {myRequests.filter(r => {
                  if (!r.createdDate) return false;
                  const today = new Date().toDateString();
                  const createdDate = new Date(r.createdDate).toDateString();
                  return today === createdDate;
                }).length}
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Acil (24 saat+)</div>
              <div className="text-3xl font-bold text-red-600">
                {myRequests.filter(r => {
                  if (!r.createdDate) return false;
                  const hoursSinceCreated = (Date.now() - new Date(r.createdDate).getTime()) / (1000 * 60 * 60);
                  return hoursSinceCreated > 24;
                }).length}
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Yükleniyor...</p>
          </Card>
        ) : myRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-2">Size atanmış call request bulunmuyor</p>
            <p className="text-sm text-gray-400">Yeni işler atandığında burada görünecektir</p>
          </Card>
        ) : (
          myRequests.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Customer Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(request.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[request.priority]}`}>
                          {PRIORITY_LABELS[request.priority]}
                        </span>
                        {request.createdDate && (
                          <span className={`text-sm font-medium ${getPriorityColor(request.createdDate)}`}>
                            {(() => {
                              const hoursSinceCreated = (Date.now() - new Date(request.createdDate).getTime()) / (1000 * 60 * 60);
                              if (hoursSinceCreated > 24) return '🔴 Acil';
                              if (hoursSinceCreated > 12) return '🟠 Öncelikli';
                              return '🟢 Normal';
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{request.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${request.customerEmail}`} className="hover:text-blue-600">
                        {request.customerEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${request.customerPhone}`} className="hover:text-blue-600">
                        {request.customerPhone}
                      </a>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">{request.message}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions & Info */}
                <div className="lg:w-64 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    {request.createdDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(request.createdDate)}</span>
                      </div>
                    )}
                    
                    {/* Assigned Users */}
                    {request.assignedUserNames && request.assignedUserNames.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-500">Atanan: </span>
                        <span className="font-medium text-gray-700">
                          {request.assignedUserNames.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Assigned Groups */}
                    {request.assignedGroups && (
                      <div className="text-sm">
                        <span className="text-gray-500">Grup: </span>
                        <span className="font-medium text-gray-700">
                          {request.assignedGroups.split(';').join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => router.push(`/admin/call-requests/${request.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detay & İşlem Yap
                    </Button>
                    
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${request.customerEmail}`}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center transition-colors"
                      >
                        Mail Gönder
                      </a>
                      <a
                        href={`tel:${request.customerPhone}`}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium text-center transition-colors"
                      >
                        Ara
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
