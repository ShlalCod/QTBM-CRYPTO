'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
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
  label: string;
  view: string;
  color?: string;
  badge?: string;
  badgeColor?: string;
}

export default function MoreView() {
  const { navigateTo, user } = useAppStore();

  const featureItems: MenuItem[] = [
    { icon: TrendingUp, label: 'Earn', view: 'earn', color: 'text-[#F0B90B]', badge: 'Up to 12% APR', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Users, label: 'P2P Trading', view: 'p2p', color: 'text-[#0ECB81]' },
    { icon: Rocket, label: 'Launchpad', view: 'launchpad', color: 'text-[#F0B90B]' },
    { icon: ArrowDownUp, label: 'Swap', view: 'swap', color: 'text-[#0ECB81]', badge: 'New', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Sparkles, label: 'AI Assistant', view: 'ai-chat', color: 'text-[#F0B90B]', badge: 'AI', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Share2, label: 'Referral Program', view: 'referral', color: 'text-[#F0B90B]', badge: 'Earn $10', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Coins, label: 'Staking', view: 'staking', color: 'text-[#0ECB81]', badge: 'Up to 21% APY', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Flame, label: 'Futures Trading', view: 'futures', color: 'text-[#F6465D]', badge: 'Up to 125x', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
    { icon: Landmark, label: 'Margin Trading', view: 'margin', color: 'text-[#F0B90B]', badge: '3x-5x', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: PieChart, label: 'Portfolio Analytics', view: 'portfolio-analytics', color: 'text-[#627EEA]', badge: 'Pro', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Vote, label: 'Voting', view: 'voting', color: 'text-[#F0B90B]', badge: 'Governance', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Copy, label: 'Copy Trading', view: 'copy-trading', color: 'text-[#0ECB81]', badge: 'Beta', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Bell, label: 'Price Alerts', view: 'price-alerts', color: 'text-[#F0B90B]', badge: 'Active', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Trophy, label: 'Leaderboard', view: 'leaderboard', color: 'text-[#F0B90B]', badge: '$100K', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Newspaper, label: 'News Feed', view: 'news-feed', color: 'text-[#0ECB81]', badge: 'Live', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Cpu, label: 'Strategy Bot', view: 'strategy-bot', color: 'text-[#F0B90B]', badge: 'Auto', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: PiggyBank, label: 'Savings Goals', view: 'savings-goals', color: 'text-[#0ECB81]', badge: 'New', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Repeat, label: 'Quick Convert', view: 'convert', color: 'text-[#F0B90B]', badge: 'Fast', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: CreditCard, label: 'Gift Cards', view: 'gift-cards', color: 'text-[#0ECB81]', badge: 'New', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: Receipt, label: 'Tax Report', view: 'tax-report', color: 'text-[#627EEA]', badge: '2024', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
    { icon: Swords, label: 'Trading Challenges', view: 'trade-challenge', color: 'text-[#F6465D]', badge: 'Live', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
    { icon: Palette, label: 'NFT Gallery', view: 'nft-gallery', color: 'text-[#F0B90B]', badge: 'Beta', badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Layers, label: 'DeFi Dashboard', view: 'defi-dashboard', color: 'text-[#0ECB81]', badge: 'Live', badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { icon: MessageCircle, label: 'Social Feed', view: 'social-feed', color: 'text-[#627EEA]', badge: 'New', badgeColor: 'bg-[#627EEA]/10 text-[#627EEA]' },
  ];

  const accountItems: MenuItem[] = [
    { icon: Fingerprint, label: 'KYC Verification', view: 'kyc', color: 'text-[#F0B90B]', badge: user.kycStatus === 'verified' ? 'Verified' : 'Verify Now', badgeColor: user.kycStatus === 'verified' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { icon: Shield, label: 'Security Center', view: 'settings', color: 'text-[#0ECB81]' },
    { icon: Key, label: 'API Management', view: 'settings', color: 'text-[#848E9C]' },
  ];

  const supportItems: MenuItem[] = [
    { icon: HelpCircle, label: 'Help Center', view: 'support', color: 'text-[#848E9C]' },
    { icon: MessageSquare, label: 'Support Tickets', view: 'support', color: 'text-[#0ECB81]' },
    { icon: BookOpen, label: 'Announcements', view: 'support', color: 'text-[#F0B90B]' },
  ];

  const settingsItems: MenuItem[] = [
    { icon: Globe, label: 'Language', view: 'settings', color: 'text-[#848E9C]', badge: 'EN', badgeColor: 'bg-[#2B3139] text-[#848E9C]' },
    { icon: Wallet, label: 'Currency', view: 'settings', color: 'text-[#848E9C]', badge: 'USD', badgeColor: 'bg-[#2B3139] text-[#848E9C]' },
    { icon: Volume2, label: 'Notifications', view: 'notifications', color: 'text-[#848E9C]' },
    { icon: Settings, label: 'Preferences', view: 'settings', color: 'text-[#848E9C]' },
  ];

  const aboutItems: MenuItem[] = [
    { icon: Info, label: 'About QTBM BANK', view: 'support', color: 'text-[#848E9C]' },
    { icon: FileText, label: 'Terms of Service', view: 'support', color: 'text-[#848E9C]' },
    { icon: Shield, label: 'Privacy Policy', view: 'support', color: 'text-[#848E9C]' },
  ];

  const adminItems: MenuItem[] = [
    { icon: ShieldCheck, label: 'Admin Dashboard', view: 'admin', color: 'text-[#F6465D]', badge: 'Admin', badgeColor: 'bg-[#F6465D]/10 text-[#F6465D]' },
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
            return (
              <React.Fragment key={item.label}>
                <button
                  onClick={() => navigateTo(item.view as any)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color || 'text-[#848E9C]'}`} />
                    <span className="text-sm text-[#EAECEF]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.badgeColor || 'bg-[#F0B90B]/10 text-[#F0B90B]'
                        }`}
                      >
                        {item.badge}
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
                      {user.name || 'User'}
                    </p>
                    <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold">
                      VIP 1
                    </Badge>
                  </div>
                  <p className="text-xs text-[#848E9C] mt-0.5">{user.email || 'user@qtbm.bank'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] font-medium flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      {user.kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                    </span>
                    {user.twoFactorEnabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ECB81]/10 text-[#0ECB81] font-medium flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        2FA On
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
                  <p className="text-sm text-[#848E9C]">Log in to manage your account</p>
                  <p className="text-[10px] text-[#5E6673] mt-0.5">Access all features and services</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-9 text-sm px-5"
                      onClick={() => navigateTo('login')}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10 h-9 text-sm px-5"
                      onClick={() => navigateTo('register')}
                    >
                      Register
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
            return (
              <Card
                key={item.label}
                className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/20 cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => navigateTo(item.view as any)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2B3139] flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${item.color || 'text-[#848E9C]'}`} />
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          item.badgeColor || 'bg-[#F0B90B]/10 text-[#F0B90B]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#EAECEF]">{item.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sections */}
        {renderSection('Account', accountItems)}
        {renderSection('Administration', adminItems)}
        {renderSection('Support', supportItems)}
        {renderSection('Settings', settingsItems)}
        {renderSection('About', aboutItems)}

        {/* Logout */}
        {user.isAuthenticated && (
          <Button
            variant="outline"
            className="w-full border-[#F6465D]/20 text-[#F6465D] hover:bg-[#F6465D]/10 hover:border-[#F6465D]/30 h-10 mt-4"
            onClick={() => useAppStore.getState().logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        )}

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[#5E6673]">QTBM BANK v2.1.0</p>
          <p className="text-[9px] text-[#3E444D] mt-0.5">© 2024 QTBM BANK. All rights reserved.</p>
        </div>
      </div>
    </ScrollArea>
  );
}
