'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  Shield,
  Plane,
  Lightbulb,
  Plus,
  Check,
  Target,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
  PiggyBank,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  monthlyEstimate: number;
}

interface CompletedGoal {
  id: string;
  name: string;
  target: number;
  completedDate: string;
  icon: React.ElementType;
}

interface SavingsTip {
  id: string;
  title: string;
  description: string;
}

const activeGoals: Goal[] = [
  {
    id: '1',
    name: 'New Car',
    target: 15000,
    saved: 8400,
    targetDate: 'Dec 2025',
    icon: Car,
    iconColor: 'text-[#F0B90B]',
    iconBg: 'bg-[#F0B90B]/10',
    monthlyEstimate: 550,
  },
  {
    id: '2',
    name: 'Emergency Fund',
    target: 10000,
    saved: 7500,
    targetDate: 'Jun 2025',
    icon: Shield,
    iconColor: 'text-[#0ECB81]',
    iconBg: 'bg-[#0ECB81]/10',
    monthlyEstimate: 420,
  },
  {
    id: '3',
    name: 'Vacation',
    target: 5000,
    saved: 1200,
    targetDate: 'Mar 2026',
    icon: Plane,
    iconColor: 'text-[#627EEA]',
    iconBg: 'bg-[#627EEA]/10',
    monthlyEstimate: 250,
  },
];

const completedGoals: CompletedGoal[] = [
  {
    id: '4',
    name: 'Laptop',
    target: 2000,
    completedDate: 'Dec 2024',
    icon: Check,
  },
];

const savingsTips: SavingsTip[] = [
  {
    id: '1',
    title: 'Automate your savings',
    description: 'Set up recurring deposits to reach your goals faster. Even small amounts add up over time.',
  },
  {
    id: '2',
    title: 'Use crypto yield products',
    description: 'Earn passive income on your savings with our Earn products while working toward your goals.',
  },
  {
    id: '3',
    title: 'Review and adjust monthly',
    description: 'Check your progress regularly and adjust contributions to stay on track with your targets.',
  },
];

function ProgressRing({ progress, size = 64, strokeWidth = 5 }: { progress: number; size?: number; strokeWidth?: number }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2B3139"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progress >= 75 ? '#0ECB81' : progress >= 50 ? '#F0B90B' : '#627EEA'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

const goalIcons = [
  { icon: Car, label: 'Car', color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
  { icon: Shield, label: 'Shield', color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
  { icon: Plane, label: 'Plane', color: 'text-[#627EEA]', bg: 'bg-[#627EEA]/10' },
  { icon: PiggyBank, label: 'Savings', color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
  { icon: Target, label: 'Target', color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
];

export default function SavingsGoalsView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);

  const totalSaved = activeGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = Math.round((totalSaved / totalTarget) * 100);

  const getDaysRemaining = (targetDate: string): number => {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
    };
    const [monthStr, yearStr] = targetDate.split(' ');
    const month = months[monthStr] ?? 0;
    const year = parseInt(yearStr) ?? 2025;
    const target = new Date(year, month + 1, 1);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCreateGoal = () => {
    setShowCreateModal(false);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
    setInitialDeposit('');
    setSelectedIconIndex(0);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto space-y-4">
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
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('savingsGoals.title')}</h1>
        </div>

        {/* Total Saved Card */}
        <Card className="bg-gradient-to-br from-[#1E2329] via-[#1E2329] to-[#2B3139] border-[#2B3139] overflow-hidden relative glass-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0ECB81]/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <CardContent className="p-4 relative z-10">
            <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">{t('savingsGoals.totalSaved')}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#EAECEF]">
                $<AnimatedCounter target={totalSaved} />
              </span>
              <span className="text-xs text-[#5E6673]">{t('savingsGoals.of')} ${totalTarget.toLocaleString()}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#2B3139] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-semibold text-[#0ECB81]">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#F0B90B]" />
              <h2 className="text-sm font-semibold text-[#EAECEF]">{t('savingsGoals.activeGoals')}</h2>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-7 text-[10px] font-semibold px-2.5 gradient-yellow text-[#0B0E11] press-scale"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('savingsGoals.newGoal')}
            </Button>
          </div>
          <div className="space-y-3">
            {activeGoals.map((goal, index) => {
              const GoalIcon = goal.icon;
              const progress = Math.round((goal.saved / goal.target) * 100);
              const daysRemaining = getDaysRemaining(goal.targetDate);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Progress Ring */}
                        <div className="relative shrink-0">
                          <ProgressRing progress={progress} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#EAECEF]">{progress}%</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-md ${goal.iconBg} flex items-center justify-center`}>
                              <GoalIcon className={`h-3.5 w-3.5 ${goal.iconColor}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-[#EAECEF] truncate">{goal.name}</h3>
                          </div>
                          <p className="text-xs text-[#848E9C]">
                            <span className={progress >= 75 ? 'text-[#0ECB81]' : progress >= 50 ? 'text-[#F0B90B]' : 'text-[#627EEA]'}>
                              ${goal.saved.toLocaleString()}
                            </span>
                            {' '}{t('savingsGoals.of')}{' '}
                            <span className="text-[#EAECEF]">${goal.target.toLocaleString()}</span>
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-[10px] text-[#5E6673]">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ~${goal.monthlyEstimate}/mo
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {daysRemaining}d {t('savingsGoals.remaining').toLowerCase()}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-[10px] font-semibold border-[#F0B90B]/20 text-[#F0B90B] hover:bg-[#F0B90B]/10 press-scale"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t('savingsGoals.addFunds')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Completed Goals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-[#0ECB81]" />
            <h2 className="text-sm font-semibold text-[#EAECEF]">{t('savingsGoals.completedGoals')}</h2>
          </div>
          {completedGoals.map((goal) => {
            const GoalIcon = goal.icon;
            return (
              <Card
                key={goal.id}
                className="bg-[#1E2329] border-[#0ECB81]/20 overflow-hidden relative"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(14,203,129,0.03) 10px, rgba(14,203,129,0.03) 20px)',
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0ECB81]/10 flex items-center justify-center">
                      <GoalIcon className="h-5 w-5 text-[#0ECB81]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#EAECEF]">{goal.name}</h3>
                        <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold">
                          {t('status.completed')}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5E6673]">${goal.target.toLocaleString()} • {goal.completedDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Savings Tips */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-[#F0B90B]" />
            <h2 className="text-sm font-semibold text-[#EAECEF]">{t('savingsGoals.savingsTips')}</h2>
          </div>
          <div className="space-y-2">
            {savingsTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb className="h-4 w-4 text-[#F0B90B]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#EAECEF]">{tip.title}</h4>
                        <p className="text-[10px] text-[#5E6673] mt-0.5 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md mx-4 mb-4 sm:mb-0 bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
                <h3 className="text-sm font-semibold text-[#EAECEF]">{t('savingsGoals.createGoal')}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#848E9C]" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Goal Name */}
                <div>
                  <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">{t('savingsGoals.goalName')}</label>
                  <Input
                    placeholder="e.g. New Car"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] focus:border-[#F0B90B]"
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">{t('savingsGoals.targetAmount')}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="10,000.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] pr-8 focus:border-[#F0B90B]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E6673]">$</span>
                  </div>
                </div>

                {/* Target Date */}
                <div>
                  <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">{t('savingsGoals.targetDate')}</label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] focus:border-[#F0B90B]"
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">{t('savingsGoals.iconLabel')}</label>
                  <div className="flex items-center gap-2">
                    {goalIcons.map((gi, idx) => {
                      const GI = gi.icon;
                      return (
                        <button
                          key={gi.label}
                          onClick={() => setSelectedIconIndex(idx)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            selectedIconIndex === idx
                              ? 'bg-[#F0B90B]/20 border-2 border-[#F0B90B]'
                              : 'bg-[#2B3139] border-2 border-transparent hover:border-[#3B4451]'
                          }`}
                        >
                          <GI className={`h-4 w-4 ${selectedIconIndex === idx ? 'text-[#F0B90B]' : 'text-[#5E6673]'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Initial Deposit */}
                <div>
                  <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">{t('savingsGoals.initialDeposit')}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(e.target.value)}
                      className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] pr-8 focus:border-[#F0B90B]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5E6673]">$</span>
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateGoal}
                  disabled={!goalName || !targetAmount}
                  className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#0ECB81] text-[#0B0E11] hover:opacity-90 shadow-lg shadow-[#F0B90B]/20 press-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: goalName && targetAmount ? '0 0 20px rgba(240, 185, 11, 0.3)' : undefined }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('savingsGoals.createGoal')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
