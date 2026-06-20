'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Shield,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Server,
  Wifi,
  Database,
  Zap,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  Ban,
  FileText,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for admin dashboard
const statsCards = [
  { titleKey: 'admin.totalUsers', value: '284,592', change: '+12.5%', positive: true, icon: Users, color: 'text-[#0ECB81]', bgGradient: 'from-[#0ECB81]/10 to-[#0ECB81]/5' },
  { titleKey: 'admin.volume24h', value: '$1.82B', change: '+8.3%', positive: true, icon: TrendingUp, color: 'text-[#F0B90B]', bgGradient: 'from-[#F0B90B]/10 to-[#F0B90B]/5' },
  { titleKey: 'admin.activeOrders', value: '42,891', change: '-2.1%', positive: false, icon: Activity, color: 'text-[#0ECB81]', bgGradient: 'from-[#0ECB81]/10 to-[#0ECB81]/5' },
  { titleKey: 'admin.platformRevenue', value: '$4.2M', change: '+18.7%', positive: true, icon: DollarSign, color: 'text-[#F0B90B]', bgGradient: 'from-[#F0B90B]/10 to-[#F0B90B]/5' },
];

const mockUsers = [
  { id: '1', name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', avatar: 'A', kycStatus: 'verified', role: 'user', status: 'active', lastActive: '2 min ago' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@example.com', avatar: 'S', kycStatus: 'pending', role: 'user', status: 'active', lastActive: '15 min ago' },
  { id: '3', name: 'Mohammed Hassan', email: 'mohammed@example.com', avatar: 'M', kycStatus: 'verified', role: 'user', status: 'suspended', lastActive: '3 days ago' },
  { id: '4', name: 'Elena Popov', email: 'elena.p@example.com', avatar: 'E', kycStatus: 'rejected', role: 'user', status: 'active', lastActive: '1 hour ago' },
  { id: '5', name: 'James Wilson', email: 'j.wilson@example.com', avatar: 'J', kycStatus: 'verified', role: 'moderator', status: 'active', lastActive: '5 min ago' },
  { id: '6', name: 'Yuki Tanaka', email: 'yuki.t@example.com', avatar: 'Y', kycStatus: 'pending', role: 'user', status: 'active', lastActive: '30 min ago' },
];

const mockFlaggedOrders = [
  { id: 'FO1', user: 'Ahmed Al-Rashid', pair: 'BTCUSDT', side: 'buy', amount: '$2.5M', reason: 'Large volume', time: '10 min ago' },
  { id: 'FO2', user: 'Elena Popov', pair: 'ETHUSDT', side: 'sell', amount: '$890K', reason: 'Rapid successive', time: '25 min ago' },
  { id: 'FO3', user: 'Yuki Tanaka', pair: 'SOLUSDT', side: 'buy', amount: '$450K', reason: 'New account', time: '1 hour ago' },
];

const mockKYCQueue = [
  { id: 'K1', name: 'Fatima Al-Zahra', docType: 'National ID + Selfie', submittedDate: '2024-01-15', country: 'Saudi Arabia' },
  { id: 'K2', name: 'Chen Wei Ming', docType: 'Passport + Proof of Address', submittedDate: '2024-01-15', country: 'Singapore' },
  { id: 'K3', name: 'Alex Petrov', docType: 'Driver License + Selfie', submittedDate: '2024-01-14', country: 'Russia' },
  { id: 'K4', name: 'Maria Garcia', docType: 'National ID + Selfie', submittedDate: '2024-01-14', country: 'Spain' },
];

const systemHealth = [
  { nameKey: 'admin.metricApiUptime', value: 99.97, unit: '%', status: 'healthy' as const, icon: Server },
  { nameKey: 'admin.metricAvgResponse', value: 42, unit: 'ms', status: 'healthy' as const, icon: Zap },
  { nameKey: 'admin.metricWebsocket', value: 12847, unit: '', status: 'healthy' as const, icon: Wifi },
  { nameKey: 'admin.metricDatabaseSize', value: 78, unit: '%', status: 'warning' as const, icon: Database },
];

const mockAuditLogs = [
  { id: 'AL1', timestamp: '2024-01-15 12:30:15', admin: 'Admin_QTBM', action: 'Suspend User', target: 'mohammed@example.com', result: 'success' },
  { id: 'AL2', timestamp: '2024-01-15 12:15:08', admin: 'Admin_QTBM', action: 'Approve KYC', target: 'ahmed@example.com', result: 'success' },
  { id: 'AL3', timestamp: '2024-01-15 11:45:22', admin: 'Mod_James', action: 'Flag Order', target: 'Order #FO2', result: 'success' },
  { id: 'AL4', timestamp: '2024-01-15 11:30:00', admin: 'Admin_QTBM', action: 'Update Announcement', target: 'ANN-003', result: 'success' },
  { id: 'AL5', timestamp: '2024-01-15 10:00:00', admin: 'Admin_QTBM', action: 'Reject KYC', target: 'elena.p@example.com', result: 'success' },
  { id: 'AL6', timestamp: '2024-01-14 18:22:10', admin: 'Mod_James', action: 'Freeze Withdrawal', target: 'user_x8f2k', result: 'success' },
  { id: 'AL7', timestamp: '2024-01-14 16:45:33', admin: 'Admin_QTBM', action: 'System Config Change', target: 'Trading Fee', result: 'success' },
  { id: 'AL8', timestamp: '2024-01-14 14:10:00', admin: 'Admin_QTBM', action: 'Create Announcement', target: 'ANN-004', result: 'success' },
];

const mockAnnouncements = [
  { id: 'ANN-001', title: 'Scheduled Maintenance - Jan 20', type: 'system', date: '2024-01-15', status: 'active' },
  { id: 'ANN-002', title: 'New Trading Pairs Available', type: 'promotion', date: '2024-01-14', status: 'active' },
  { id: 'ANN-003', title: 'Enhanced Security Measures', type: 'security', date: '2024-01-13', status: 'active' },
  { id: 'ANN-004', title: 'QTBM Earn - 12% APY on BNB', type: 'promotion', date: '2024-01-12', status: 'expired' },
];

export default function AdminDashboardView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'flagged'>('all');

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0B0E11]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139] shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#EAECEF]">{t('admin.title')}</h1>
            <Badge className="bg-[#F6465D]/10 text-[#F6465D] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold flex items-center gap-0.5">
              <Shield className="h-2.5 w-2.5" />
              {t('admin.adminBadge')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 text-xs">
            <Bell className="h-4 w-4 me-1" />
            <span className="hidden sm:inline">{t('admin.alerts')}</span>
            <Badge className="ms-1 bg-[#F6465D] text-white text-[8px] px-1 py-0 h-3 min-w-3 border-0">3</Badge>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.titleKey}
                  className={`bg-gradient-to-br ${stat.bgGradient} from-30% border border-[#2B3139] rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                      stat.positive ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                    }`}>
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-[#EAECEF] tabular-nums">{stat.value}</p>
                  <p className="text-[10px] text-[#5E6673] mt-0.5">{t(stat.titleKey)}</p>
                </div>
              );
            })}
          </div>

          {/* Users Management */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#848E9C]" />
                <span className="text-xs font-semibold text-[#848E9C]">{t('admin.usersManagement')}</span>
                <Badge className="bg-[#2B3139] text-[#848E9C] border-0 text-[9px] px-1.5 py-0 h-4">{mockUsers.length}</Badge>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5E6673]" />
                <Input
                  placeholder={t('admin.searchUsers')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-7 text-[11px] ps-8 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#3B4451] focus:border-[#F0B90B]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-start py-2 px-3 font-medium">{t('admin.user')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('admin.email')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.kyc')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.role')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.status')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('admin.lastActive')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#F0B90B] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-[#0B0E11] text-[10px] font-bold">{user.avatar}</span>
                          </div>
                          <span className="text-[#EAECEF] font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#848E9C]">{user.email}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          user.kycStatus === 'verified' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                          user.kycStatus === 'pending' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                          'bg-[#F6465D]/10 text-[#F6465D]'
                        }`}>
                          {user.kycStatus === 'verified' ? <CheckCircle2 className="h-2.5 w-2.5 me-0.5" /> :
                           user.kycStatus === 'pending' ? <Clock className="h-2.5 w-2.5 me-0.5" /> :
                           <XCircle className="h-2.5 w-2.5 me-0.5" />}
                          {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          user.role === 'moderator' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' : 'bg-[#2B3139] text-[#848E9C]'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          user.status === 'active' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-end text-[#5E6673]">{user.lastActive}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {user.status === 'active' ? (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10">
                              <Ban className="h-3 w-3 me-0.5" />
                              {t('admin.suspend')}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] text-[#0ECB81] hover:text-[#0ECB81] hover:bg-[#0ECB81]/10">
                              <UserCheck className="h-3 w-3 me-0.5" />
                              {t('admin.reactivate')}
                            </Button>
                          )}
                          {user.kycStatus === 'pending' && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] text-[#F0B90B] hover:text-[#F0B90B] hover:bg-[#F0B90B]/10">
                              <Eye className="h-3 w-3 me-0.5" />
                              {t('admin.verify')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Overview + KYC Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Orders Overview */}
            <div className="bg-[#1E2329] rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs font-semibold text-[#848E9C]">{t('admin.ordersOverview')}</span>
                </div>
                <div className="flex gap-0.5">
                  {(['all', 'pending', 'flagged'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        orderFilter === filter
                          ? 'bg-[#2B3139] text-[#F0B90B]'
                          : 'text-[#5E6673] hover:text-[#848E9C]'
                      }`}
                    >
                      {filter === 'all' ? t('admin.filterAll') : filter === 'pending' ? t('admin.filterPending') : t('admin.filterFlagged')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini chart placeholder */}
              <div className="px-3 py-3">
                <div className="h-20 bg-[#0B0E11] rounded flex items-center justify-center relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#F0B90B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,60 Q40,50 80,35 T160,40 T240,25 T320,30 T400,15" fill="none" stroke="#F0B90B" strokeWidth="2" />
                    <path d="M0,60 Q40,50 80,35 T160,40 T240,25 T320,30 T400,15 L400,80 L0,80 Z" fill="url(#adminChartGrad)" />
                  </svg>
                  <span className="relative z-10 text-[9px] text-[#5E6673]">{t('admin.orderVolume24h')}</span>
                </div>
              </div>

              {/* Flagged Orders */}
              <div className="px-3 pb-3">
                <p className="text-[10px] text-[#5E6673] font-semibold mb-2">{t('admin.flaggedOrders')}</p>
                <div className="space-y-2">
                  {mockFlaggedOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-[#0B0E11] rounded p-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#F0B90B] shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#EAECEF] font-medium">{order.user}</span>
                            <span className={`text-[9px] font-semibold ${order.side === 'buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                              {order.side.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#848E9C]">{order.pair}</span>
                          </div>
                          <span className="text-[9px] text-[#5E6673]">{order.reason} · {order.time}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#EAECEF] font-medium tabular-nums">{order.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KYC Queue */}
            <div className="bg-[#1E2329] rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs font-semibold text-[#848E9C]">{t('admin.kycQueue')}</span>
                  <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[9px] px-1.5 py-0 h-4 font-medium">
                    {mockKYCQueue.length} {t('admin.pendingCount')}
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {mockKYCQueue.map((kyc) => (
                  <div key={kyc.id} className="bg-[#0B0E11] rounded p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#2B3139] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[#848E9C] text-[10px] font-bold">{kyc.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#EAECEF] font-medium">{kyc.name}</p>
                          <p className="text-[9px] text-[#5E6673]">{kyc.country}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] text-[#0ECB81] hover:text-[#0ECB81] hover:bg-[#0ECB81]/10">
                          <CheckCircle2 className="h-3 w-3 me-0.5" />
                          {t('admin.approve')}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10">
                          <XCircle className="h-3 w-3 me-0.5" />
                          {t('admin.reject')}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-[#5E6673]">
                      <span className="flex items-center gap-0.5"><FileText className="h-2.5 w-2.5" />{kyc.docType}</span>
                      <span>{t('admin.submitted')}: {kyc.submittedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health + Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* System Health */}
            <div className="bg-[#1E2329] rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs font-semibold text-[#848E9C]">{t('admin.systemHealth')}</span>
                </div>
                <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px] px-1.5 py-0 h-4 font-medium">
                  {t('admin.operational')}
                </Badge>
              </div>
              <div className="p-3 space-y-3">
                {systemHealth.map((item) => {
                  const Icon = item.icon;
                  const barValue = item.nameKey === 'admin.metricApiUptime' ? item.value :
                                   item.nameKey === 'admin.metricAvgResponse' ? Math.max(0, 100 - (item.value / 200 * 100)) :
                                   item.nameKey === 'admin.metricWebsocket' ? Math.min(100, (item.value / 20000 * 100)) :
                                   item.value;
                  return (
                    <div key={item.nameKey}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${
                            item.status === 'healthy' ? 'text-[#0ECB81]' : 'text-[#F0B90B]'
                          }`} />
                          <span className="text-[11px] text-[#848E9C]">{t(item.nameKey)}</span>
                        </div>
                        <span className={`text-[11px] font-medium tabular-nums ${
                          item.status === 'healthy' ? 'text-[#0ECB81]' : 'text-[#F0B90B]'
                        }`}>
                          {typeof item.value === 'number' && item.value > 999 ? formatNumber(item.value) : item.value}{item.unit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            item.status === 'healthy' ? 'bg-[#0ECB81]' : 'bg-[#F0B90B]'
                          }`}
                          style={{ width: `${barValue}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-[#1E2329] rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs font-semibold text-[#848E9C]">{t('admin.recentAuditLogs')}</span>
                </div>
              </div>
              <ScrollArea className="h-64">
                <div className="p-3 space-y-0">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-2 border-b border-[#2B3139]/30 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#EAECEF] font-medium">{log.action}</span>
                          <span className="text-[9px] text-[#5E6673]">{t('admin.by')}</span>
                          <span className="text-[10px] text-[#F0B90B]">{log.admin}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-[#5E6673]">
                          <span>{t('admin.target')}: {log.target}</span>
                          <span>·</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[8px] px-1 py-0 h-3.5 shrink-0">
                        {log.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Announcements Management */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#848E9C]" />
                <span className="text-xs font-semibold text-[#848E9C]">{t('admin.announcements')}</span>
                <Badge className="bg-[#2B3139] text-[#848E9C] border-0 text-[9px] px-1.5 py-0 h-4">{mockAnnouncements.length}</Badge>
              </div>
              <Button size="sm" className="h-7 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] text-[10px] font-semibold px-3">
                <Plus className="h-3 w-3 me-1" />
                {t('admin.newAnnouncement')}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-start py-2 px-3 font-medium">{t('admin.id')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('admin.annTitle')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.type')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('admin.date')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.status')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAnnouncements.map((ann) => (
                    <tr key={ann.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                      <td className="py-2.5 px-3 text-[#848E9C] font-mono">{ann.id}</td>
                      <td className="py-2.5 px-3 text-[#EAECEF] font-medium">{ann.title}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          ann.type === 'system' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                          ann.type === 'security' ? 'bg-[#F6465D]/10 text-[#F6465D]' :
                          'bg-[#F0B90B]/10 text-[#F0B90B]'
                        }`}>
                          {ann.type.charAt(0).toUpperCase() + ann.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-end text-[#5E6673]">{ann.date}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          ann.status === 'active' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#5E6673]/10 text-[#5E6673]'
                        }`}>
                          {ann.status.charAt(0).toUpperCase() + ann.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#848E9C] hover:text-[#F0B90B] hover:bg-[#F0B90B]/10">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#848E9C] hover:text-[#F6465D] hover:bg-[#F6465D]/10">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
