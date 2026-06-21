'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/lib/auth-context';
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
  const { profile } = useAuth();
  const { t } = useTranslation();
  const isAdmin = profile?.role === 'admin';

  const featureItems: MenuItem[] = [
    { icon: TrendingUp, labelKey: 'more.earn', view: 'earn', color: 'text-primary', badgeKey: 'more.badgeUpTo12APR', badgeColor: 'bg-success/10 text-success' },
    { icon: Users, labelKey: 'more.p2pTrading', view: 'p2p', color: 'text-success' },
    { icon: Rocket, labelKey: 'more.launchpad', view: 'launchpad', color: 'text-primary' },
    { icon: ArrowDownUp, labelKey: 'more.swap', view: 'swap', color: 'text-success', badgeKey: 'more.badgeNew', badgeColor: 'bg-success/10 text-success' },
    { icon: Sparkles, labelKey: 'more.aiAssistant', view: 'ai-chat', color: 'text-primary', badgeKey: 'more.badgeAI', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Share2, labelKey: 'more.referralProgram', view: 'referral', color: 'text-primary', badgeKey: 'more.badgeEarn10', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Coins, labelKey: 'more.staking', view: 'staking', color: 'text-success', badgeKey: 'more.badgeUpTo21APY', badgeColor: 'bg-success/10 text-success' },
    { icon: Flame, labelKey: 'more.futuresTrading', view: 'futures', color: 'text-destructive', badgeKey: 'more.badgeUpTo125x', badgeColor: 'bg-destructive/10 text-destructive' },
    { icon: Landmark, labelKey: 'more.marginTrading', view: 'margin', color: 'text-primary', badgeKey: 'more.badge3x5x', badgeColor: 'bg-primary/10 text-primary' },
    { icon: PieChart, labelKey: 'more.portfolioAnalytics', view: 'portfolio-analytics', color: 'text-[#627EEA]', badgeKey: 'more.badgePro', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Vote, labelKey: 'more.voting', view: 'voting', color: 'text-primary', badgeKey: 'more.badgeGovernance', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Copy, labelKey: 'more.copyTrading', view: 'copy-trading', color: 'text-success', badgeKey: 'more.badgeBeta', badgeColor: 'bg-success/10 text-success' },
    { icon: Bell, labelKey: 'more.priceAlerts', view: 'price-alerts', color: 'text-primary', badgeKey: 'more.badgeActive', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Trophy, labelKey: 'more.leaderboard', view: 'leaderboard', color: 'text-primary', badgeKey: 'more.badge100K', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Newspaper, labelKey: 'more.newsFeed', view: 'news-feed', color: 'text-success', badgeKey: 'more.badgeLive', badgeColor: 'bg-success/10 text-success' },
    { icon: Cpu, labelKey: 'more.strategyBot', view: 'strategy-bot', color: 'text-primary', badgeKey: 'more.badgeAuto', badgeColor: 'bg-success/10 text-success' },
    { icon: PiggyBank, labelKey: 'more.savingsGoals', view: 'savings-goals', color: 'text-success', badgeKey: 'more.badgeNew', badgeColor: 'bg-success/10 text-success' },
    { icon: Repeat, labelKey: 'more.quickConvert', view: 'convert', color: 'text-primary', badgeKey: 'more.badgeFast', badgeColor: 'bg-primary/10 text-primary' },
    { icon: CreditCard, labelKey: 'more.giftCards', view: 'gift-cards', color: 'text-success', badgeKey: 'more.badgeNew', badgeColor: 'bg-success/10 text-success' },
    { icon: Receipt, labelKey: 'more.taxReport', view: 'tax-report', color: 'text-[#627EEA]', badgeKey: 'more.badge2024', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Swords, labelKey: 'more.tradeChallenge', view: 'trade-challenge', color: 'text-destructive', badgeKey: 'more.badgeLive', badgeColor: 'bg-destructive/10 text-destructive' },
    { icon: Palette, labelKey: 'more.nftGallery', view: 'nft-gallery', color: 'text-primary', badgeKey: 'more.badgeBeta', badgeColor: 'bg-primary/10 text-primary' },
    { icon: Layers, labelKey: 'more.defiDashboard', view: 'defi-dashboard', color: 'text-success', badgeKey: 'more.badgeLive', badgeColor: 'bg-success/10 text-success' },
    { icon: MessageCircle, labelKey: 'more.socialFeed', view: 'social-feed', color: 'text-[#627EEA]', badgeKey: 'more.badgeNew', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
  ];

  const accountItems: MenuItem[] = [
    { icon: Fingerprint, labelKey: 'more.kycVerification', view: 'kyc', color: 'text-primary', badgeKey: user.kycStatus === 'verified' ? 'more.badgeVerified' : 'more.badgeVerifyNow', badgeColor: user.kycStatus === 'verified' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary' },
    { icon: Shield, labelKey: 'more.securityCenter', view: 'settings', color: 'text-success' },
    { icon: Key, labelKey: 'more.apiManagement', view: 'settings', color: 'text-muted-foreground' },
  ];

  const supportItems: MenuItem[] = [
    { icon: HelpCircle, labelKey: 'more.helpCenter', view: 'support', color: 'text-muted-foreground' },
    { icon: MessageSquare, labelKey: 'more.supportTickets', view: 'support', color: 'text-success' },
    { icon: BookOpen, labelKey: 'more.announcements', view: 'support', color: 'text-primary' },
  ];

  const settingsItems: MenuItem[] = [
    { icon: Globe, labelKey: 'more.language', view: 'settings', color: 'text-muted-foreground', badgeKey: 'EN', badgeColor: 'bg-secondary text-muted-foreground' },
    { icon: Wallet, labelKey: 'more.currency', view: 'settings', color: 'text-muted-foreground', badgeKey: 'USD', badgeColor: 'bg-secondary text-muted-foreground' },
    { icon: Volume2, labelKey: 'more.notifications', view: 'notifications', color: 'text-muted-foreground' },
    { icon: Settings, labelKey: 'more.preferences', view: 'settings', color: 'text-muted-foreground' },
  ];

  const aboutItems: MenuItem[] = [
    { icon: Info, labelKey: 'more.aboutQtbm', view: 'support', color: 'text-muted-foreground' },
    { icon: FileText, labelKey: 'more.termsOfService', view: 'support', color: 'text-muted-foreground' },
    { icon: Shield, labelKey: 'more.privacyPolicy', view: 'support', color: 'text-muted-foreground' },
  ];

  const adminItems: MenuItem[] = [
    { icon: ShieldCheck, labelKey: 'more.adminDashboard', view: 'admin', color: 'text-destructive', badgeKey: 'more.badgeAdmin', badgeColor: 'bg-destructive/10 text-destructive' },
  ];

  const renderSection = (title: string, items: MenuItem[]) => (
    <div className="mb-4">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        {title}
      </h3>
      <Card className="bg-card border-border rounded-xl">
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
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color || 'text-muted-foreground'}`} />
                    <span className="text-sm text-foreground">{t(item.labelKey)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badgeText && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.badgeColor || 'bg-primary/10 text-primary'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                    <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-muted-foreground [dir=rtl]:rotate-180" />
                  </div>
                </button>
                {index < items.length - 1 && <Separator className="bg-secondary mx-4" />}
              </React.Fragment>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-2 max-w-2xl mx-auto">
        {/* Profile Section */}
        {user.isAuthenticated ? (
          <Card className="bg-gradient-to-r from-card to-secondary border-border mb-4 overflow-hidden relative rounded-xl">
            <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                  <span className="text-primary-foreground text-xl font-bold">
                    {user.name?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">
                      {user.name || t('more.user')}
                    </p>
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
                      {t('settings.vipLevel1')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.email || t('settings.placeholderEmail')}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      {user.kycStatus === 'verified' ? t('more.kycVerified') : t('more.kycPending')}
                    </span>
                    {user.twoFactorEnabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {t('more.twoFactorOn')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="rtl:scale-x-[-1] h-5 w-5 text-muted-foreground shrink-0 [dir=rtl]:rotate-180" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border mb-4 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('more.loginToManage')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t('more.accessAllFeatures')}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 text-sm px-5"
                      onClick={() => navigateTo('login')}
                    >
                      {t('more.logIn')}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 h-9 text-sm px-5"
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
                className="bg-card border-border hover:border-primary/20 cursor-pointer transition-all active:scale-[0.98] rounded-xl"
                onClick={() => navigateTo(item.view as any)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`} />
                    </div>
                    {badgeText && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          item.badgeColor || 'bg-primary/10 text-primary'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{t(item.labelKey)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sections */}
        {renderSection(t('more.sectionAccount'), accountItems)}
        {isAdmin && renderSection(t('more.sectionAdministration'), adminItems)}
        {renderSection(t('more.sectionSupport'), supportItems)}
        {renderSection(t('more.sectionSettings'), settingsItems)}
        {renderSection(t('more.sectionAbout'), aboutItems)}

        {/* Logout */}
        {user.isAuthenticated && (
          <Button
            variant="outline"
            className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 h-10 mt-4"
            onClick={() => useAppStore.getState().logout()}
          >
            <LogOut className="h-4 w-4 me-2" />
            {t('more.logOut')}
          </Button>
        )}

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground">{t('more.version')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('more.copyright')}</p>
        </div>
      </div>
    </ScrollArea>
  );
}
