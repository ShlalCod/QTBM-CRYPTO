'use client';

/**
 * QTBM CRYPTO — Local Cache Hook (@capacitor/preferences)
 *
 * Provides a unified interface for storing data locally on the device.
 * Works in both browser (localStorage fallback) and Capacitor (native).
 *
 * Usage:
 *   const { getCache, setCache, removeCache } = useLocalCache();
 *   await setCache('wallet', walletData);
 *   const cached = await getCache<Wallet>('wallet');
 */

import { useState, useEffect, useCallback } from 'react';

interface CacheValue {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value;
      } catch {
        return localStorage.getItem(key);
      }
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value });
      } catch {
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
      } catch {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
};

export function useLocalCache() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const getCache = useCallback(async <T>(key: string): Promise<T | null> => {
    const raw = await storage.getItem(key);
    if (!raw) return null;
    try {
      const parsed: CacheValue = JSON.parse(raw);
      if (parsed.ttl > 0 && Date.now() - parsed.timestamp > parsed.ttl) {
        await storage.removeItem(key);
        return null;
      }
      return parsed.data as T;
    } catch {
      return null;
    }
  }, []);

  const setCache = useCallback(async (key: string, data: unknown, ttlMs = 0): Promise<void> => {
    const value: CacheValue = { data, timestamp: Date.now(), ttl: ttlMs };
    await storage.setItem(key, JSON.stringify(value));
  }, []);

  const removeCache = useCallback(async (key: string): Promise<void> => {
    await storage.removeItem(key);
  }, []);

  const getCacheAge = useCallback(async (key: string): Promise<number | null> => {
    const raw = await storage.getItem(key);
    if (!raw) return null;
    try {
      const parsed: CacheValue = JSON.parse(raw);
      return Date.now() - parsed.timestamp;
    } catch {
      return null;
    }
  }, []);

  return { getCache, setCache, removeCache, getCacheAge, ready };
}

export const CACHE_KEYS = {
  WALLET: 'qtbm:wallet',
  TRANSACTIONS: 'qtbm:transactions',
  TRADES: 'qtbm:trades',
  NOTIFICATIONS: 'qtbm:notifications',
  USER_PROFILE: 'qtbm:user-profile',
  ADMIN_DATA: 'qtbm:admin-data',
  BINANCE_24HR: 'qtbm:binance-24hr',
  PRICE_ALERTS: 'qtbm:price-alerts',
} as const;

export const CACHE_TTL = {
  WALLET: 30 * 1000,
  TRANSACTIONS: 60 * 1000,
  TRADES: 60 * 1000,
  NOTIFICATIONS: 25 * 1000,
  USER_PROFILE: 5 * 60 * 1000,
  ADMIN_DATA: 2 * 60 * 1000,
  BINANCE_24HR: 60 * 60 * 1000,
  PRICE_ALERTS: 60 * 1000,
} as const;
