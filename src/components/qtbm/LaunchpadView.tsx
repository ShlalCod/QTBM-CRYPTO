'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockLaunchProjects, formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  Rocket,
  Clock,
  Bell,
  Star,
  ExternalLink,
  Timer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Track previous values for flip animation
  const [prevValues, setPrevValues] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [flipKeys, setFlipKeys] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (prevValues.days !== timeLeft.days) setFlipKeys((p) => ({ ...p, days: p.days + 1 }));
    if (prevValues.hours !== timeLeft.hours) setFlipKeys((p) => ({ ...p, hours: p.hours + 1 }));
    if (prevValues.minutes !== timeLeft.minutes) setFlipKeys((p) => ({ ...p, minutes: p.minutes + 1 }));
    if (prevValues.seconds !== timeLeft.seconds) setFlipKeys((p) => ({ ...p, seconds: p.seconds + 1 }));
    setPrevValues(timeLeft);
  }, [timeLeft]);

  return (
    <div className="flex items-center gap-1">
      {[
        { value: timeLeft.days, label: 'D', key: flipKeys.days },
        { value: timeLeft.hours, label: 'H', key: flipKeys.hours },
        { value: timeLeft.minutes, label: 'M', key: flipKeys.minutes },
        { value: timeLeft.seconds, label: 'S', key: flipKeys.seconds },
      ].map((item, i) => (
        <React.Fragment key={item.label}>
          <div className="bg-[#2B3139] rounded px-2 py-1 text-center min-w-[32px] border border-[#2B3139] hover:border-[#F0B90B]/30 transition-colors flip-clock-digit">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.key}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-bold text-[#F0B90B] tabular-nums inline-block"
              >
                {String(item.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[8px] text-[#5E6673] mt-0.5">{item.label}</span>
          </div>
          {i < 3 && <span className="text-[10px] text-[#F0B90B] font-bold">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function LaunchpadView() {
  const { navigateTo } = useAppStore();
  const { t } = useTranslation();
  const [notifyProject, setNotifyProject] = useState<string | null>(null);

  const activeProjects = mockLaunchProjects.filter((p) => p.status === 'active');
  const upcomingProjects = mockLaunchProjects.filter((p) => p.status === 'upcoming');

  const statusColors: Record<string, string> = {
    active: 'bg-[#0ECB81]/10 text-[#0ECB81]',
    upcoming: 'bg-[#F0B90B]/10 text-[#F0B90B]',
    completed: 'bg-[#848E9C]/10 text-[#848E9C]',
  };

  const typeColors: Record<string, string> = {
    launchpad: 'bg-[#F0B90B]/10 text-[#F0B90B]',
    launchpool: 'bg-[#0ECB81]/10 text-[#0ECB81]',
    airdrop: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#EAECEF]">{t('launchpad.title')}</h1>
            <p className="text-xs text-[#848E9C]">{t('launchpad.subtitle')}</p>
          </div>
        </div>

        {/* Hero Banner */}
        <Card className="bg-gradient-to-r from-[#F0B90B]/15 via-[#1E2329] to-[#1E2329] border-[#F0B90B]/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-[#F0B90B]" />
              <span className="text-sm font-semibold text-[#F0B90B]">{t('launchpad.qtbmLaunchpad')}</span>
            </div>
            <p className="text-base font-bold text-[#EAECEF] mb-1">
              {t('launchpad.participateExclusive')}
            </p>
            <p className="text-xs text-[#848E9C]">
              {t('launchpad.useTokens')}
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#0ECB81] rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-[#EAECEF]">{t('launchpad.activeProjects')}</h3>
          </div>

          <div className="space-y-3">
            {activeProjects.map((project) => (
              <Card key={project.id} className={`bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/20 transition-colors card-hover-effect ${
                project.status === 'active' ? 'border-glow-yellow-anim' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#2B3139] flex items-center justify-center text-2xl">
                        {project.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-[#EAECEF]">{project.name}</p>
                          <span className="text-xs text-[#5E6673]">{project.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-[9px] border-0 h-4 ${statusColors[project.status]}`}>
                            {project.status.toUpperCase()}
                          </Badge>
                          <Badge className={`text-[9px] border-0 h-4 ${typeColors[project.type]}`}>
                            {project.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-[#848E9C] mb-3">{project.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-[#5E6673]">{t('launchpad.tokenPrice')}</span>
                      <p className="text-[#EAECEF] font-medium tabular-nums neon-glow-yellow">
                        {project.tokenPrice > 0 ? `$${project.tokenPrice}` : t('launchpad.free')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">{t('launchpad.minCommit')}</span>
                      <p className="text-[#EAECEF] font-medium tabular-nums">
                        {project.minCommit > 0 ? `${project.minCommit} USDT` : t('launchpad.none')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">{t('launchpad.totalSupply')}</span>
                      <p className="text-[#EAECEF] font-medium tabular-nums">
                        {formatNumber(project.totalSupply)} {project.symbol}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">{t('launchpad.endsIn')}</span>
                      <div className="mt-1 shimmer-gradient rounded">
                        <CountdownTimer targetDate={project.endAt} />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gradient-submit-btn text-[#0B0E11] text-xs h-9 font-semibold ripple-effect">
                    {project.type === 'airdrop' ? t('launchpad.claimAirdrop') : t('launchpad.commitNow')}
                  </Button>
                </CardContent>
              </Card>
            ))}

            {activeProjects.length === 0 && (
              <Card className="bg-[#1E2329] border-[#2B3139]">
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-[#5E6673]">{t('launchpad.noActiveProjects')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Projects */}
        {upcomingProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-semibold text-[#EAECEF]">{t('launchpad.upcomingProjects')}</h3>
            </div>

            <div className="space-y-3">
              {upcomingProjects.map((project) => (
                <Card key={project.id} className="bg-[#1E2329] border-[#2B3139] card-hover-effect">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2B3139] flex items-center justify-center text-xl">
                          {project.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#EAECEF]">{project.name}</p>
                            <span className="shimmer-badge text-[8px] font-bold px-1.5 py-0.5 rounded text-[#0B0E11] animate-pulse">{t('launchpad.comingSoon')}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#5E6673]">{project.symbol}</span>
                            <Badge className={`text-[9px] border-0 h-4 ${typeColors[project.type]}`}>
                              {project.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-[#2B3139] text-xs h-8 ${
                          notifyProject === project.id
                            ? 'bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30'
                            : 'text-[#848E9C] hover:bg-[#2B3139] hover:text-[#EAECEF]'
                        }`}
                        onClick={() =>
                          setNotifyProject(notifyProject === project.id ? null : project.id)
                        }
                      >
                        {notifyProject === project.id ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                            {t('launchpad.notified')}
                          </>
                        ) : (
                          <>
                            <Bell className="h-3.5 w-3.5 me-1" />
                            {t('launchpad.notifyMe')}
                          </>
                        )}
                      </Button>
                    </div>
                    {project.description && (
                      <p className="text-[10px] text-[#5E6673] mt-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-[#5E6673]">
                      <Timer className="h-3 w-3" />
                      {t('launchpad.starts')} {new Date(project.startAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Participations */}
        <div>
          <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">{t('launchpad.myParticipations')}</h3>
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-6 text-center fancy-scrollbar max-h-64 overflow-y-auto">
              <AlertCircle className="h-8 w-8 text-[#3E444D] mx-auto mb-2" />
              <p className="text-sm text-[#5E6673]">{t('launchpad.noParticipations')}</p>
              <p className="text-xs text-[#3E444D] mt-1">{t('launchpad.commitToStart')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
