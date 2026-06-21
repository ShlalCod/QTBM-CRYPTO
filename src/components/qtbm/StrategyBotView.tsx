'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  Grid3x3,
  TrendingDown,
  ArrowLeftRight,
  PieChart,
  Radio,
  Dices,
  Play,
  Square,
  Eye,
  Plus,
  Clock,
  Bot,
  Zap,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActiveBot {
  id: string;
  type: 'grid' | 'dca';
  pair: string;
  status: 'running';
  profit: number;
  profitPercent: number;
  // Translation key for the human-readable param summary.
  paramKey: string;
  // Numeric / display fragments interpolated into the translated string.
  paramArgs?: Record<string, string | number>;
  icon: React.ElementType;
  iconColor: string;
}

interface BotTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface BotHistoryEntry {
  id: string;
  pair: string;
  /** Translation key for the bot type label (e.g. strategyBot.gridTrading). */
  typeKey: string;
  profit: number;
  profitPercent: number;
  duration: string;
  status: 'completed' | 'stopped' | 'error';
}

const activeBots: ActiveBot[] = [
  {
    id: '1',
    type: 'grid',
    pair: 'BTC/USDT',
    status: 'running',
    profit: 245.6,
    profitPercent: 3.2,
    paramKey: 'strategyBot.paramsGridSummary',
    paramArgs: { upper: '$70,000', lower: '$65,000', grids: 15 },
    icon: Grid3x3,
    iconColor: 'text-primary',
  },
  {
    id: '2',
    type: 'dca',
    pair: 'ETH/USDT',
    status: 'running',
    profit: 89.3,
    profitPercent: 1.8,
    paramKey: 'strategyBot.paramsDcaSummary',
    paramArgs: { weekly: '$500', nextBuy: '2d 14h' },
    icon: TrendingDown,
    iconColor: 'text-success',
  },
];

const botTemplates: BotTemplate[] = [
  { id: 'grid', nameKey: 'strategyBot.gridTrading', descriptionKey: 'strategyBot.gridTradingDesc', icon: Grid3x3, iconColor: 'text-primary', iconBg: 'bg-primary/10' },
  { id: 'dca', nameKey: 'strategyBot.dca', descriptionKey: 'strategyBot.dcaDesc', icon: TrendingDown, iconColor: 'text-success', iconBg: 'bg-success/10' },
  { id: 'arbitrage', nameKey: 'strategyBot.arbitrage', descriptionKey: 'strategyBot.arbitrageDesc', icon: ArrowLeftRight, iconColor: 'text-[#627EEA]', iconBg: 'bg-[#627EEA]/10' },
  { id: 'rebalancing', nameKey: 'strategyBot.rebalancing', descriptionKey: 'strategyBot.rebalancingDesc', icon: PieChart, iconColor: 'text-primary', iconBg: 'bg-primary/10' },
  { id: 'signal', nameKey: 'strategyBot.signalBot', descriptionKey: 'strategyBot.signalBotDesc', icon: Radio, iconColor: 'text-success', iconBg: 'bg-success/10' },
  { id: 'martingale', nameKey: 'strategyBot.martingale', descriptionKey: 'strategyBot.martingaleDesc', icon: Dices, iconColor: 'text-destructive', iconBg: 'bg-destructive/10' },
];

const botHistory: BotHistoryEntry[] = [
  { id: '1', pair: 'SOL/USDT', typeKey: 'strategyBot.gridTrading', profit: 32.5, profitPercent: 1.2, duration: '7d 12h', status: 'completed' },
  { id: '2', pair: 'BNB/USDT', typeKey: 'strategyBot.dca', profit: -15.8, profitPercent: -0.6, duration: '14d', status: 'stopped' },
  { id: '3', pair: 'ETH/USDT', typeKey: 'strategyBot.gridTrading', profit: 189.2, profitPercent: 4.1, duration: '21d 6h', status: 'completed' },
  { id: '4', pair: 'BTC/USDT', typeKey: 'strategyBot.martingale', profit: -42.1, profitPercent: -2.3, duration: '3d 18h', status: 'error' },
  { id: '5', pair: 'ADA/USDT', typeKey: 'strategyBot.signalBot', profit: 67.3, profitPercent: 2.8, duration: '10d', status: 'completed' },
];

const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT'];

export default function StrategyBotView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: showCreateModal, onClose: () => setShowCreateModal(false), ref: createModalRef });
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [takeProfit, setTakeProfit] = useState('5');
  const [stopLoss, setStopLoss] = useState('3');
  const [maxPositions, setMaxPositions] = useState('5');
  const [isStarting, setIsStarting] = useState(false);

  const handleCreate = (template: BotTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleStartBot = () => {
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      setShowCreateModal(false);
      setSelectedTemplate(null);
      setInvestmentAmount('');
    }, 2000);
  };

  const backtestResults = selectedTemplate
    ? {
        winRate: selectedTemplate.id === 'grid' ? 72 : selectedTemplate.id === 'dca' ? 68 : selectedTemplate.id === 'arbitrage' ? 85 : 61,
        maxDrawdown: selectedTemplate.id === 'grid' ? 8.5 : selectedTemplate.id === 'dca' ? 12.3 : selectedTemplate.id === 'arbitrage' ? 2.1 : 15.7,
        sharpeRatio: selectedTemplate.id === 'grid' ? 1.82 : selectedTemplate.id === 'dca' ? 1.45 : selectedTemplate.id === 'arbitrage' ? 2.34 : 0.98,
      }
    : null;

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions.back')}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
          >
            <ArrowLeft className="rtl:scale-x-[-1] h-5 w-5 [dir=rtl]:rotate-180" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t('strategyBot.title')}</h1>
          <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-5 font-semibold">
            {t('strategyBot.auto')}
          </Badge>
        </div>

        {/* Active Bots */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('strategyBot.activeBots')}</h2>
            <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
              {activeBots.length} {t('status.active')}
            </Badge>
          </div>
          <div className="space-y-3">
            {activeBots.map((bot, index) => {
              const BotIcon = bot.icon;
              return (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border glass-card overflow-hidden rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <BotIcon className={`h-5 w-5 ${bot.iconColor}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{bot.pair}</span>
                              <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
                                {t('status.active')}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{bot.type === 'grid' ? t('strategyBot.gridTrading') : t('strategyBot.dca')}</p>
                          </div>
                        </div>
                        <div className="text-end">
                          <p className={`text-sm font-bold ${bot.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {bot.profit >= 0 ? '+' : ''}{bot.profitPercent}%
                          </p>
                          <p className={`text-xs ${bot.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {bot.profit >= 0 ? '+' : ''}${bot.profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground bg-background/30 px-3 py-2 rounded-lg">
                        <Zap className="h-3 w-3 text-primary" />
                        {bot.type === 'grid' && bot.paramArgs
                          ? <>{t('strategyBot.paramsGridUpper')}: {bot.paramArgs.upper} / {t('strategyBot.paramsGridLower')}: {bot.paramArgs.lower} / {bot.paramArgs.grids} {t('strategyBot.paramsGrids')}</>
                          : bot.type === 'dca' && bot.paramArgs
                          ? <>{bot.paramArgs.weekly}{t('strategyBot.paramsDcaWeekly')} • {t('strategyBot.paramsDcaNext')}: {bot.paramArgs.nextBuy}</>
                          : null}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-border text-muted-foreground hover:bg-secondary hover:text-foreground h-8 text-xs"
                        >
                          <Eye className="h-3 w-3 me-1.5" />
                          {t('strategyBot.view')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 h-8 text-xs"
                        >
                          <Square className="h-3 w-3 me-1.5" />
                          {t('strategyBot.stop')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Available Bots */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{t('strategyBot.availableBots')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {botTemplates.map((template, index) => {
              const TemplateIcon = template.icon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card border-border hover:border-primary/20 cursor-pointer transition-all hover-lift glass-card rounded-xl">
                    <CardContent className="p-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                        <TemplateIcon className={`h-5 w-5 ${template.iconColor}`} />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-0.5">{t(template.nameKey)}</h3>
                      <p className="text-[10px] text-muted-foreground mb-3">{t(template.descriptionKey)}</p>
                      <Button
                        onClick={() => handleCreate(template)}
                        className="w-full h-8 text-xs font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 shadow-md shadow-primary/15 press-scale"
                      >
                        {t('strategyBot.create')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bot History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{t('strategyBot.botHistory')}</h2>
          </div>
          <Card className="bg-card border-border glass-card rounded-xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-[10px] text-muted-foreground font-medium px-4 py-2.5 text-start">{t('strategyBot.pairCol')}</th>
                      <th className="text-[10px] text-muted-foreground font-medium px-4 py-2.5 text-start">{t('strategyBot.typeCol')}</th>
                      <th className="text-[10px] text-muted-foreground font-medium px-4 py-2.5 text-end">{t('strategyBot.profitCol')}</th>
                      <th className="text-[10px] text-muted-foreground font-medium px-4 py-2.5 text-end">{t('strategyBot.durationCol')}</th>
                      <th className="text-[10px] text-muted-foreground font-medium px-4 py-2.5 text-end">{t('strategyBot.statusCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {botHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2.5 text-xs font-medium text-foreground">{entry.pair}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{t(entry.typeKey)}</td>
                        <td className={`px-4 py-2.5 text-xs font-medium text-end ${entry.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {entry.profit >= 0 ? '+' : ''}{entry.profitPercent}%
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground text-end">{entry.duration}</td>
                        <td className="px-4 py-2.5 text-end">
                          <Badge
                            className={`border-0 text-[10px] px-1.5 py-0 h-4 font-semibold ${
                              entry.status === 'completed'
                                ? 'bg-success/10 text-success'
                                : entry.status === 'stopped'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {entry.status === 'completed' ? t('strategyBot.statusCompleted') : entry.status === 'stopped' ? t('strategyBot.statusStopped') : t('strategyBot.statusError')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Bot Modal */}
      <AnimatePresence>
        {showCreateModal && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              ref={createModalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('strategyBot.title')}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-2xl overflow-hidden glass-card max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                  {React.createElement(selectedTemplate.icon, { className: `h-5 w-5 ${selectedTemplate.iconColor}` })}
                  <h3 className="text-sm font-semibold text-foreground">{t(selectedTemplate.nameKey)} {t('strategyBot.bot')}</h3>
                </div>
                <Button variant="ghost" size="icon" aria-label={t('actions.close')} className="h-9 w-9 text-muted-foreground" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Pair Selector */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">{t('strategyBot.pairLabel')}</label>
                  <div className="relative">
                    <select
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none focus:border-primary focus:outline-none"
                    >
                      {pairs.map((pair) => (
                        <option key={pair} value={pair} className="bg-card text-foreground">{pair}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Investment Amount */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">{t('strategyBot.investment')}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="1,000.00"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="bg-background/50 border-border text-foreground pe-14 focus:border-primary"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDT</span>
                  </div>
                </div>

                {/* Parameter Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">{t('strategyBot.takeProfit')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="bg-background/50 border-border text-foreground pe-8 focus:border-primary"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">{t('strategyBot.stopLoss')}</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="bg-background/50 border-border text-foreground pe-8 focus:border-primary"
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">{t('strategyBot.maxPositions')}</label>
                  <Input
                    type="number"
                    value={maxPositions}
                    onChange={(e) => setMaxPositions(e.target.value)}
                    className="bg-background/50 border-border text-foreground focus:border-primary"
                  />
                </div>

                {/* Backtest Results Preview */}
                {backtestResults && (
                  <div className="bg-background/50 rounded-xl p-3 space-y-2 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">{t('strategyBot.backtestResults')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-sm font-bold text-success">{backtestResults.winRate}%</p>
                        <p className="text-[10px] text-muted-foreground">{t('strategyBot.winRate')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-destructive">{backtestResults.maxDrawdown}%</p>
                        <p className="text-[10px] text-muted-foreground">{t('strategyBot.maxDrawdown')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">{backtestResults.sharpeRatio}</p>
                        <p className="text-[10px] text-muted-foreground">{t('strategyBot.sharpeRatio')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Start Bot Button */}
                <Button
                  onClick={handleStartBot}
                  disabled={isStarting || !investmentAmount}
                  className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-success text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 press-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: investmentAmount ? '0 0 20px rgba(240, 185, 11, 0.3)' : undefined }}
                >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin me-2" />
                      {t('strategyBot.starting')}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 me-2" />
                      {t('strategyBot.startBot')}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
