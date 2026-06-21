import { create } from 'zustand';
import type { AppView, UserState, CryptoAsset, WalletBalance, Notification, Order } from '@/types';

export type Language = 'en' | 'ar';

interface AppState {
  // Navigation
  currentView: AppView;
  previousView: AppView | null;
  navigateTo: (view: AppView) => void;
  goBack: () => void;
  
  // Selected market
  selectedMarket: string;
  setSelectedMarket: (market: string) => void;
  
  // Selected asset
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  
  // User
  user: UserState;
  setUser: (user: Partial<UserState>) => void;
  logout: () => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Live Prices (real-time simulation)
  livePrices: Record<string, number>;
  priceDirection: Record<string, 'up' | 'down' | null>;
  updateLivePrices: (prices: Record<string, number>) => void;

  // WebSocket Connection State
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Language / i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;

  // Theme is managed by next-themes — not in app-store (THEME-001).
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'home',
  previousView: null,
  navigateTo: (view) => set((state) => ({ 
    previousView: state.currentView, 
    currentView: view 
  })),
  goBack: () => set((state) => ({ 
    currentView: state.previousView || 'home',
    previousView: null 
  })),
  
  // Selected market
  selectedMarket: 'BTCUSDT',
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  
  // Selected asset
  selectedAsset: 'BTC',
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  
  // User
  user: {
    role: 'user',
    status: 'registered',
    twoFactorEnabled: false,
    isAuthenticated: false,
    kycStatus: 'not_started',
  },
  setUser: (userData) => set((state) => ({ 
    user: { ...state.user, ...userData } 
  })),
  logout: () => set({ 
    user: { 
      role: 'user', 
      status: 'registered', 
      twoFactorEnabled: false, 
      isAuthenticated: false,
      kycStatus: 'not_started',
    } 
  }),
  
  // Favorites
  favorites: ['BTC', 'ETH', 'BNB', 'SOL'],
  toggleFavorite: (symbol) => set((state) => ({
    favorites: state.favorites.includes(symbol)
      ? state.favorites.filter(s => s !== symbol)
      : [...state.favorites, symbol]
  })),
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length 
  }),
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    return { 
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length 
    };
  }),
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Live Prices
  livePrices: {},
  priceDirection: {},
  updateLivePrices: (prices) => set((state) => {
    const direction: Record<string, 'up' | 'down' | null> = {};
    Object.keys(prices).forEach((key) => {
      const oldPrice = state.livePrices[key];
      const newPrice = prices[key];
      if (oldPrice && newPrice !== oldPrice) {
        direction[key] = newPrice > oldPrice ? 'up' : 'down';
      } else {
        direction[key] = null;
      }
    });
    return { livePrices: prices, priceDirection: direction };
  }),

  // WebSocket Connection State
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),

  // Language / i18n — default to Arabic (RTL) on first launch.
  // The stored value can be either the raw string ('ar' / 'en') or a JSON-
  // quoted string ('"ar"' / '"en"'), depending on which code path wrote it.
  // We normalize both forms on read.
  language: (() => {
    if (typeof window === 'undefined') return 'ar';
    const stored = localStorage.getItem('qtbm-language');
    if (!stored) return 'ar'; // default = Arabic
    const normalized = stored.replace(/^["']|["']$/g, '');
    return normalized === 'en' ? 'en' : 'ar';
  })() as Language,
  setLanguage: (lang) => {
    try {
      localStorage.setItem('qtbm-language', lang); // store as plain string
    } catch {}
    set({
      language: lang,
      isRTL: lang === 'ar',
    });
  },
  isRTL: (() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('qtbm-language');
    if (!stored) return true; // default = RTL
    const normalized = stored.replace(/^["']|["']$/g, '');
    return normalized !== 'en'; // RTL unless explicitly English
  })(),

  // Theme is managed EXCLUSIVELY by next-themes (THEME-001).
  // app-store no longer holds theme state or setTheme — components use useTheme() from next-themes.
}));
