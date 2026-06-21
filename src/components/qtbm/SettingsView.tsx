'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  User,
  Lock,
  Shield,
  Smartphone,
  Wallet,
  Bell,
  Moon,
  Sun,
  ChevronRight,
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
  const { navigateTo, user, language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
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
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions.back')}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
          >
            <ArrowLeft className="rtl:scale-x-[-1] h-5 w-5 [dir=rtl]:rotate-180" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{t('settings.title')}</h1>
        </div>

        {/* Profile Settings */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('settings.profile')}
          </h3>
          <Card className="glass-card border-border/30 profile-card-border rounded-xl">
            <CardContent className="p-0">
              {/* Name */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{t('settings.name')}</p>
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-secondary border-border text-foreground h-8 text-xs"
                          autoFocus
                        />
                        <Button size="sm" className="h-8 px-2 gradient-green text-primary-foreground text-xs" onClick={saveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('name', user.name || t('settings.placeholderName'))}
                        className="text-sm text-foreground"
                      >
                        {user.name || t('settings.notSet')} <ChevronRight className="rtl:scale-x-[-1] h-3 w-3 inline text-muted-foreground [dir=rtl]:rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Email */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('settings.email')}</p>
                    <p className="text-sm text-foreground">{user.email || t('settings.placeholderEmail')}</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-0 text-[10px]">{t('status.verified')}</Badge>
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Phone */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('settings.phone')}</p>
                    <p className="text-sm text-foreground">{t('settings.placeholderPhone')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary text-xs h-8">
                  {t('settings.change')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('settings.security')}
          </h3>
          <Card className="glass-card border-border/30 rounded-xl">
            <CardContent className="p-0">
              {/* Change Password */}
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors setting-item-hover">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">{t('settings.changePassword')}</span>
                </div>
                <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-muted-foreground [dir=rtl]:rotate-180" />
              </button>
              <Separator className="bg-border/40 mx-4" />

              {/* 2FA */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-success" />
                  <div>
                    <span className="text-sm text-foreground">{t('settings.twoFactorAuth')}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {user.twoFactorEnabled ? t('status.enabled') : t('status.disabled')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={user.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    useAppStore.getState().setUser({ twoFactorEnabled: checked })
                  }
                  className="data-[state=checked]:bg-success"
                />
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Device Management */}
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors setting-item-hover">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-foreground">{t('settings.deviceManagement')}</span>
                    <p className="text-[10px] text-muted-foreground">{t('settings.activeDevicesCount')}</p>
                  </div>
                </div>
                <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-muted-foreground [dir=rtl]:rotate-180" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('settings.preferences')}
          </h3>
          <Card className="glass-card border-border/30 rounded-xl">
            <CardContent className="p-0">
              {/* Language */}
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{t('settings.language')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      language === 'en'
                        ? 'gradient-yellow text-primary-foreground shadow-md shadow-primary/20'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
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
                        ? 'gradient-yellow text-primary-foreground shadow-md shadow-primary/20'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                    }`}
                  >
                    <span className="text-base">🇸🇦</span>
                    <span>{t('settings.arabic')}</span>
                    {language === 'ar' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {language === 'ar' && (
                  <div className="text-[10px] text-success mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                    {t('settings.rtlEnabled')}
                  </div>
                )}
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Currency */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t('settings.currency')}</span>
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24 bg-secondary/60 border-border text-foreground text-xs h-8 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-border">
                    <SelectItem value="USD" className="text-foreground text-xs">USD</SelectItem>
                    <SelectItem value="EUR" className="text-foreground text-xs">EUR</SelectItem>
                    <SelectItem value="SAR" className="text-foreground text-xs">SAR</SelectItem>
                    <SelectItem value="AED" className="text-foreground text-xs">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Appearance / Theme */}
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{t('settings.appearance')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      theme === 'dark'
                        ? 'gradient-yellow text-primary-foreground shadow-md shadow-primary/20'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
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
                        ? 'gradient-yellow text-primary-foreground shadow-md shadow-primary/20'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    <span>{t('settings.lightMode')}</span>
                    {theme === 'light' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <Separator className="bg-border/40 mx-4" />

              {/* Notifications */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t('settings.pushNotifications')}</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-success"
                />
              </div>

              {notificationsEnabled && (
                <>
                  <Separator className="bg-border/40 mx-4" />
                  <div className="px-4 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('settings.tradeUpdates')}</span>
                      <Switch
                        checked={tradeNotifications}
                        onCheckedChange={setTradeNotifications}
                        className="data-[state=checked]:bg-success scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('settings.securityAlerts')}</span>
                      <Switch
                        checked={securityNotifications}
                        onCheckedChange={setSecurityNotifications}
                        className="data-[state=checked]:bg-success scale-75"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t('settings.promotions')}</span>
                      <Switch
                        checked={promoNotifications}
                        onCheckedChange={setPromoNotifications}
                        className="data-[state=checked]:bg-success scale-75"
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
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('settings.about')}
          </h3>
          <Card className="glass-card border-border/30 rounded-xl">
            <CardContent className="p-0">
              <div className="px-4 py-3.5 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.appVersion')}</span>
                <span className="text-sm text-foreground">{t('settings.versionNumber')}</span>
              </div>
              <Separator className="bg-border/40 mx-4" />
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors setting-item-hover"
                onClick={() => navigateTo('support')}
              >
                <span className="text-sm text-foreground">{t('settings.termsOfService')}</span>
                <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-muted-foreground [dir=rtl]:rotate-180" />
              </button>
              <Separator className="bg-border/40 mx-4" />
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors setting-item-hover"
                onClick={() => navigateTo('support')}
              >
                <span className="text-sm text-foreground">{t('settings.privacyPolicy')}</span>
                <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-muted-foreground [dir=rtl]:rotate-180" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
