'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockNotifications, getTimeAgo } from '@/lib/mock-data';
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Settings,
  Gift,
  Bell,
  CheckCheck,
  Clock,
  Volume2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

type FilterTab = 'all' | 'security' | 'trade' | 'system' | 'promotion';

const filterTabs: { id: FilterTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'notifications.filterAll' },
  { id: 'security', labelKey: 'notifications.filterSecurity' },
  { id: 'trade', labelKey: 'notifications.filterTrade' },
  { id: 'system', labelKey: 'notifications.filterSystem' },
  { id: 'promotion', labelKey: 'notifications.filterPromo' },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; stripeClass: string }> = {
  security: { icon: Shield, color: 'text-destructive', bgColor: 'bg-destructive/10', stripeClass: 'notif-stripe-security' },
  trade: { icon: TrendingUp, color: 'text-success', bgColor: 'bg-success/10', stripeClass: 'notif-stripe-trade' },
  deposit: { icon: ArrowDownRight, color: 'text-primary', bgColor: 'bg-primary/10', stripeClass: 'notif-stripe-deposit' },
  withdrawal: { icon: ArrowUpRight, color: 'text-info', bgColor: 'bg-info/10', stripeClass: 'notif-stripe-withdrawal' },
  system: { icon: Settings, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground/10', stripeClass: 'notif-stripe-system' },
  promotion: { icon: Gift, color: 'text-purple', bgColor: 'bg-purple/10', stripeClass: 'notif-stripe-promotion' },
};

export default function NotificationsView() {
  const { navigateTo, notifications, markAsRead, setNotifications, unreadCount } = useAppStore();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Use store notifications if loaded, otherwise fall back to mock
  const allNotifications = notifications.length > 0 ? notifications : mockNotifications;

  const filteredNotifications = allNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'trade') return n.type === 'trade' || n.type === 'deposit' || n.type === 'withdrawal';
    return n.type === activeFilter;
  });

  const handleMarkAllRead = () => {
    allNotifications.forEach((n) => {
      if (!n.isRead) {
        markAsRead(n.id);
      }
    });
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
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
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('notifications.title')}</h1>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.allCaughtUp')}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              className="mark-all-read-btn text-xs h-8 px-3"
              onClick={handleMarkAllRead}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <CheckCheck className="h-3.5 w-3.5 me-1" />
              </motion.div>
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        {/* Filter Tabs with Sliding Underline */}
        <div className="relative flex gap-1 bg-card rounded-lg p-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`relative px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-secondary text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(tab.labelKey)}
              {activeFilter === tab.id && (
                <motion.div
                  layoutId="notif-tab-underline"
                  className="absolute bottom-0 start-1 end-1 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {tab.id === 'all' && unreadCount > 0 && (
                <span className="ms-1 text-[10px] bg-primary text-primary-foreground px-1 rounded-full font-bold pulse-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-1 fancy-scrollbar max-h-[60dvh] overflow-y-auto">
          {filteredNotifications.filter(n => !dismissedIds.has(n.id)).length === 0 ? (
            <Card className="bg-card border-border rounded-xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-3 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#0ECB81" strokeWidth="2" className="draw-checkmark" style={{ strokeDasharray: 88, strokeDashoffset: 0, animation: 'drawCheck 0.8s ease-out forwards' }} />
                    <path d="M10 16 L14 20 L22 12" stroke="#0ECB81" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="draw-checkmark" />
                  </svg>
                </motion.div>
                <p className="text-sm text-success font-semibold">{t('notifications.allCaughtUpTitle')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeFilter !== 'all' ? t('notifications.noNotificationsCategory') : t('notifications.noUnreadNotifications')}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.filter(n => !dismissedIds.has(n.id)).map((notification, index) => {
              const config = typeConfig[notification.type] || typeConfig.system;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100, maxHeight: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`relative w-full rounded-lg transition-all hover:bg-card card-hover-effect ${
                    !notification.isRead ? `bg-card/80 ${config.stripeClass}` : ''
                  }`}
                >
                  <button
                    onClick={() => handleNotificationClick(notification.id)}
                    className="w-full text-start p-4"
                  >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${config.bgColor} flex items-center justify-center shrink-0 mt-0.5 ${
                        !notification.isRead ? 'notif-dot-pulse' : ''
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 pulse-badge" />
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 px-1.5 border-0 ${config.bgColor} ${config.color}`}
                        >
                          {t(`notifications.type${notification.type.charAt(0).toUpperCase()}${notification.type.slice(1)}`)}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDismiss(notification.id); }}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Settings Link */}
        <Card className="bg-card/50 border-border cursor-pointer hover:bg-card transition-colors"
          onClick={() => navigateTo('settings')}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('notifications.notificationPreferences')}</span>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
