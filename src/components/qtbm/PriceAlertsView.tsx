'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  Bell,
  Plus,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  X,
  Check,
  Clock,
  Mail,
  Smartphone,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67543.21, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, icon: 'Ξ' },
  { symbol: 'BNB', name: 'BNB', price: 598.45, icon: '◆' },
  { symbol: 'SOL', name: 'Solana', price: 178.92, icon: '◎' },
  { symbol: 'XRP', name: 'XRP', price: 0.6234, icon: '✕' },
  { symbol: 'ADA', name: 'Cardano', price: 0.4567, icon: '♦' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, icon: 'Ð' },
  { symbol: 'AVAX', name: 'Avalanche', price: 35.67, icon: '▲' },
];

interface PriceAlert {
  id: string;
  asset: string;
  assetIcon: string;
  type: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  notification: 'push' | 'email' | 'sms';
  recurring: boolean;
  enabled: boolean;
  note: string;
  createdAt: string;
}

interface TriggeredAlert {
  id: string;
  asset: string;
  assetIcon: string;
  type: 'above' | 'below';
  targetPrice: number;
  triggeredPrice: number;
  triggeredAt: string;
  notification: string;
}

const mockActiveAlerts: PriceAlert[] = [
  { id: '1', asset: 'BTC', assetIcon: '₿', type: 'above', targetPrice: 70000, currentPrice: 67543.21, notification: 'push', recurring: false, enabled: true, note: 'All-time high breakout', createdAt: '2024-03-01T10:30:00Z' },
  { id: '2', asset: 'ETH', assetIcon: 'Ξ', type: 'below', targetPrice: 3000, currentPrice: 3456.78, notification: 'email', recurring: true, enabled: true, note: 'Buy dip opportunity', createdAt: '2024-03-02T14:15:00Z' },
  { id: '3', asset: 'SOL', assetIcon: '◎', type: 'above', targetPrice: 200, currentPrice: 178.92, notification: 'push', recurring: false, enabled: true, note: 'Momentum play', createdAt: '2024-03-03T09:00:00Z' },
  { id: '4', asset: 'BNB', assetIcon: '◆', type: 'below', targetPrice: 550, currentPrice: 598.45, notification: 'sms', recurring: false, enabled: false, note: 'Support level watch', createdAt: '2024-03-04T16:45:00Z' },
  { id: '5', asset: 'DOGE', assetIcon: 'Ð', type: 'above', targetPrice: 0.15, currentPrice: 0.1234, notification: 'push', recurring: true, enabled: true, note: 'Meme rally target', createdAt: '2024-03-05T11:20:00Z' },
];

const mockTriggeredAlerts: TriggeredAlert[] = [
  { id: 't1', asset: 'BTC', assetIcon: '₿', type: 'above', targetPrice: 65000, triggeredPrice: 65012.34, triggeredAt: '2024-03-05T08:30:00Z', notification: 'Push' },
  { id: 't2', asset: 'ETH', assetIcon: 'Ξ', type: 'below', targetPrice: 3200, triggeredPrice: 3198.56, triggeredAt: '2024-03-04T22:15:00Z', notification: 'Email' },
  { id: 't3', asset: 'SOL', assetIcon: '◎', type: 'above', targetPrice: 175, triggeredPrice: 175.23, triggeredAt: '2024-03-04T14:00:00Z', notification: 'Push' },
  { id: 't4', asset: 'BNB', assetIcon: '◆', type: 'above', targetPrice: 580, triggeredPrice: 581.12, triggeredAt: '2024-03-03T10:45:00Z', notification: 'SMS' },
  { id: 't5', asset: 'XRP', assetIcon: '✕', type: 'below', targetPrice: 0.55, triggeredPrice: 0.5489, triggeredAt: '2024-03-02T18:30:00Z', notification: 'Push' },
  { id: 't6', asset: 'AVAX', assetIcon: '▲', type: 'above', targetPrice: 38, triggeredPrice: 38.12, triggeredAt: '2024-03-02T09:00:00Z', notification: 'Email' },
  { id: 't7', asset: 'ADA', assetIcon: '♦', type: 'below', targetPrice: 0.50, triggeredPrice: 0.4987, triggeredAt: '2024-03-01T16:20:00Z', notification: 'Push' },
  { id: 't8', asset: 'DOGE', assetIcon: 'Ð', type: 'above', targetPrice: 0.12, triggeredPrice: 0.1203, triggeredAt: '2024-03-01T12:10:00Z', notification: 'SMS' },
];

export default function PriceAlertsView() {
  const { goBack, isRTL } = useAppStore();
  const { t } = useTranslation();
  const { formatNum, formatDateTime } = useLocaleFmt();
  const [activeTab, setActiveTab] = useState<'active' | 'triggered' | 'expired'>('active');
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockActiveAlerts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: showCreateModal, onClose: () => { setShowCreateModal(false); resetForm(); }, ref: createModalRef });
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Create form state
  const [formAsset, setFormAsset] = useState(ASSETS[0]);
  const [formType, setFormType] = useState<'above' | 'below'>('above');
  const [formPrice, setFormPrice] = useState('');
  const [formNotification, setFormNotification] = useState<'push' | 'email' | 'sms'>('push');
  const [formRecurring, setFormRecurring] = useState(false);
  const [formNote, setFormNote] = useState('');

  const activeCount = alerts.filter(a => a.enabled).length;

  const resetForm = () => {
    setFormAsset(ASSETS[0]);
    setFormType('above');
    setFormPrice('');
    setFormNotification('push');
    setFormRecurring(false);
    setFormNote('');
    setEditingAlert(null);
  };

  const handleCreate = () => {
    const targetPrice = parseFloat(formPrice);
    if (isNaN(targetPrice) || targetPrice <= 0) return;

    if (editingAlert) {
      setAlerts(prev => prev.map(a => a.id === editingAlert.id ? {
        ...a,
        asset: formAsset.symbol,
        assetIcon: formAsset.icon,
        type: formType,
        targetPrice,
        notification: formNotification,
        recurring: formRecurring,
        note: formNote,
      } : a));
    } else {
      const newAlert: PriceAlert = {
        id: Date.now().toString(),
        asset: formAsset.symbol,
        assetIcon: formAsset.icon,
        type: formType,
        targetPrice,
        currentPrice: formAsset.price,
        notification: formNotification,
        recurring: formRecurring,
        enabled: true,
        note: formNote,
        createdAt: new Date().toISOString(),
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (alert: PriceAlert) => {
    const asset = ASSETS.find(a => a.symbol === alert.asset) || ASSETS[0];
    setFormAsset(asset);
    setFormType(alert.type);
    setFormPrice(alert.targetPrice.toString());
    setFormNotification(alert.notification);
    setFormRecurring(alert.recurring);
    setFormNote(alert.note);
    setEditingAlert(alert);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const getDistancePercent = (alert: PriceAlert) => {
    const diff = alert.targetPrice - alert.currentPrice;
    return ((diff / alert.currentPrice) * 100).toFixed(2);
  };

  const getProgressPercent = (alert: PriceAlert) => {
    if (alert.type === 'above') {
      const progress = (alert.currentPrice / alert.targetPrice) * 100;
      return Math.min(100, Math.max(0, progress));
    } else {
      const progress = ((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100;
      return Math.min(100, Math.max(0, 100 - progress));
    }
  };

  const formatDate = (dateStr: string) => {
    return formatDateTime(dateStr, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const notifLabel = (n: string) =>
    n === 'push' ? t('priceAlerts.notifPush')
    : n === 'email' ? t('priceAlerts.notifEmail')
    : n === 'sms' ? t('priceAlerts.notifSms')
    : n;

  const NotifIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'push': return <Bell className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <Smartphone className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <ScrollArea className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
              onClick={goBack}
              aria-label={t('common.back')}
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{t('priceAlerts.title')}</h1>
                <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2 py-0 h-5 font-semibold">
                  {activeCount} {t('priceAlerts.active')}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            className="gradient-yellow hover:opacity-90 text-background font-semibold h-9 px-4 text-sm shadow-md shadow-primary/20"
            onClick={() => { resetForm(); setShowCreateModal(true); }}
          >
            <Plus className="h-4 w-4 me-1.5" />
            {t('priceAlerts.createAlert')}
          </Button>
        </div>

        {/* Tab Selector with animated underline indicator */}
        <div className="flex bg-card rounded-lg p-1 mb-4 relative">
          {(['active', 'triggered', 'expired'] as const).map(tab => (
            <button
              key={tab}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 relative"
              onClick={() => setActiveTab(tab)}
            >
              <span className={activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}>
                {tab === 'active' ? t('priceAlerts.activeAlerts') : tab === 'triggered' ? t('priceAlerts.triggeredHistory') : t('priceAlerts.expired')}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="alert-tab-indicator"
                  className="absolute bottom-0 start-2 end-2 h-[2px] bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'active' ? (
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <svg width="64" height="64" viewBox="0 0 64 64" className="mb-4">
                      <circle cx="32" cy="28" r="20" fill="none" stroke="#2B3139" strokeWidth="2" />
                      <path d="M24 28 C24 20, 40 20, 40 28" fill="none" stroke="#2B3139" strokeWidth="2" />
                      <line x1="32" y1="48" x2="32" y2="56" stroke="#2B3139" strokeWidth="2" />
                      <line x1="26" y1="56" x2="38" y2="56" stroke="#2B3139" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="32" cy="28" r="3" fill="#F0B90B" opacity="0.5">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    <p className="text-muted-foreground text-sm">{t('priceAlerts.noAlerts')}</p>
                    <p className="text-muted-foreground text-xs mt-1">{t('priceAlerts.createFirst')}</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card className={`bg-card/80 backdrop-blur border-border alert-stripe-${alert.type} ${alert.enabled ? '' : 'opacity-60'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">
                                {alert.assetIcon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground text-sm">{alert.asset}/USDT</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                                    alert.type === 'above'
                                      ? 'bg-success/10 text-success'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}>
                                    {alert.type === 'above' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    {alert.type === 'above' ? t('priceAlerts.priceAbove') : t('priceAlerts.priceBelow')}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{formatDate(alert.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(alert)}
                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10 h-9 w-9 flex items-center justify-center"
                                aria-label={t('common.edit')}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              {deleteConfirm === alert.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(alert.id)}
                                    className="p-1.5 text-success hover:bg-success/10 rounded transition-colors h-9 w-9 flex items-center justify-center"
                                    aria-label={t('common.confirm')}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors h-9 w-9 flex items-center justify-center"
                                    aria-label={t('common.cancel')}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(alert.id)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 h-9 w-9 flex items-center justify-center"
                                  aria-label={t('common.delete')}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Price Info */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-[10px] text-muted-foreground">{t('priceAlerts.targetPrice')}</span>
                              <p className="text-sm font-semibold text-primary">${formatNum(alert.targetPrice)}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground">{t('priceAlerts.currentPrice')}</span>
                              <p className="text-sm font-semibold text-foreground">${formatNum(alert.currentPrice)}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-muted-foreground">{t('priceAlerts.distance')}</span>
                              <span className={`text-[10px] font-medium ${alert.type === 'above' ? 'text-success' : 'text-destructive'}`}>
                                {getDistancePercent(alert)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${alert.type === 'above' ? 'bg-success' : 'bg-destructive'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercent(alert)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex items-center gap-1">
                                <NotifIcon type={alert.notification} />
                                {notifLabel(alert.notification)}
                              </span>
                              {alert.recurring && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                  {t('priceAlerts.recurring')}
                                </span>
                              )}
                              {alert.note && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{alert.note}</span>
                              )}
                            </div>
                            <button
                              onClick={() => toggleAlert(alert.id)}
                              className="transition-colors h-9 w-9 flex items-center justify-center"
                              aria-label={t('priceAlerts.toggleAlert')}
                            >
                              {alert.enabled ? (
                                <ToggleRight className="h-6 w-6 text-success" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {mockTriggeredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className="bg-card/80 backdrop-blur border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold">
                              {alert.assetIcon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm">{alert.asset}/USDT</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                                  alert.type === 'above'
                                    ? 'bg-success/10 text-success'
                                    : 'bg-destructive/10 text-destructive'
                                }`}>
                                  {alert.type === 'above' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                  {alert.type === 'above' ? t('priceAlerts.priceAbove') : t('priceAlerts.priceBelow')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{formatDate(alert.triggeredAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className="text-[10px] text-muted-foreground">{t('priceAlerts.triggeredAt')}</p>
                            <p className="text-sm font-semibold text-primary">${formatNum(alert.triggeredPrice)}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {notifLabel(alert.notification)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Create/Edit Alert Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
            >
              <motion.div
                ref={createModalRef}
                role="dialog"
                aria-modal="true"
                aria-label={editingAlert ? t('priceAlerts.editAlert') : t('priceAlerts.createAlert')}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-card rounded-t-xl sm:rounded-xl border border-border w-full max-w-md max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-foreground">
                      {editingAlert ? t('priceAlerts.editAlert') : t('priceAlerts.createAlert')}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-9 w-9"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      aria-label={t('common.close')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Asset Selector */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t('priceAlerts.selectAsset')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ASSETS.map(asset => (
                        <button
                          key={asset.symbol}
                          className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                            formAsset.symbol === asset.symbol
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-secondary border border-transparent hover:border-border'
                          }`}
                          onClick={() => setFormAsset(asset)}
                        >
                          <span className="text-lg mb-0.5">{asset.icon}</span>
                          <span className="text-[10px] font-medium text-foreground">{asset.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alert Type */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t('priceAlerts.alertType')}</label>
                    <div className="flex bg-secondary rounded-lg p-1">
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                          formType === 'above' ? 'bg-success/10 text-success' : 'text-muted-foreground'
                        }`}
                        onClick={() => setFormType('above')}
                      >
                        <ArrowUp className="h-4 w-4" />
                        {t('priceAlerts.priceAbove')}
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                          formType === 'below' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'
                        }`}
                        onClick={() => setFormType('below')}
                      >
                        <ArrowDown className="h-4 w-4" />
                        {t('priceAlerts.priceBelow')}
                      </button>
                    </div>
                  </div>

                  {/* Target Price */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-muted-foreground">{t('priceAlerts.targetPrice')}</label>
                      <span className="text-[10px] text-muted-foreground">
                        {t('priceAlerts.current')}: ${formatNum(formAsset.price)}
                      </span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-lg font-semibold focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Notification Method */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t('priceAlerts.notificationMethod')}</label>
                    <div className="flex bg-secondary rounded-lg p-1">
                      {(['push', 'email', 'sms'] as const).map(method => (
                        <button
                          key={method}
                          className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                            formNotification === method
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setFormNotification(method)}
                        >
                          <NotifIcon type={method} />
                          {notifLabel(method)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* One-time / Recurring */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t('priceAlerts.frequency')}</label>
                    <div className="flex bg-secondary rounded-lg p-1">
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                          !formRecurring ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        }`}
                        onClick={() => setFormRecurring(false)}
                      >
                        {t('priceAlerts.oneTime')}
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                          formRecurring ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        }`}
                        onClick={() => setFormRecurring(true)}
                      >
                        {t('priceAlerts.recurring')}
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t('priceAlerts.note')}</label>
                    <Input
                      placeholder={t('priceAlerts.notePlaceholder')}
                      value={formNote}
                      onChange={e => setFormNote(e.target.value)}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-10 text-sm focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    className="w-full gradient-yellow hover:opacity-90 text-background font-semibold h-11 text-sm shadow-md shadow-primary/20"
                    onClick={handleCreate}
                    disabled={!formPrice || parseFloat(formPrice) <= 0}
                  >
                    {editingAlert ? t('priceAlerts.updateAlert') : t('priceAlerts.createAlert')}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
