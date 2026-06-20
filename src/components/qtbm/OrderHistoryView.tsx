'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockOrders, formatPrice, formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/types';

type FilterTab = 'all' | 'open' | 'filled' | 'canceled';
type DateRange = 'today' | '7d' | '30d' | 'custom';

const filterTabs: { id: FilterTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'open', labelKey: 'orders.open' },
  { id: 'filled', labelKey: 'orders.filled' },
  { id: 'canceled', labelKey: 'orders.canceled' },
];

const dateRanges: { id: DateRange; labelKey: string }[] = [
  { id: 'today', labelKey: 'orders.today' },
  { id: '7d', labelKey: 'orders.days7' },
  { id: '30d', labelKey: 'orders.days30' },
  { id: 'custom', labelKey: 'orders.custom' },
];

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; labelKey: string }> = {
  pending: { color: 'text-[#F0B90B]', bgColor: 'bg-[#F0B90B]/10', icon: Clock, labelKey: 'orders.statusPending' },
  partially_filled: { color: 'text-[#2B7DE9]', bgColor: 'bg-[#2B7DE9]/10', icon: Loader2, labelKey: 'orders.statusPartial' },
  filled: { color: 'text-[#0ECB81]', bgColor: 'bg-[#0ECB81]/10', icon: CheckCircle2, labelKey: 'orders.statusFilled' },
  canceled: { color: 'text-[#F6465D]', bgColor: 'bg-[#F6465D]/10', icon: X, labelKey: 'orders.statusCanceled' },
};

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const { t } = useTranslation();
  const filledPct = order.quantity > 0 ? (order.filledQty / order.quantity) * 100 : 0;
  const sideColor = order.side === 'buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]';
  const sideBg = order.side === 'buy' ? 'bg-[#0ECB81]/10' : 'bg-[#F6465D]/10';
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isOpen = order.status === 'pending' || order.status === 'partially_filled';
  const baseAsset = order.market.replace('USDT', '').replace('BTC', '').replace('ETH', '').replace('BNB', '');
  const quoteAsset = order.market.replace(baseAsset, '');

  return (
    <div className="bg-[#1E2329] rounded-lg border border-[#2B3139] p-4 hover:border-[#3B4451] transition-all duration-200">
      {/* Top row: Pair + Side + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#EAECEF]">{baseAsset}</span>
          <span className="text-xs text-[#5E6673]">/{quoteAsset}</span>
          <Badge className={`text-[10px] h-5 px-1.5 border-0 ${sideBg} ${sideColor} font-semibold`}>
            {order.side === 'buy' ? t('orders.buy') : t('orders.sell')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] h-5 px-1.5 border-0 ${status.bgColor} ${status.color} font-semibold flex items-center gap-1`}>
            <StatusIcon className={`h-2.5 w-2.5 ${order.status === 'partially_filled' ? 'animate-spin' : ''}`} />
            {t(status.labelKey)}
          </Badge>
        </div>
      </div>

      {/* Order details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.type')}</span>
          <span className="text-[#848E9C] font-medium">
            {order.type === 'stop_limit' ? t('orders.stopLimit') : t('orders.market')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.price')}</span>
          <span className="text-[#EAECEF] tabular-nums font-medium">
            {order.price ? formatPrice(order.price) : t('orders.market')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.amount')}</span>
          <span className="text-[#848E9C] tabular-nums">{order.quantity} {baseAsset}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.filledCol')}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 bg-[#2B3139] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  filledPct >= 100 ? 'bg-[#0ECB81]' : 'bg-[#F0B90B]'
                }`}
                style={{ width: `${Math.min(filledPct, 100)}%` }}
              />
            </div>
            <span className={`tabular-nums ${filledPct > 0 ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`}>
              {filledPct.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.total')}</span>
          <span className="text-[#EAECEF] tabular-nums font-medium">
            {order.price ? formatPrice(order.price * order.quantity) : '—'} {quoteAsset}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5E6673]">{t('orders.time')}</span>
          <span className="text-[#5E6673] tabular-nums">
            {new Date(order.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Cancel button for open orders */}
      {isOpen && (
        <div className="flex justify-end pt-2 border-t border-[#2B3139]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(order.id)}
            className="h-7 px-3 text-xs text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10 font-medium"
          >
            <X className="h-3 w-3 me-1" />
            {t('orders.cancelOrder')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [activeDateRange, setActiveDateRange] = useState<DateRange>('30d');
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleCancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'canceled' as const } : o))
    );
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Filter by status
    switch (activeFilter) {
      case 'open':
        result = result.filter((o) => o.status === 'pending' || o.status === 'partially_filled');
        break;
      case 'filled':
        result = result.filter((o) => o.status === 'filled');
        break;
      case 'canceled':
        result = result.filter((o) => o.status === 'canceled');
        break;
    }

    // Filter by date range
    const now = new Date();
    switch (activeDateRange) {
      case 'today':
        result = result.filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === now.toDateString();
        });
        break;
      case '7d':
        result = result.filter((o) => {
          const d = new Date(o.createdAt);
          const diff = now.getTime() - d.getTime();
          return diff <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case '30d':
        // Show all for mock data
        break;
      case 'custom':
        // Show all for mock (would have date picker in production)
        break;
    }

    return result;
  }, [orders, activeFilter, activeDateRange]);

  // Stats
  const openCount = orders.filter((o) => o.status === 'pending' || o.status === 'partially_filled').length;
  const filledCount = orders.filter((o) => o.status === 'filled').length;
  const canceledCount = orders.filter((o) => o.status === 'canceled').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E11]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0E11] border-b border-[#2B3139]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#EAECEF]">{t('orders.title')}</h1>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#5E6673]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#F0B90B]" />
              {openCount} {t('orders.open')}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#0ECB81]" />
              {filledCount} {t('orders.filled')}
            </span>
            <span className="flex items-center gap-1">
              <X className="h-3 w-3 text-[#F6465D]" />
              {canceledCount} {t('orders.canceled')}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                activeFilter === tab.id
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#5E6673] hover:text-[#848E9C] hover:bg-[#1E2329]'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 px-4 pb-3">
          <Calendar className="h-3.5 w-3.5 text-[#5E6673] me-1" />
          {dateRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setActiveDateRange(range.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                activeDateRange === range.id
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#5E6673] hover:text-[#848E9C] hover:bg-[#1E2329]'
              }`}
            >
              {t(range.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 max-w-4xl mx-auto">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Filter className="h-10 w-10 text-[#2B3139] mb-3" />
              <p className="text-sm text-[#5E6673] mb-1">{t('orders.noOrders')}</p>
              <p className="text-xs text-[#3B4451]">{t('orders.noOrdersHint')}</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onCancel={handleCancel} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
