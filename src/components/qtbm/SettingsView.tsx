'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import {
  ArrowLeft,
  User,
  Lock,
  Shield,
  Smartphone,
  Globe,
  Wallet,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  Languages,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsView() {
  const { navigateTo, user, language, setLanguage, theme, setTheme } = useAppStore();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tradeNotifications, setTradeNotifications] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Update document direction when language changes
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'ar');
  };

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
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
          <h1 className="text-lg font-bold text-[#EAECEF]">{t('settings.title')}</h1>
        </div>

        {/* Profile Settings */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            {t('settings.profile')}
          </h3>
          <Card className="glass-card border-[#2B3139]/30 profile-card-border">
            <CardContent className="p-0">
              {/* Name */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#848E9C]" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#5E6673]">{t('settings.name')}</p>
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] h-7 text-xs"
                          autoFocus
                        />
                        <Button size="sm" className="h-7 px-2 gradient-green text-[#0B0E11] text-xs" onClick={saveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('name', user.name || 'User')}
                        className="text-sm text-[#EAECEF]"
                      >
                        {user.name || t('settings.notSet')} <ChevronRight className="h-3 w-3 inline text-[#5E6673]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Email */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#848E9C]" />
                  <div>
                    <p className="text-xs text-[#5E6673]">{t('settings.email')}</p>
                    <p className="text-sm text-[#EAECEF]">{user.email || 'user@qtbm.bank'}</p>
                  </div>
                </div>
                <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px]">{t('status.verified')}</Badge>
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Phone */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[#848E9C]" />
                  <div>
                    <p className="text-xs text-[#5E6673]">{t('settings.phone')}</p>
                    <p className="text-sm text-[#EAECEF]">+1 ***-***-1234</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#F0B90B] text-xs h-7">
                  {t('settings.change')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            {t('settings.security')}
          </h3>
          <Card className="glass-card border-[#2B3139]/30">
            <CardContent className="p-0">
              {/* Change Password */}
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/30 transition-colors setting-item-hover">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#F0B90B]" />
                  <span className="text-sm text-[#EAECEF]">{t('settings.changePassword')}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5E6673]" />
              </button>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* 2FA */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#0ECB81]" />
                  <div>
                    <span className="text-sm text-[#EAECEF]">{t('settings.twoFactorAuth')}</span>
                    <p className="text-[10px] text-[#5E6673]">
                      {user.twoFactorEnabled ? t('status.enabled') : t('status.disabled')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={user.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    useAppStore.getState().setUser({ twoFactorEnabled: checked })
                  }
                  className="data-[state=checked]:bg-[#0ECB81]"
                />
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Device Management */}
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/30 transition-colors setting-item-hover">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[#848E9C]" />
                  <div>
                    <span className="text-sm text-[#EAECEF]">{t('settings.deviceManagement')}</span>
                    <p className="text-[10px] text-[#5E6673]">{t('settings.activeDevicesCount')}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5E6673]" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            {t('settings.preferences')}
          </h3>
          <Card className="glass-card border-[#2B3139]/30">
            <CardContent className="p-0">
              {/* Language - Enhanced with toggle */}
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5 text-[#F0B90B]" />
                    <span className="text-sm text-[#EAECEF]">{t('settings.language')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      language === 'en'
                        ? 'gradient-yellow text-[#0B0E11] shadow-md shadow-[#F0B90B]/20'
                        : 'bg-[#2B3139]/40 text-[#848E9C] hover:bg-[#2B3139]/60 hover:text-[#EAECEF]'
                    }`}
                  >
                    <span className="text-base">🇺🇸</span>
                    <span>{t('settings.english')}</span>
                    {language === 'en' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      language === 'ar'
                        ? 'gradient-yellow text-[#0B0E11] shadow-md shadow-[#F0B90B]/20'
                        : 'bg-[#2B3139]/40 text-[#848E9C] hover:bg-[#2B3139]/60 hover:text-[#EAECEF]'
                    }`}
                  >
                    <span className="text-base">🇸🇦</span>
                    <span>{t('settings.arabic')}</span>
                    {language === 'ar' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {language === 'ar' && (
                  <div className="text-[10px] text-[#0ECB81] mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse-soft" />
                    {t('settings.rtlEnabled')}
                  </div>
                )}
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Currency */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-[#848E9C]" />
                  <span className="text-sm text-[#EAECEF]">{t('settings.currency')}</span>
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24 bg-[#2B3139]/60 border-[#2B3139] text-[#EAECEF] text-xs h-8 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2B3139] border-[#2B3139]">
                    <SelectItem value="USD" className="text-[#EAECEF] text-xs">USD</SelectItem>
                    <SelectItem value="EUR" className="text-[#EAECEF] text-xs">EUR</SelectItem>
                    <SelectItem value="SAR" className="text-[#EAECEF] text-xs">SAR</SelectItem>
                    <SelectItem value="AED" className="text-[#EAECEF] text-xs">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Appearance / Theme */}
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-[#F0B90B]" />
                    <span className="text-sm text-[#EAECEF]">{t('settings.appearance')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      theme === 'dark'
                        ? 'gradient-yellow text-[#0B0E11] shadow-md shadow-[#F0B90B]/20'
                        : 'bg-[#2B3139]/40 text-[#848E9C] hover:bg-[#2B3139]/60 hover:text-[#EAECEF]'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    <span>{t('settings.darkMode')}</span>
                    {theme === 'dark' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      theme === 'light'
                        ? 'gradient-yellow text-[#0B0E11] shadow-md shadow-[#F0B90B]/20'
                        : 'bg-[#2B3139]/40 text-[#848E9C] hover:bg-[#2B3139]/60 hover:text-[#EAECEF]'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    <span>{t('settings.lightMode')}</span>
                    {theme === 'light' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />

              {/* Notifications */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[#848E9C]" />
                  <span className="text-sm text-[#EAECEF]">{t('settings.pushNotifications')}</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-[#0ECB81]"
                />
              </div>

              {notificationsEnabled && (
                <>
                  <Separator className="bg-[#2B3139]/40 mx-4" />
                  <div className="px-4 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#848E9C]">{t('settings.tradeUpdates')}</span>
                      <Switch
                        checked={tradeNotifications}
                        onCheckedChange={setTradeNotifications}
                        className="data-[state=checked]:bg-[#0ECB81] scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#848E9C]">{t('settings.securityAlerts')}</span>
                      <Switch
                        checked={securityNotifications}
                        onCheckedChange={setSecurityNotifications}
                        className="data-[state=checked]:bg-[#0ECB81] scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#848E9C]">{t('settings.promotions')}</span>
                      <Switch
                        checked={promoNotifications}
                        onCheckedChange={setPromoNotifications}
                        className="data-[state=checked]:bg-[#0ECB81] scale-75"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            {t('settings.about')}
          </h3>
          <Card className="glass-card border-[#2B3139]/30">
            <CardContent className="p-0">
              <div className="px-4 py-3.5 flex items-center justify-between">
                <span className="text-sm text-[#848E9C]">{t('settings.appVersion')}</span>
                <span className="text-sm text-[#EAECEF]">v2.1.0</span>
              </div>
              <Separator className="bg-[#2B3139]/40 mx-4" />
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/30 transition-colors setting-item-hover"
                onClick={() => navigateTo('support')}
              >
                <span className="text-sm text-[#EAECEF]">{t('settings.termsOfService')}</span>
                <ChevronRight className="h-4 w-4 text-[#5E6673]" />
              </button>
              <Separator className="bg-[#2B3139]/40 mx-4" />
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2B3139]/30 transition-colors setting-item-hover"
                onClick={() => navigateTo('support')}
              >
                <span className="text-sm text-[#EAECEF]">{t('settings.privacyPolicy')}</span>
                <ChevronRight className="h-4 w-4 text-[#5E6673]" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
