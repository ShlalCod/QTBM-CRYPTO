'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/lib/auth-context';
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
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/firestore';

// Types for real data
interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  status: string;
  kycStatus: string;
  createdAt: any;
}

interface AdminKYC {
  id: string;
  uid: string;
  status: string;
  level: string;
  [key: string]: any;
}

interface AdminAnnouncement {
  id: string;
  title: string;
  titleAr?: string;
  body?: string;
  bodyAr?: string;
  type: string;
  status: string;
  createdAt: any;
}

interface AdminTrade {
  tradeId: string;
  userId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: any;
}

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  result: string;
  timestamp: any;
}

export default function AdminDashboardView() {
  const { goBack } = useAppStore();
  const { firebaseUser, profile } = useAuth();
  const { t } = useTranslation();

  // State
  const [userSearch, setUserSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [kycQueue, setKycQueue] = useState<AdminKYC[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [recentTrades, setRecentTrades] = useState<AdminTrade[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalTrades: 0, pendingKYC: 0, activeAnnouncements: 0 });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '', type: 'system' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load all admin data from Firestore (with local cache)
  const loadAdminData = useCallback(async (useCache = true) => {
    if (!firebaseUser || profile?.role !== 'admin') return;

    // 1. Load from cache first (instant display)
    if (useCache) {
      try {
        const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem('qtbm:admin-data') : null;
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (Date.now() - parsed.timestamp < 2 * 60 * 1000) { // 2 min cache
            const d = parsed.data;
            setUsers(d.users || []);
            setKycQueue(d.kycQueue || []);
            setAnnouncements(d.announcements || []);
            setRecentTrades(d.recentTrades || []);
            setAuditLogs(d.auditLogs || []);
            setStats(d.stats || { totalUsers: 0, totalTrades: 0, pendingKYC: 0, activeAnnouncements: 0 });
            setLoading(false);
            return; // Cache is fresh, skip network
          }
        }
      } catch { /* ignore */ }
    }

    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(firestore, 'users'), limit(100)));
      const usersData = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminUser));
      setUsers(usersData);

      const kycSnap = await getDocs(query(collection(firestore, 'kyc'), where('status', '==', 'pending'), limit(50)));
      const kycData = kycSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminKYC));
      setKycQueue(kycData);

      const annSnap = await getDocs(query(collection(firestore, 'public'), where('type', '==', 'announcement'), limit(50)));
      const annData = annSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminAnnouncement));
      setAnnouncements(annData);

      const tradesSnap = await getDocs(query(collection(firestore, 'trades'), limit(20)));
      const tradesData = tradesSnap.docs.map(d => ({ tradeId: d.id, ...d.data() } as AdminTrade));
      setRecentTrades(tradesData);

      const logsSnap = await getDocs(query(collection(firestore, 'admin'), limit(50)));
      const logsData = logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
      setAuditLogs(logsData);

      const newStats = {
        totalUsers: usersData.length,
        totalTrades: tradesData.length,
        pendingKYC: kycData.length,
        activeAnnouncements: annData.filter(a => a.status === 'active').length,
      };
      setStats(newStats);

      // Cache admin data locally
      try {
        localStorage.setItem('qtbm:admin-data', JSON.stringify({
          data: { users: usersData, kycQueue: kycData, announcements: annData, recentTrades: tradesData, auditLogs: logsData, stats: newStats },
          timestamp: Date.now(),
        }));
      } catch { /* ignore */ }
    } catch (err) {
      // Offline — keep cached data
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, profile]);

  // Incremental refresh: reload only a specific collection (not all 5)
  const refreshCollection = useCallback(async (collectionName: 'users' | 'kyc' | 'public' | 'trades' | 'admin') => {
    try {
      if (collectionName === 'users') {
        const snap = await getDocs(query(collection(firestore, 'users'), limit(100)));
        const data = snap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminUser));
        setUsers(data);
        setStats(s => ({ ...s, totalUsers: data.length }));
      } else if (collectionName === 'kyc') {
        const snap = await getDocs(query(collection(firestore, 'kyc'), where('status', '==', 'pending'), limit(50)));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminKYC));
        setKycQueue(data);
        setStats(s => ({ ...s, pendingKYC: data.length }));
      } else if (collectionName === 'public') {
        const snap = await getDocs(query(collection(firestore, 'public'), where('type', '==', 'announcement'), limit(50)));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminAnnouncement));
        setAnnouncements(data);
        setStats(s => ({ ...s, activeAnnouncements: data.filter(a => a.status === 'active').length }));
      } else if (collectionName === 'trades') {
        const snap = await getDocs(query(collection(firestore, 'trades'), limit(20)));
        const data = snap.docs.map(d => ({ tradeId: d.id, ...d.data() } as AdminTrade));
        setRecentTrades(data);
        setStats(s => ({ ...s, totalTrades: data.length }));
      } else if (collectionName === 'admin') {
        const snap = await getDocs(query(collection(firestore, 'admin'), limit(50)));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
        setAuditLogs(data);
      }
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    loadAdminData(false);
  }, [loadAdminData]);

  // ─── Real admin actions ─────────────────────────────────────────────

  const writeAuditLog = async (action: string, target: string, result: 'success' | 'failed') => {
    if (!firebaseUser) return;
    try {
      await addDoc(collection(firestore, 'admin'), {
        admin: firebaseUser.uid,
        adminEmail: profile?.email || 'unknown',
        action,
        target,
        result,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  const handleSuspendUser = async (user: AdminUser) => {
    setActionLoading(user.uid);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        status: 'suspended',
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog('suspend_user', user.email || user.uid, 'success');
      toast.success(`تم تعليق المستخدم: ${user.displayName || user.email}`);
      refreshCollection("users");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التعليق';
      toast.error(msg);
      await writeAuditLog('suspend_user', user.email || user.uid, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (user: AdminUser) => {
    setActionLoading(user.uid);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        status: 'active',
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog('reactivate_user', user.email || user.uid, 'success');
      toast.success(`تم إعادة تفعيل المستخدم: ${user.displayName || user.email}`);
      refreshCollection("users");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إعادة التفعيل';
      toast.error(msg);
      await writeAuditLog('reactivate_user', user.email || user.uid, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveKYC = async (kyc: AdminKYC) => {
    setActionLoading(kyc.id);
    try {
      // Update KYC document
      await updateDoc(doc(firestore, 'kyc', kyc.id), {
        status: 'approved',
        reviewedBy: firebaseUser?.uid,
        reviewedAt: serverTimestamp(),
      });
      // Update user profile
      await updateDoc(doc(firestore, 'users', kyc.uid), {
        kycStatus: 'approved',
        status: 'kyc_approved',
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog('approve_kyc', kyc.id, 'success');
      toast.success(`تم اعتماد KYC: ${kyc.id}`);
      refreshCollection("kyc");
      refreshCollection("users");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الاعتماد';
      toast.error(msg);
      await writeAuditLog('approve_kyc', kyc.id, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectKYC = async (kyc: AdminKYC) => {
    setActionLoading(kyc.id);
    try {
      await updateDoc(doc(firestore, 'kyc', kyc.id), {
        status: 'rejected',
        reviewedBy: firebaseUser?.uid,
        reviewedAt: serverTimestamp(),
      });
      await updateDoc(doc(firestore, 'users', kyc.uid), {
        kycStatus: 'rejected',
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog('reject_kyc', kyc.id, 'success');
      toast.success(`تم رفض KYC: ${kyc.id}`);
      refreshCollection("kyc");
      refreshCollection("users");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الرفض';
      toast.error(msg);
      await writeAuditLog('reject_kyc', kyc.id, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }
    setActionLoading('create-ann');
    try {
      await addDoc(collection(firestore, 'public'), {
        title: newAnnouncement.title,
        body: newAnnouncement.body,
        type: 'announcement',
        announcementType: newAnnouncement.type,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: firebaseUser?.uid,
      });
      await writeAuditLog('create_announcement', newAnnouncement.title, 'success');
      toast.success('تم إنشاء الإعلان بنجاح');
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', body: '', type: 'system' });
      refreshCollection("public");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الإنشاء';
      toast.error(msg);
      await writeAuditLog('create_announcement', newAnnouncement.title, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnnouncement = async (ann: AdminAnnouncement) => {
    if (!confirm(`حذف الإعلان: ${ann.title}؟`)) return;
    setActionLoading(ann.id);
    try {
      await deleteDoc(doc(firestore, 'public', ann.id));
      await writeAuditLog('delete_announcement', ann.id, 'success');
      toast.success('تم حذف الإعلان');
      refreshCollection("public");
      refreshCollection("admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      toast.error(msg);
      await writeAuditLog('delete_announcement', ann.id, 'failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered users based on search
  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // Stats cards (real data)
  const statsCards = [
    { titleKey: 'admin.totalUsers', value: formatNumber(stats.totalUsers), change: '', positive: true, icon: Users, color: 'text-success', bgGradient: 'from-success/10 to-success/5' },
    { titleKey: 'admin.activeOrders', value: formatNumber(stats.totalTrades), change: '', positive: true, icon: Activity, color: 'text-primary', bgGradient: 'from-primary/10 to-primary/5' },
    { titleKey: 'admin.pendingCount', value: formatNumber(stats.pendingKYC), change: '', positive: false, icon: Shield, color: 'text-primary', bgGradient: 'from-primary/10 to-primary/5' },
    { titleKey: 'admin.announcements', value: formatNumber(stats.activeAnnouncements), change: '', positive: true, icon: Megaphone, color: 'text-primary', bgGradient: 'from-primary/10 to-primary/5' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label={t('actions.back')} className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={goBack}>
            <ArrowLeft className="rtl:scale-x-[-1] h-5 w-5 [dir=rtl]:rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground">{t('admin.title')}</h1>
            <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] px-1.5 py-0 h-4 font-semibold flex items-center gap-0.5">
              <Shield className="h-2.5 w-2.5" />
              {t('admin.adminBadge')}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={loadAdminData} className="text-xs">
          <Bell className="h-4 w-4 me-1" />
          {t('admin.alerts')}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.titleKey} className={`bg-gradient-to-br ${stat.bgGradient} from-30% border border-border rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t(stat.titleKey)}</p>
                </div>
              );
            })}
          </div>

          {/* Users Management */}
          <div className="bg-card rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{t('admin.usersManagement')}</span>
                <Badge className="bg-secondary text-muted-foreground border-0 text-[10px] px-1.5 py-0 h-4">{users.length}</Badge>
              </div>
              <div className="relative w-48">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('admin.searchUsers')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-7 text-[11px] ps-8 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('admin.user')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('admin.email')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.kyc')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.role')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.status')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">{t('admin.noUsers')}</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="border-b border-border/30 hover:bg-secondary/30">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
                              <span className="text-primary-foreground text-[10px] font-bold">{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
                            </div>
                            <span className="text-foreground font-medium">{user.displayName || '—'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{user.email}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                            user.kycStatus === 'approved' ? 'bg-success/10 text-success' :
                            user.kycStatus === 'pending' ? 'bg-primary/10 text-primary' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {user.kycStatus === 'approved' ? <CheckCircle2 className="h-2.5 w-2.5 me-0.5" /> :
                             user.kycStatus === 'pending' ? <Clock className="h-2.5 w-2.5 me-0.5" /> :
                             <XCircle className="h-2.5 w-2.5 me-0.5" />}
                            {user.kycStatus === 'approved' ? t('admin.kycStatusVerified') :
                             user.kycStatus === 'pending' ? t('admin.kycStatusPending') :
                             t('admin.kycStatusRejected')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                            user.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                            user.role === 'moderator' ? 'bg-primary/10 text-primary' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {user.role === 'admin' ? t('admin.roleAdmin') :
                             user.role === 'moderator' ? t('admin.roleModerator') :
                             t('admin.roleUser')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                            user.status === 'suspended' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                          }`}>
                            {user.status === 'suspended' ? t('admin.userStatusSuspended') : t('admin.userStatusActive')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1">
                            {user.status === 'suspended' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === user.uid}
                                onClick={() => handleReactivateUser(user)}
                                className="h-6 px-2 text-[10px] text-success hover:text-success hover:bg-success/10"
                              >
                                <UserCheck className="h-3 w-3 me-0.5" />
                                {t('admin.reactivate')}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === user.uid || user.role === 'admin'}
                                onClick={() => handleSuspendUser(user)}
                                className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Ban className="h-3 w-3 me-0.5" />
                                {t('admin.suspend')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trades + KYC Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recent Trades */}
            <div className="bg-card rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">آخر الصفقات</span>
                </div>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {recentTrades.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-4">لا توجد صفقات</p>
                ) : (
                  recentTrades.map((trade) => (
                    <div key={trade.tradeId} className="flex items-center justify-between bg-background rounded p-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-foreground font-medium">{trade.symbol}</span>
                            <span className={`text-[10px] font-semibold ${trade.side === 'buy' ? 'text-success' : 'text-destructive'}`}>
                              {trade.side === 'buy' ? t('orders.buy') : t('orders.sell')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{trade.quantity} @ ${trade.price}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{trade.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* KYC Queue */}
            <div className="bg-card rounded-lg">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">{t('admin.kycQueue')}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 h-4 font-medium">
                    {kycQueue.length} {t('admin.pendingCount')}
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {kycQueue.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-4">لا توجد طلبات KYC معلقة</p>
                ) : (
                  kycQueue.map((kyc) => (
                    <div key={kyc.id} className="bg-background rounded p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-[11px] text-foreground font-medium">{kyc.uid}</p>
                          <p className="text-[10px] text-muted-foreground">المستوى: {kyc.level || 'standard'}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === kyc.id}
                            onClick={() => handleApproveKYC(kyc)}
                            className="h-6 px-2 text-[10px] text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-3 w-3 me-0.5" />
                            {t('admin.approve')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === kyc.id}
                            onClick={() => handleRejectKYC(kyc)}
                            className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-3 w-3 me-0.5" />
                            {t('admin.reject')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-card rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{t('admin.recentAuditLogs')}</span>
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="p-3 space-y-0">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-4">لا توجد سجلات</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-2 border-b border-border/30 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.result === 'success' ? 'bg-success' : 'bg-destructive'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-foreground font-medium">{log.action}</span>
                          <span className="text-[10px] text-muted-foreground">{t('admin.by')}</span>
                          <span className="text-[10px] text-primary">{log.admin}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{t('admin.target')}: {log.target}</span>
                        </div>
                      </div>
                      <Badge className={`text-[10px] px-1 py-0 h-3.5 shrink-0 border-0 ${
                        log.result === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {log.result === 'success' ? t('admin.resultSuccess') : 'فشل'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Announcements Management */}
          <div className="bg-card rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{t('admin.announcements')}</span>
                <Badge className="bg-secondary text-muted-foreground border-0 text-[10px] px-1.5 py-0 h-4">{announcements.length}</Badge>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAnnouncementModal(true)}
                className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-semibold px-3"
              >
                <Plus className="h-3 w-3 me-1" />
                {t('admin.newAnnouncement')}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('admin.annTitle')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.type')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.status')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">لا توجد إعلانات</td></tr>
                  ) : (
                    announcements.map((ann) => (
                      <tr key={ann.id} className="border-b border-border/30 hover:bg-secondary/30">
                        <td className="py-2.5 px-3 text-foreground font-medium">{ann.title || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 font-medium bg-primary/10 text-primary">
                            {ann.announcementType || ann.type || 'system'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                            ann.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted-foreground/10 text-muted-foreground'
                          }`}>
                            {ann.status === 'active' ? t('admin.annStatusActive') : t('admin.annStatusExpired')}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoading === ann.id}
                              onClick={() => handleDeleteAnnouncement(ann)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* New Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAnnouncementModal(false)}>
          <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">إعلان جديد</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAnnouncementModal(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">العنوان</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="عنوان الإعلان"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">المحتوى</label>
                <textarea
                  value={newAnnouncement.body}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                  placeholder="محتوى الإعلان"
                  className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground min-h-20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">النوع</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                  className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground"
                >
                  <option value="system">نظام</option>
                  <option value="promotion">ترويجي</option>
                  <option value="security">أمان</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateAnnouncement}
                disabled={actionLoading === 'create-ann'}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {actionLoading === 'create-ann' ? 'جاري الإنشاء...' : 'إنشاء'}
              </Button>
              <Button variant="outline" onClick={() => setShowAnnouncementModal(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
