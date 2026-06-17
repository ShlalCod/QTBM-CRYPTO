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
  { month: 'Jan', value: 800, positive: true },
  { month: 'Feb', value: -200, positive: false },
  { month: 'Mar', value: 1200, positive: true },
  { month: 'Apr', value: 600, positive: true },
  { month: 'May', value: -400, positive: false },
  { month: 'Jun', value: 1800, positive: true },
  { month: 'Jul', value: 900, positive: true },
  { month: 'Aug', value: -600, positive: false },
  { month: 'Sep', value: 2200, positive: true },
  { month: 'Oct', value: 1500, positive: true },
  { month: 'Nov', value: -2080, positive: false },
  { month: 'Dec', value: 3280, positive: true },
];

const transactionSummary = [
  { type: 'Spot Trading', count: '142 trades', totalAmount: '$48,250', gainLoss: '+$8,420', positive: true },
  { type: 'Futures Trading', count: '28 trades', totalAmount: '$12,400', gainLoss: '+$2,850', positive: true },
  { type: 'Staking Rewards', count: 'N/A', totalAmount: '$1,200', gainLoss: '+$1,200', positive: true },
  { type: 'P2P', count: '8 trades', totalAmount: '$5,400', gainLoss: '-$3,280', positive: false },
];

const maxBarValue = Math.max(...monthlyData.map((d) => Math.abs(d.value)));

export default function TaxReportView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2500);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('taxReport.title')}</h1>
          <Badge className="bg-[#627EEA]/10 text-[#627EEA] border-0 text-[9px] px-1.5 py-0 h-5 font-semibold">
            {selectedYear}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#0ECB81]" />
              </div>
              <p className="text-base font-bold text-[#0ECB81]">$12,450</p>
              <p className="text-[9px] text-[#5E6673]">{t('taxReport.totalGains')}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-[#F6465D]" />
              </div>
              <p className="text-base font-bold text-[#F6465D]">$3,280</p>
              <p className="text-[9px] text-[#5E6673]">{t('taxReport.totalLosses')}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-[#0ECB81]" />
              </div>
              <p className="text-base font-bold text-[#0ECB81]">$9,170</p>
              <p className="text-[9px] text-[#5E6673]">{t('taxReport.netPL')}</p>
              <p className="text-[8px] text-[#0ECB81] font-medium">+73.7%</p>
            </CardContent>
          </Card>
        </div>

        {/* Capital Gains Chart */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('taxReport.capitalGainsChart')}</h3>
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
                {monthlyData.map((data, i) => (
                  <text
                    key={i}
                    x={21 + i * 29}
                    y={135}
                    textAnchor="middle"
                    fill="#5E6673"
                    fontSize="8"
                    fontFamily="system-ui"
                  >
                    {data.month}
                  </text>
                ))}
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#0ECB81]" />
                <span className="text-[9px] text-[#848E9C]">{t('taxReport.gains')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#F6465D]" />
                <span className="text-[9px] text-[#848E9C]">{t('taxReport.losses')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary Table */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('taxReport.transactionSummary')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    <th className="text-left py-2 pr-2 text-[#5E6673] font-medium">{t('taxReport.type')}</th>
                    <th className="text-right py-2 px-2 text-[#5E6673] font-medium">{t('taxReport.count')}</th>
                    <th className="text-right py-2 px-2 text-[#5E6673] font-medium">{t('taxReport.totalAmount')}</th>
                    <th className="text-right py-2 pl-2 text-[#5E6673] font-medium">{t('taxReport.gainLoss')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionSummary.map((row, idx) => (
                    <tr key={idx} className={idx < transactionSummary.length - 1 ? 'border-b border-[#2B3139]/50' : ''}>
                      <td className="py-2.5 pr-2 text-[#EAECEF] font-medium">{row.type}</td>
                      <td className="py-2.5 px-2 text-right text-[#848E9C]">{row.count}</td>
                      <td className="py-2.5 px-2 text-right text-[#848E9C]">{row.totalAmount}</td>
                      <td className={`py-2.5 pl-2 text-right font-semibold ${row.positive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
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
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-[#EAECEF]">{t('taxReport.generateReport')}</h3>

            {/* Year Selector */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
                {t('taxReport.year')}
              </label>
              <div className="flex gap-2">
                {['2022', '2023', '2024'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedYear === year
                        ? 'bg-[#F0B90B] text-[#0B0E11]'
                        : 'bg-[#2B3139] text-[#848E9C] hover:bg-[#3B4451]'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
                {t('taxReport.format')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReportFormat('pdf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFormat === 'pdf'
                      ? 'bg-[#F0B90B] text-[#0B0E11]'
                      : 'bg-[#2B3139] text-[#848E9C] hover:bg-[#3B4451]'
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setReportFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportFormat === 'csv'
                      ? 'bg-[#F0B90B] text-[#0B0E11]'
                      : 'bg-[#2B3139] text-[#848E9C] hover:bg-[#3B4451]'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-11 text-sm shadow-md shadow-[#F0B90B]/20 press-scale"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#0B0E11] border-t-transparent rounded-full mr-2"
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
            className="border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] hover:border-[#F0B90B]/30 h-10 text-xs"
            onClick={() => {}}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {t('taxReport.exportCSV')}
          </Button>
          <Button
            variant="outline"
            className="border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] hover:border-[#F0B90B]/30 h-10 text-xs"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('taxReport.exportPDF')}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F0B90B]/5 border border-[#F0B90B]/10">
          <AlertTriangle className="h-4 w-4 text-[#F0B90B] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#848E9C] leading-relaxed">
            {t('taxReport.disclaimer')}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
