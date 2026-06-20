'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockTrades, formatPrice } from '@/lib/mock-data';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TradeRecord } from '@/types';

type FilterSide = 'all' | 'buy' | 'sell';

const filterOptions: { id: FilterSide; labelKey: string }[] = [
  { id: 'all', labelKey: 'tradeHistory.all' },
  { id: 'buy', labelKey: 'tradeHistory.buy' },
  { id: 'sell', labelKey: 'tradeHistory.sell' },
];

export default function TradeHistoryView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [filterSide, setFilterSide] = useState<FilterSide>('all');

  const filteredTrades = useMemo(() => {
    if (filterSide === 'all') return mockTrades;
    return mockTrades.filter((t) => t.side === filterSide);
  }, [filterSide]);

  // Summary stats
  const totalBuyVolume = mockTrades
    .filter((t) => t.side === 'buy')
    .reduce((sum, t) => sum + t.total, 0);
  const totalSellVolume = mockTrades
    .filter((t) => t.side === 'sell')
    .reduce((sum, t) => sum + t.total, 0);
  const totalFees = mockTrades.reduce((sum, t) => sum + t.fee, 0);

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
            <h1 className="text-lg font-bold text-[#EAECEF]">{t('tradeHistory.title')}</h1>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
          <div className="bg-[#1E2329] rounded-lg p-2.5">
            <p className="text-[10px] text-[#5E6673] mb-0.5">{t('tradeHistory.totalBuy')}</p>
            <p className="text-xs font-semibold text-[#0ECB81] tabular-nums">${formatPrice(totalBuyVolume)}</p>
          </div>
          <div className="bg-[#1E2329] rounded-lg p-2.5">
            <p className="text-[10px] text-[#5E6673] mb-0.5">{t('tradeHistory.totalSell')}</p>
            <p className="text-xs font-semibold text-[#F6465D] tabular-nums">${formatPrice(totalSellVolume)}</p>
          </div>
          <div className="bg-[#1E2329] rounded-lg p-2.5">
            <p className="text-[10px] text-[#5E6673] mb-0.5">{t('tradeHistory.totalFees')}</p>
            <p className="text-xs font-semibold text-[#F0B90B] tabular-nums">{totalFees.toFixed(4)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterSide(opt.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                filterSide === opt.id
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#5E6673] hover:text-[#848E9C] hover:bg-[#1E2329]'
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Trade List - Table Layout */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] text-[#5E6673] font-medium uppercase tracking-wider border-b border-[#2B3139] sticky top-0 bg-[#0B0E11] z-10">
            <div className="col-span-3">{t('tradeHistory.pair')}</div>
            <div className="col-span-1 text-center">{t('tradeHistory.side')}</div>
            <div className="col-span-2 text-end">{t('tradeHistory.price')}</div>
            <div className="col-span-2 text-end">{t('tradeHistory.amount')}</div>
            <div className="col-span-2 text-end">{t('tradeHistory.total')}</div>
            <div className="col-span-2 text-end">{t('tradeHistory.fee')}</div>
          </div>

          {/* Trade Rows */}
          {filteredTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-[#5E6673]">{t('tradeHistory.noTrades')}</p>
            </div>
          ) : (
            filteredTrades.map((trade, index) => {
              const baseAsset = trade.market.replace('USDT', '').replace('BTC', '').replace('ETH', '').replace('BNB', '');
              const quoteAsset = trade.market.replace(baseAsset, '');
              const isBuy = trade.side === 'buy';
              const rowBg = index % 2 === 0 ? 'bg-transparent' : 'bg-[#0B0E11]/50';

              return (
                <div
                  key={trade.id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs hover:bg-[#1E2329]/60 transition-colors cursor-default ${rowBg} border-b border-[#2B3139]/30`}
                >
                  {/* Pair */}
                  <div className="col-span-3 flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#EAECEF]">{baseAsset}</span>
                    <span className="text-[10px] text-[#5E6673]">/{quoteAsset}</span>
                  </div>

                  {/* Side */}
                  <div className="col-span-1 flex justify-center">
                    <Badge
                      className={`text-[9px] h-5 px-1.5 border-0 font-semibold flex items-center gap-0.5 ${
                        isBuy
                          ? 'bg-[#0ECB81]/10 text-[#0ECB81]'
                          : 'bg-[#F6465D]/10 text-[#F6465D]'
                      }`}
                    >
                      {isBuy ? (
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDownRight className="h-2.5 w-2.5" />
                      )}
                      {isBuy ? 'B' : 'S'}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-end">
                    <span className={`tabular-nums font-medium ${isBuy ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {formatPrice(trade.price)}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-end">
                    <span className="text-[#EAECEF] tabular-nums">
                      {trade.quantity} {baseAsset}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 text-end">
                    <span className="text-[#848E9C] tabular-nums font-medium">
                      {formatPrice(trade.total)}
                    </span>
                  </div>

                  {/* Fee */}
                  <div className="col-span-2 text-end">
                    <span className="text-[#5E6673] tabular-nums">
                      {trade.fee} {trade.feeAsset}
                    </span>
                    <div className="text-[9px] text-[#3B4451] tabular-nums">
                      {new Date(trade.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
