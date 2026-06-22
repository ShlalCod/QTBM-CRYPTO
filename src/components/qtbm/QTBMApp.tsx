'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  TrendingUp,
  CandlestickChart,
  Wallet,
  Menu,
  Search,
  Bell,
  LogIn,
  X,
  Settings,
  Shield,
  Headphones,
  Moon,
  Sun,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTranslation } from '@/lib/i18n';
import { subscribeToNotifications, getUserNotifications } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockNotifications } from '@/lib/mock-data';
import { usePriceSimulator } from '@/hooks/use-price-simulator';
import { lazy, Suspense } from 'react';

// Lazy load all views — each loads on-demand when first visited
// This splits the bundle and dramatically reduces initial load time
const HomeView = lazy(() => import('./HomeView'));
const MarketsView = lazy(() => import('./MarketsView'));
const TradeView = lazy(() => import('./TradeView'));
const WalletView = lazy(() => import('./WalletView'));
const MoreView = lazy(() => import('./MoreView'));
const AuthView = lazy(() => import('./AuthView'));
const EarnView = lazy(() => import('./EarnView'));
const P2PView = lazy(() => import('./P2PView'));
const LaunchpadView = lazy(() => import('./LaunchpadView'));
const NotificationsView = lazy(() => import('./NotificationsView'));
const SettingsView = lazy(() => import('./SettingsView'));
const KYCView = lazy(() => import('./KYCView'));
const SupportView = lazy(() => import('./SupportView'));
const DepositView = lazy(() => import('./DepositView'));
const WithdrawView = lazy(() => import('./WithdrawView'));
const TransferView = lazy(() => import('./TransferView'));
const AssetDetailView = lazy(() => import('./AssetDetailView'));
const OrderHistoryView = lazy(() => import('./OrderHistoryView'));
const TradeHistoryView = lazy(() => import('./TradeHistoryView'));
const FuturesView = lazy(() => import('./FuturesView'));
const MarginView = lazy(() => import('./MarginView'));
const AdminDashboardView = lazy(() => import('./AdminDashboardView'));
const AIChatView = lazy(() => import('./AIChatView'));
const SwapView = lazy(() => import('./SwapView'));
const ReferralView = lazy(() => import('./ReferralView'));
const PortfolioAnalyticsView = lazy(() => import('./PortfolioAnalyticsView'));
const StakingView = lazy(() => import('./StakingView'));
const CopyTradingView = lazy(() => import('./CopyTradingView'));
const VotingView = lazy(() => import('./VotingView'));
const PriceAlertsView = lazy(() => import('./PriceAlertsView'));
const LeaderboardView = lazy(() => import('./LeaderboardView'));
const NewsFeedView = lazy(() => import('./NewsFeedView'));
const TransactionDetailView = lazy(() => import('./TransactionDetailView'));
const StrategyBotView = lazy(() => import('./StrategyBotView'));
const SavingsGoalsView = lazy(() => import('./SavingsGoalsView'));
const ConvertView = lazy(() => import('./ConvertView'));
const GiftCardsView = lazy(() => import('./GiftCardsView'));
const TaxReportView = lazy(() => import('./TaxReportView'));
const TradeChallengeView = lazy(() => import('./TradeChallengeView'));
const NFTGalleryView = lazy(() => import('./NFTGalleryView'));
const DeFiDashboardView = lazy(() => import('./DeFiDashboardView'));
const SocialFeedView = lazy(() => import('./SocialFeedView'));

// Loading spinner for lazy-loaded views
function ViewLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const navItems = [
  { id: 'home' as const, labelKey: 'nav.home', icon: Home },
  { id: 'markets' as const, labelKey: 'nav.markets', icon: TrendingUp },
  { id: 'trade' as const, labelKey: 'nav.trade', icon: CandlestickChart },
  { id: 'wallet' as const, labelKey: 'nav.wallet', icon: Wallet },
  { id: 'more' as const, labelKey: 'nav.more', icon: Menu },
];

const sidebarItems = [
  { id: 'home' as const, labelKey: 'nav.home', icon: Home },
  { id: 'markets' as const, labelKey: 'nav.markets', icon: TrendingUp },
  { id: 'trade' as const, labelKey: 'nav.trade', icon: CandlestickChart },
  { id: 'futures' as const, labelKey: 'nav.futures', icon: TrendingUp },
  { id: 'margin' as const, labelKey: 'nav.margin', icon: TrendingUp },
  { id: 'wallet' as const, labelKey: 'nav.wallet', icon: Wallet },
  { id: 'earn' as const, labelKey: 'nav.earn', icon: TrendingUp },
  { id: 'p2p' as const, labelKey: 'nav.p2p', icon: TrendingUp },
  { id: 'launchpad' as const, labelKey: 'nav.launchpad', icon: TrendingUp },
];

const authViews = ['login', 'register'];

// Views that have their own back navigation (sub-views)
const subViews = ['earn', 'p2p', 'launchpad', 'notifications', 'settings', 'kyc', 'support', 'deposit', 'withdraw', 'transfer', 'asset-detail', 'order-history', 'trade-history', 'futures', 'margin', 'admin', 'ai-chat', 'swap', 'referral', 'staking', 'portfolio-analytics', 'copy-trading', 'voting', 'price-alerts', 'leaderboard', 'news-feed', 'transaction-detail', 'strategy-bot', 'savings-goals', 'convert', 'gift-cards', 'tax-report', 'trade-challenge', 'nft-gallery', 'defi-dashboard', 'social-feed'];

function ViewRenderer({ view }: { view: string }) {
  switch (view) {
    case 'home':
      return <HomeView />;
    case 'markets':
      return <MarketsView />;
    case 'trade':
      return <TradeView />;
    case 'wallet':
      return <WalletView />;
    case 'login':
    case 'register':
      return <AuthView />;
    case 'more':
      return <MoreView />;
    case 'earn':
      return <EarnView />;
    case 'p2p':
      return <P2PView />;
    case 'launchpad':
      return <LaunchpadView />;
    case 'notifications':
      return <NotificationsView />;
    case 'settings':
      return <SettingsView />;
    case 'kyc':
      return <KYCView />;
    case 'support':
      return <SupportView />;
    case 'deposit':
      return <DepositView />;
    case 'withdraw':
      return <WithdrawView />;
    case 'transfer':
      return <TransferView />;
    case 'asset-detail':
      return <AssetDetailView />;
    case 'order-history':
      return <OrderHistoryView />;
    case 'trade-history':
      return <TradeHistoryView />;
    case 'futures':
      return <FuturesView />;
    case 'margin':
      return <MarginView />;
    case 'admin':
      return <AdminDashboardView />;
    case 'ai-chat':
      return <AIChatView />;
    case 'swap':
      return <SwapView />;
    case 'referral':
      return <ReferralView />;
    case 'staking':
      return <StakingView />;
    case 'portfolio-analytics':
      return <PortfolioAnalyticsView />;
    case 'copy-trading':
      return <CopyTradingView />;
    case 'voting':
      return <VotingView />;
    case 'price-alerts':
      return <PriceAlertsView />;
    case 'leaderboard':
      return <LeaderboardView />;
    case 'news-feed':
      return <NewsFeedView />;
    case 'transaction-detail':
      return <TransactionDetailView />;
    case 'strategy-bot':
      return <StrategyBotView />;
    case 'savings-goals':
      return <SavingsGoalsView />;
    case 'convert':
      return <ConvertView />;
    case 'gift-cards':
      return <GiftCardsView />;
    case 'tax-report':
      return <TaxReportView />;
    case 'trade-challenge':
      return <TradeChallengeView />;
    case 'nft-gallery':
      return <NFTGalleryView />;
    case 'defi-dashboard':
      return <DeFiDashboardView />;
    case 'social-feed':
      return <SocialFeedView />;
    // Fallback views that show the appropriate sub-view
    case 'profile':
      return <MoreView />;
    default:
      return <HomeView />;
  }
}

export default function QTBMApp() {
  const { currentView, navigateTo, searchQuery, setSearchQuery, user, unreadCount, setNotifications, isRTL, language, wsConnected, setUser } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { firebaseUser, profile, loading, isAuthenticated, signOut } = useAuth();
  const { isOnline, wasOffline } = useNetworkStatus();
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Initialize price simulator
  usePriceSimulator();

  // Sync Firebase auth profile → app-store user state
  useEffect(() => {
    if (profile) {
      setUser({
        id: profile.uid,
        email: profile.email,
        name: profile.displayName ?? undefined,
        avatar: profile.photoURL ?? undefined,
        role: profile.role,
        status: profile.status,
        isAuthenticated: true,
        twoFactorEnabled: profile.twoFactorEnabled,
        kycStatus: profile.kycStatus,
      });
    } else if (!loading) {
      setUser({
        id: '',
        email: '',
        name: '',
        role: 'user',
        status: 'registered',
        isAuthenticated: false,
        twoFactorEnabled: false,
        kycStatus: 'not_started',
      });
    }
  }, [profile, loading, setUser]);

  // Poll notifications from Firestore every 30s (replaces continuous onSnapshot)
  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      return;
    }
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const notifs = await getUserNotifications(firebaseUser.uid, 20);
        if (!mounted) return;
        setNotifications(notifs.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          timestamp: Date.now(),
          isRead: n.isRead,
        })));
      } catch (err) {
        // Offline or permission error — keep existing notifications
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [firebaseUser, setNotifications]);

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Theme is applied by next-themes via the .dark/.light class on <html>.
  // No manual data-theme manipulation needed (THEME-001/002).

  const handleNavClick = (view: typeof currentView) => {
    navigateTo(view);
  };

  // Auth protection: screens that require authentication
  const protectedViews = ['wallet', 'deposit', 'withdraw', 'transfer', 'asset-detail', 'trade', 'futures', 'margin', 'earn', 'p2p', 'staking', 'swap', 'convert', 'copy-trading', 'portfolio-analytics', 'order-history', 'trade-history', 'transaction-detail', 'kyc', 'admin', 'referral', 'price-alerts', 'savings-goals', 'gift-cards', 'tax-report', 'strategy-bot', 'launchpad', 'voting', 'leaderboard', 'news-feed', 'social-feed', 'trade-challenge', 'nft-gallery', 'defi-dashboard', 'settings', 'support'];
  const authViews = ['login', 'register'];

  // Redirect: if loading, show nothing (prevents flash)
  // If not authenticated and trying to access protected view → redirect to login
  // If authenticated and on auth view → redirect admin to 'admin', regular users to 'home'
  const effectiveView = (() => {
    if (loading) return currentView; // don't redirect during load
    if (!isAuthenticated && protectedViews.includes(currentView)) return 'login';
    if (isAuthenticated && authViews.includes(currentView)) {
      // Admin users land on admin dashboard; regular users on home
      return profile?.role === 'admin' ? 'admin' : 'home';
    }
    return currentView;
  })();

  // Determine which view is "active" in the sidebar/nav
  const getActiveNavId = () => {
    if (['home'].includes(effectiveView)) return 'home';
    if (['markets'].includes(effectiveView)) return 'markets';
    if (['trade'].includes(effectiveView)) return 'trade';
    if (['futures'].includes(effectiveView)) return 'futures';
    if (['margin'].includes(effectiveView)) return 'margin';
    if (['wallet', 'deposit', 'withdraw', 'transfer', 'asset-detail'].includes(effectiveView)) return 'wallet';
    // Everything else maps to "more"
    return 'more';
  };

  const activeNavId = getActiveNavId();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir={isRTL ? 'rtl' : 'ltr'} data-theme={theme}>
      {/* Header with glass effect */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo + LIVE Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 gradient-gold rounded-md flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-[#0B0E11] font-bold text-sm">Q</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-base leading-tight tracking-wide">QTBM BANK</span>
                {/* LIVE Badge with WS + network connection indicator */}
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${wsConnected && isOnline ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${wsConnected && isOnline ? 'bg-success pulse-green' : 'bg-destructive live-dot'}`} />
                  <span className={`text-[10px] font-bold tracking-wider ${wsConnected && isOnline ? 'text-success' : 'text-destructive'}`}>{!isOnline ? 'غير متصل' : wsConnected ? t('status.live') : 'OFF'}</span>
                </div>
              </div>
              <span className="text-muted-foreground text-[10px] leading-tight">{t('common.digitalAssetExchange')}</span>
            </div>
            <div className="sm:hidden flex items-center gap-1.5">
              <span className="text-primary font-bold text-sm">QTBM</span>
              <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-success pulse-green' : 'bg-destructive live-dot'}`} />
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t('common.searchMarkets')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus:border-[#F0B90B] focus:ring-primary/20 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search toggle - mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? t('actions.close') : t('actions.search')}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9 relative"
              onClick={() => navigateTo('notifications')}
              aria-label={t('nav.notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -end-0.5 h-4 min-w-4 px-1 bg-destructive text-white text-[10px] flex items-center justify-center border-0 animate-fade-scale notif-dot-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-secondary h-9 w-9 transition-colors duration-200"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
              aria-label={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Login / User */}
            {user.isAuthenticated ? (
              <Button
                variant="ghost"
                className="text-foreground hover:bg-secondary h-9 px-3 text-sm"
                onClick={() => navigateTo('more')}
              >
                <div className="w-6 h-6 gradient-gold rounded-full flex items-center justify-center me-2 shadow-sm shadow-primary/30">
                  <span className="text-[#0B0E11] text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline">{user.name || 'User'}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-foreground hover:bg-secondary h-9 px-3 text-sm hidden sm:inline-flex"
                  onClick={() => navigateTo('register')}
                >
                  {t('auth.register')}
                </Button>
                <Button
                  className="gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-9 px-4 text-sm shadow-md shadow-primary/20 transition-all duration-200 hover-lift"
                  onClick={() => navigateTo('login')}
                >
                  <LogIn className="h-4 w-4 me-1.5" />
                  <span className="hidden sm:inline">{t('auth.login')}</span>
                  <span className="sm:hidden">{t('auth.login')}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Animated gradient line below header */}
        <div className="animated-gradient-border h-[1px]" />

        {/* Mobile Search Bar - Expandable */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="p-3">
                <div className="relative group">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder={t('common.searchMarkets')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="ps-9 bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus:border-[#F0B90B] focus:ring-primary/20 backdrop-blur-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on auth views */}
        {!authViews.includes(currentView) && (
        <aside className="hidden lg:flex flex-col w-56 bg-background/80 backdrop-blur-sm border-r border-border/60 shrink-0">
          <ScrollArea className="flex-1">
            <nav className="py-4 px-3 space-y-0.5">
              {sidebarItems.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 sidebar-item-hover ${
                      isActive
                        ? 'bg-secondary text-primary sidebar-item-active'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
                    <span>{t(item.labelKey)}</span>
                    {isActive && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </nav>
            <Separator className="bg-secondary/60 mx-3" />
            <div className="p-3 space-y-0.5">
              {[
                { id: 'notifications' as const, labelKey: 'nav.notifications', icon: Bell },
                { id: 'settings' as const, labelKey: 'nav.settings', icon: Settings },
                { id: 'kyc' as const, labelKey: 'nav.kyc', icon: Shield },
                { id: 'support' as const, labelKey: 'nav.support', icon: Headphones },
              ].map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 sidebar-item-hover ${
                      isActive
                        ? 'bg-secondary text-primary sidebar-item-active'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
                    <span>{t(item.labelKey)}</span>
                    {isActive && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
            <Separator className="bg-secondary/60 mx-3" />
            <div className="p-3">
              <button
                onClick={() => handleNavClick('more')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 sidebar-item-hover ${
                  currentView === 'more'
                    ? 'bg-secondary text-primary sidebar-item-active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <Menu className={`h-5 w-5 shrink-0 transition-colors duration-200 ${currentView === 'more' ? 'text-primary' : ''}`} />
                <span>{t('nav.more')}</span>
                {currentView === 'more' && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            </div>
          </ScrollArea>

          {/* Sidebar bottom promo with animated gradient */}
          <div className="p-3 mt-auto">
            <div className="relative overflow-hidden rounded-lg border border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-[#1E2329] to-success/5 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
              <div className="absolute inset-0 shimmer-gradient" />
              <div className="relative p-4">
                <p className="text-xs text-muted-foreground mb-2">{t('common.tradeOnTheGo')}</p>
                <p className="text-xs text-foreground font-medium mb-3">{t('common.downloadApp')}</p>
                <Button className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] text-xs h-8 font-semibold shadow-md shadow-primary/15 press-scale">
                  {t('common.getStarted')}
                </Button>
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* Main View Content */}
        <main className={`flex-1 ${effectiveView === 'trade' ? 'overflow-hidden' : 'overflow-y-auto'} ${authViews.includes(effectiveView) ? '' : 'pb-16 lg:pb-0'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={effectiveView === 'trade' ? 'h-full view-transition' : 'view-transition'}
              >
                <Suspense fallback={<ViewLoader />}>
                  <ViewRenderer view={effectiveView} />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Footer Gradient Line - visible on all non-auth views */}
      {!authViews.includes(currentView) && (
        <div className="footer-gradient-line shrink-0" />
      )}

      {/* Mobile Bottom Navigation - Hidden on auth views */}
      {!authViews.includes(currentView) && (
      <nav className="lg:hidden fixed bottom-0 start-0 end-0 z-50 glass-header border-t border-border/60 pb-safe">
        <div className="relative flex items-center justify-around h-14">
          {/* Sliding pill indicator behind nav items */}
          <motion.div
            className="bottom-nav-indicator"
            layoutId="bottomNavPill"
            style={{ width: `${100 / navItems.length}%` }}
            animate={{
              left: `${(navItems.findIndex(item => activeNavId === item.id) / navItems.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          {navItems.map((item) => {
            const isActive = activeNavId === item.id;
            const Icon = item.icon;
            const isTrade = item.id === 'trade';

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full relative transition-all duration-200 touch-feedback ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-muted-foreground'
                }`}
              >
                {isTrade ? (
                  <div className={`flex items-center justify-center w-11 h-11 rounded-full -mt-5 transition-all duration-300 trade-btn-glow ${
                    isActive
                      ? 'gradient-gold glow-yellow shadow-lg shadow-primary/30 active'
                      : 'bg-secondary hover:bg-secondary'
                  }`}>
                    <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'text-[#0B0E11] scale-110' : 'text-muted-foreground'}`} />
                  </div>
                ) : (
                  <div className="relative">
                    <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute -bottom-1 start-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                )}
                <span className={`text-[10px] ${isTrade ? 'mt-0' : ''} font-medium transition-colors duration-200`}>
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
