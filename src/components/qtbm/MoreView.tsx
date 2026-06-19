'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import {
  User,
  Settings,
  Shield,
  HelpCircle,
  FileText,
  Gift,
  Users,
  ChevronRight,
  TrendingUp,
  Rocket,
  Bell,
  LogOut,
  Globe,
  Moon,
  Sun,
  Fingerprint,
  MessageSquare,
  Key,
  Share2,
  Info,
  BookOpen,
  Volume2,
  BadgeCheck,
  Wallet,
  Lock,
  Coins,
  Flame,
  Landmark,
  ShieldCheck,
  ArrowDownUp,
  Sparkles,
  PieChart,
  Vote,
  Copy,
  Trophy,
  Newspaper,
  Cpu,
  PiggyBank,
  Repeat,
  CreditCard,
  Swords,
  Receipt,
  Palette,
  Layers,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MenuItem {
  icon: React.ElementType;
  /** i18n key (without surrounding t() call) used to resolve the displayed label */
  labelKey: string;
  view: string;
  color?: string;
  /** i18n key for the badge label, or a literal string for non-translatable badges (e.g. "EN", "USD") */
  badgeKey?: string;
  badgeColor?: string;
}

export default function MoreView() {
  const { navigateTo, user } = useAppStore();
  const { t } = useTranslation();

  const featureItems: MenuItem[] = [
    { icon: TrendingUp, labelKey: 'more.earn', view: 'earn', color: 'text-[#F0B90B]', badgeKey: 'more.badgeUpTo12APR', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Users, labelKey: 'more.p2pTrading', view: 'p2p', color: 'text-[#0ECB81]' },
    { icon: Rocket, labelKey: 'more.launchpad', view: 'launchpad', color: 'text-[#F0B90B]' },
    { icon: ArrowDownUp, labelKey: 'more.swap', view: 'swap', color: 'text-[#0ECB81]', badgeKey: 'more.badgeNew', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Sparkles, labelKey: 'more.aiAssistant', view: 'ai-chat', color: 'text-[#F0B90B]', badgeKey: 'more.badgeAI', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Share2, labelKey: 'more.referralProgram', view: 'referral', color: 'text-[#F0B90B]', badgeKey: 'more.badgeEarn10', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Coins, labelKey: 'more.staking', view: 'staking', color: 'text-[#0ECB81]', badgeKey: 'more.badgeUpTo21APY', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Flame, labelKey: 'more.futuresTrading', view: 'futures', color: 'text-[#F6465D]', badgeKey: 'more.badgeUpTo125x', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
    { icon: Landmark, labelKey: 'more.marginTrading', view: 'margin', color: 'text-[#F0B90B]', badgeKey: 'more.badge3x5x', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: PieChart, labelKey: 'more.portfolioAnalytics', view: 'portfolio-analytics', color: 'text-[#627EEA]', badgeKey: 'more.badgePro', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Vote, labelKey: 'more.voting', view: 'voting', color: 'text-[#F0B90B]', badgeKey: 'more.badgeGovernance', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Copy, labelKey: 'more.copyTrading', view: 'copy-trading', color: 'text-[#0ECB81]', badgeKey: 'more.badgeBeta', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Bell, labelKey: 'more.priceAlerts', view: 'price-alerts', color: 'text-[#F0B90B]', badgeKey: 'more.badgeActive', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Trophy, labelKey: 'more.leaderboard', view: 'leaderboard', color: 'text-[#F0B90B]', badgeKey: 'more.badge100K', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Newspaper, labelKey: 'more.newsFeed', view: 'news-feed', color: 'text-[#0ECB81]', badgeKey: 'more.badgeLive', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Cpu, labelKey: 'more.strategyBot', view: 'strategy-bot', color: 'text-[#F0B90B]', badgeKey: 'more.badgeAuto', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: PiggyBank, labelKey: 'more.savingsGoals', view: 'savings-goals', color: 'text-[#0ECB81]', badgeKey: 'more.badgeNew', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Repeat, labelKey: 'more.quickConvert', view: 'convert', color: 'text-[#F0B90B]', badgeKey: 'more.badgeFast', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: CreditCard, labelKey: 'more.giftCards', view: 'gift-cards', color: 'text-[#0ECB81]', badgeKey: 'more.badgeNew', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Receipt, labelKey: 'more.taxReport', view: 'tax-report', color: 'text-[#627EEA]', badgeKey: 'more.badge2024', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Swords, labelKey: 'more.tradeChallenge', view: 'trade-challenge', color: 'text-[#F6465D]', badgeKey: 'more.badgeLive', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
    { icon: Palette, labelKey: 'more.nftGallery', view: 'nft-gallery', color: 'text-[#F0B90B]', badgeKey: 'more.badgeBeta', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Layers, labelKey: 'more.defiDashboard', view: 'defi-dashboard', color: 'text-[#0ECB81]', badgeKey: 'more.badgeLive', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: MessageCircle, labelKey: 'more.socialFeed', view: 'social-feed', color: 'text-[#627EEA]', badgeKey: 'more.badgeNew', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
  ];

  const accountItems: MenuItem[] = [
    { icon: Fingerprint, labelKey: 'more.kycVerification', view: 'kyc', color: 'text-[#F0B90B]', badgeKey: user.kycStatus === 'verified' ? 'more.badgeVerified' : 'more.badgeVerifyNow', badgeColor: user.kycStatus === 'verified' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Shield, labelKey: 'more.securityCenter', view: 'settings', color: 'text-[#0ECB81]' },
    { icon: Key, labelKey: 'more.apiManagement', view: 'settings', color: 'text-[#848E9C]' },
  ];

  const supportItems: MenuItem[] = [
    { icon: HelpCircle, labelKey: 'more.helpCenter', view: 'support', color: 'text-[#848E9C]' },
    { icon: MessageSquare, labelKey: 'more.supportTickets', view: 'support', color: 'text-[#0ECB81]' },
    { icon: BookOpen, labelKey: 'more.announcements', view: 'support', color: 'text-[#F0B90B]' },
  ];

  const settingsItems: MenuItem[] = [
    { icon: Globe, labelKey: 'more.language', view: 'settings', color: 'text-[#848E9C]', badgeKey: 'EN', badgeColor: 'bg-[#2B3139] text-[#848E9C]' },
    { icon: Wallet, labelKey: 'more.currency', view: 'settings', color: 'text-[#848E9C]', badgeKey: 'USD', badgeColor: 'bg-[#2B3139] text-[#848E9C]' },
    { icon: Volume2, labelKey: 'more.notifications', view: 'notifications', color: 'text-[#848E9C]' },
    { icon: Settings, labelKey: 'more.preferences', view: 'settings', color: 'text-[#848E9C]' },
  ];

  const aboutItems: MenuItem[] = [
    { icon: Info, labelKey: 'more.aboutQtbm', view: 'support', color: 'text-[#848E9C]' },
    { icon: FileText, labelKey: 'more.termsOfService', view: 'support', color: 'text-[#848E9C]' },
    { icon: Shield, labelKey: 'more.privacyPolicy', view: 'support', color: 'text-[#848E9C]' },
  ];

  const adminItems: MenuItem[] = [
    { icon: ShieldCheck, labelKey: 'more.adminDashboard', view: 'admin', color: 'text-[#F6465D]', badgeKey: 'more.badgeAdmin', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
  ];

  const renderSection = (title: string, items: MenuItem[]) => (
    <div className="mb-4">
      <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
        {title}
      </h3>
      <Card className="bg-[#1E2329] border-[#2B3139]">
        <CardContent className="p-0">
          {items.map((item, index) => {
            const Icon = item.icon;
            const badgeText = item.badgeKey
              ? item.badgeKey.includes('.')
                ? t(item.badgeKey)
                : item.badgeKey
              : undefined;
            return (
              <React.Fragment key={item.labelKey}>
                <button
                  onClick={() => navigateTo(item.view as any)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color || 'text-[#848E9C]'}`} />
                    <span className="text-sm text-[#EAECEF]">{t(item.labelKey)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badgeText && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.badgeColor || 'bg-[#F0B90B]/10 text-[#F0B90B]'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#5E6673]" />
                  </div>
                </button>
                {index < items.length - 1 && <Separator className="bg-[#2B3139] mx-4" />}
              </React.Fragment>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2 max-w-2xl mx-auto">
        {/* Profile Section */}
        {user.isAuthenticated ? (
          <Card className="bg-gradient-to-r from-[#1E2329] to-[#2B3139] border-[#2B3139] mb-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F0B90B]/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#F0B90B] rounded-full flex items-center justify-center ring-2 ring-[#F0B90B]/20 ring-offset-2 ring-offset-[#1E2329]">
                  <span className="text-[#0B0E11] text-xl font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[#EAECEF]">
                      {user.name || t('more.user')}
                    </p>
                    <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold">
                      VIP 1
                    </Badge>
                  </div>
                  <p className="text-xs text-[#848E9C] mt-0.5">{user.email || 'user@qtbm.bank'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] font-medium flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      {user.kycStatus === 'verified' ? t('more.kycVerified') : t('more.kycPending')}
                    </span>
                    {user.twoFactorEnabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] font-medium flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {t('more.twoFactorOn')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#5E6673] shrink-0" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#1E2329] border-[#2B3139] mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#2B3139] rounded-full flex items-center justify-center">
                  <User className="h-7 w-7 text-[#5E6673]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#848E9C]">{t('more.loginToManage')}</p>
                  <p className="text-[10px] text-[#5E6673] mt-0.5">{t('more.accessAllFeatures')}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-9 text-sm px-5"
                      onClick={() => navigateTo('login')}
                    >
                      {t('more.logIn')}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10 h-9 text-sm px-5"
                      onClick={() => navigateTo('register')}
                    >
                      {t('more.register')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {featureItems.map((item) => {
            const Icon = item.icon;
            const badgeText = item.badgeKey
              ? item.badgeKey.includes('.')
                ? t(item.badgeKey)
                : item.badgeKey
              : undefined;
            return (
              <Card
                key={item.labelKey}
                className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/20 cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => navigateTo(item.view as any)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2B3139] flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${item.color || 'text-[#848E9C]'}`} />
                    </div>
                    {badgeText && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          item.badgeColor || 'bg-[#F0B90B]/10 text-[#F0B90B]'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#EAECEF]">{t(item.labelKey)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sections */}
        {renderSection(t('more.sectionAccount'), accountItems)}
        {renderSection(t('more.sectionAdministration'), adminItems)}
        {renderSection(t('more.sectionSupport'), supportItems)}
        {renderSection(t('more.sectionSettings'), settingsItems)}
        {renderSection(t('more.sectionAbout'), aboutItems)}

        {/* Logout */}
        {user.isAuthenticated && (
          <Button
            variant="outline"
            className="w-full border-[#F6465D]/20 text-[#F6465D] hover:bg-[#F6465D]/10 hover:border-[#F6465D]/30 h-10 mt-4"
            onClick={() => useAppStore.getState().logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('more.logOut')}
          </Button>
        )}

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[#5E6673]">{t('more.version')}</p>
          <p className="text-[9px] text-[#3E444D] mt-0.5">{t('more.copyright')}</p>
        </div>
      </div>
    </ScrollArea>
  );
}
