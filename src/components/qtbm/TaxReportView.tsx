'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
  AlertTriangle,
  DollarSign,
  BarChart3,
  FileDown,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const monthlyData = [
  { monthIndex: 0, value: 800, positive: true },
  { monthIndex: 1, value: -200, positive: false },
  { monthIndex: 2, value: 1200, positive: true },
  { monthIndex: 3, value: 600, positive: true },
  { monthIndex: 4, value: -400, positive: false },
  { monthIndex: 5, value: 1800, positive: true },
  { monthIndex: 6, value: 900, positive: true },
  { monthIndex: 7, value: -600, positive: false },
  { monthIndex: 8, value: 2200, positive: true },
  { monthIndex: 9, value: 1500, positive: true },
  { monthIndex: 10, value: -2080, positive: false },
  { monthIndex: 11, value: 3280, positive: true },
];

const transactionSummary = [
  { typeKey: 'taxReport.types.spot', count: '142 trades', totalAmount: '$48,250', gainLoss: '+$8,420', positive: true },
  { typeKey: 'taxReport.types.futures', count: '28 trades', totalAmount: '$12,400', gainLoss: '+$2,850', positive: true },
  { typeKey: 'taxReport.types.staking', count: 'N/A', totalAmount: '$1,200', gainLoss: '+$1,200', positive: true },
  { typeKey: 'taxReport.types.p2p', count: '8 trades', totalAmount: '$5,400', gainLoss: '-$3,280', positive: false },
];

const maxBarValue = Math.max(...monthlyData.map((d) => Math.abs(d.value)));

export default function TaxReportView() {
  const { goBack } = useAppStore();
  const { t, isRTL, language } = useTranslation();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2500);
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions.back')}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t('taxReport.title')}</h1>
          <Badge className="bg-[#627EEA]/10 text-[#627EEA] border-0 text-[10px] px-1.5 py-0 h-5 font-semibold">
            {selectedYear}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              <p className="text-base font-bold text-success">$12,450</p>
              <p className="text-[10px] text-muted-foreground">{t('taxReport.totalGains')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              </div>
              <p className="text-base font-bold text-destructive">$3,280</p>
              <p className="text-[10px] text-muted-foreground">{t('taxReport.totalLosses')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-success" />
              </div>
              <p className="text-base font-bold text-success">$9,170</p>
              <p className="text-[10px] text-muted-foreground">{t('taxReport.netPL')}</p>
              <p className="text-[10px] text-success font-medium">+73.7%</p>
            </CardContent>
          </Card>
        </div>

        {/* Capital Gains Chart */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('taxReport.capitalGainsChart')}</h3>
            </div>
            <div className="relative h-40">
              <svg viewBox="0 0 360 140" className="w-full h-full">
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={20 + i * 30}
                    x2="360"
                    y2={20 + i * 30}
                    stroke="#2B3139"
                    strokeWidth="0.5"
                    strokeDasharray="4"
                  />
                ))}
                {/* Zero line */}
                <line x1="0" y1="70" x2="360" y2="70" stroke="#5E6673" strokeWidth="0.8" />
                {/* Bars */}
                {monthlyData.map((data, i) => {
                  const barHeight = (Math.abs(data.value) / maxBarValue) * 45;
                  const x = 12 + i * 29;
                  const barWidth = 18;
                  if (data.positive) {
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={70 - barHeight}
                        width={barWidth}
                        height={barHeight}
                        rx="2"
                        fill="#0ECB81"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="height"
                          from="0"
                          to={barHeight}
                          dur="0.6s"
                          fill="freeze"
                        />
                        <animate
                          attributeName="y"
                          from="70"
                          to={70 - barHeight}
                          dur="0.6s"
                          fill="freeze"
                        />
                      </rect>
                    );
                  }
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={70}
                      width={barWidth}
                      height={barHeight}
                      rx="2"
                      fill="#F6465D"
                      opacity="0.8"
                    >
                      <animate
                        attributeName="height"
                        from="0"
                        to={barHeight}
                        dur="0.6s"
                        fill="freeze"
                      />
                    </rect>
                  );
                })}
                {/* Month labels */}
                {monthlyData.map((data, i) => {
                  const monthLabel = new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(2024, data.monthIndex, 1));
                  return (
                  <text
                    key={i}
                    x={21 + i * 29}
                    y={135}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="9"
                    fontFamily="system-ui"
                  >
                    {monthLabel}
                  </text>
                  );
                })}
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                <span className="text-[10px] text-muted-foreground">{t('taxReport.gains')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                <span className="text-[10px] text-muted-foreground">{t('taxReport.losses')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary Table */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('taxReport.transactionSummary')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start py-2 pe-2 text-muted-foreground font-medium">{t('taxReport.type')}</th>
                    <th className="text-end py-2 px-2 text-muted-foreground font-medium">{t('taxReport.count')}</th>
                    <th className="text-end py-2 px-2 text-muted-foreground font-medium">{t('taxReport.totalAmount')}</th>
                    <th className="text-end py-2 ps-2 text-muted-foreground font-medium">{t('taxReport.gainLoss')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionSummary.map((row, idx) => (
                    <tr key={idx} className={idx < transactionSummary.length - 1 ? 'border-b border-border/50' : ''}>
                      <td className="py-2.5 pe-2 text-foreground font-medium">{t(row.typeKey)}</td>
                      <td className="py-2.5 px-2 text-end text-muted-foreground">{row.count}</td>
                      <td className="py-2.5 px-2 text-end text-muted-foreground">{row.totalAmount}</td>
                      <td className={`py-2.5 ps-2 text-end font-semibold ${row.positive ? 'text-success' : 'text-destructive'}`}>
                        {row.gainLoss}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tax Report Generator */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">{t('taxReport.generateReport')}</h3>

            {/* Year Selector */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">
                {t('taxReport.year')}
              </label>
              <div className="flex gap-2">
                {['2022', '2023', '2024'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedYear === year
                        ? 'bg-primary text-background'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">
                {t('taxReport.format')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReportFormat('pdf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFormat === 'pdf'
                      ? 'bg-primary text-background'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setReportFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFormat === 'csv'
                      ? 'bg-primary text-background'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full gradient-yellow hover:opacity-90 text-background font-semibold h-11 text-sm shadow-md shadow-primary/20 press-scale"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-background border-t-transparent rounded-full me-2"
                />
              ) : null}
              {generating ? t('taxReport.generating') : t('taxReport.generateReport')}
            </Button>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary hover:border-primary/30 h-10 text-xs"
            onClick={() => {}}
          >
            <FileDown className="h-4 w-4 me-2" />
            {t('taxReport.exportCSV')}
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary hover:border-primary/30 h-10 text-xs"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 me-2" />
            {t('taxReport.exportPDF')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('taxReport.disclaimer')}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
