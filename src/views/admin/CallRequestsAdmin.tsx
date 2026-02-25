'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Eye, Phone, Mail, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchService, SearchFormData } from '@/services/search.service';
import { 
  CallRequest, 
  CallRequestStatus, 
  STATUS_LABELS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS
} from '@/types/callRequest';
import Button from '@/components/Button';
import Card from '@/components/Card';

type SupportedLocale = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

export default function CallRequestsAdmin() {
  const router = useRouter();
  const t = useTranslations('admin.callRequestsAdmin');
  const tStatus = useTranslations('admin.callRequestStatus');
  const tPriority = useTranslations('admin.callRequestPriority');
  const locale = useLocale() as SupportedLocale;
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterStatus, setFilterStatus] = useState<CallRequestStatus | 'ALL'>('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadCallRequests();
    }
  }, [page, filterStatus, mounted]);

  const loadCallRequests = async () => {
    try {
      setLoading(true);
      
      const searchFormData: SearchFormData = {
        filters: filterStatus !== 'ALL' ? [
          {
            name: 'status',
            value: filterStatus
          }
        ] : [],
        sort: { name: 'createdDate', direction: 'DESC' }
      };

      const response = await searchService.search<CallRequest>('call-request', searchFormData, page);
      
      if (response.status === 'SUCCESS' && response.data) {
        const pageData = (response.data as any).data;
        
        if (pageData && pageData.content) {
          setCallRequests(pageData.content || []);
          setTotalPages(pageData.totalPages || 0);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.error('pageData structure is wrong:', pageData);
          setCallRequests([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setCallRequests([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Call requests yüklenirken hata:', error);
      setCallRequests([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CallRequestStatus) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
        {tStatus(status)}
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
          {t('title')}
        </h1>
        <p className="text-gray-600">{t('totalRequests', { count: totalElements })}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus('ALL'); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('total')}</div>
          <div className="text-2xl font-bold text-gray-900">{totalElements}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus(CallRequestStatus.PENDING); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('pending')}</div>
          <div className="text-2xl font-bold text-yellow-600">{getStatusCount(CallRequestStatus.PENDING)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus(CallRequestStatus.ASSIGNED); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('assigned')}</div>
          <div className="text-2xl font-bold text-blue-600">{getStatusCount(CallRequestStatus.ASSIGNED)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus(CallRequestStatus.IN_PROGRESS); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('inProgress')}</div>
          <div className="text-2xl font-bold text-purple-600">{getStatusCount(CallRequestStatus.IN_PROGRESS)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus(CallRequestStatus.CUSTOMER_INFORMED); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('customerInformed')}</div>
          <div className="text-2xl font-bold text-indigo-600">{getStatusCount(CallRequestStatus.CUSTOMER_INFORMED)}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setFilterStatus(CallRequestStatus.COMPLETED); setPage(1); }}>
          <div className="text-sm text-gray-600 mb-1">{t('completed')}</div>
          <div className="text-2xl font-bold text-green-600">{getStatusCount(CallRequestStatus.COMPLETED)}</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customerInfo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('assignedTo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('createdDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t('loading')}
                  </td>
                </tr>
              ) : callRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t('noRequests')}
                  </td>
                </tr>
              ) : (
                callRequests.map((request) => (
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
                        {request.message && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {request.message}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[request.priority]}`}>
                          {tPriority(request.priority)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        {/* Assigned Users */}
                        {request.assignedUsers && request.assignedUsers.length > 0 ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.assignedUsers.length === 1 
                                ? request.assignedUsers[0].username
                                : `${request.assignedUsers.length} ${t('users')}`}
                            </div>
                            {request.assignedUsers.length > 1 && (
                              <div className="text-xs text-gray-600">
                                {request.assignedUsers.map(u => u.username).join(', ')}
                              </div>
                            )}
                          </div>
                        ) : request.assignedUserName && (
                          <div className="font-medium text-gray-900">
                            {request.assignedUserName}
                          </div>
                        )}
                        
                        {/* Assigned Groups */}
                        {request.assignedGroups && request.assignedGroups.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {t('group')}: {request.assignedGroups.map(g => g.description?.[locale] || g.description?.tr || g.description?.en || g.code || 'N/A').join(', ')}
                          </div>
                        )}
                        
                        {/* Not assigned */}
                        {!request.assignedUsers?.length && !request.assignedUserName && 
                         !request.assignedGroups?.length && (
                          <span className="text-gray-400 italic">{t('notAssigned')}</span>
                        )}
                      </div>
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
                        {t('detail')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalElements > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {t('totalRecords', { count: totalElements })}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                {t('previous')}
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                {t('page')} <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages || 1}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                {t('next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
