'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Heart, Share2, Send, Users, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type FeedTab = 'trending' | 'latest' | 'following';

const feedPosts = [
  {
    id: 1,
    username: '@CryptoTrader',
    followers: '2.3K',
    initial: 'C',
    color: '#F0B90B',
    time: '2h ago',
    timeAr: 'قبل ساعتين',
    text: 'BTC looking strong above $67K support. Expecting a push to $70K this week.',
    textAr: 'البيتكوين يبدو قوياً فوق دعم 67 ألف دولار. أتوقع صعوداً نحو 70 ألف هذا الأسبوع.',
    tag: 'BTC',
    likes: 45,
    comments: 12,
  },
  {
    id: 2,
    username: '@EthWhale',
    followers: '5.1K',
    initial: 'E',
    color: '#627EEA',
    time: '4h ago',
    timeAr: 'قبل ٤ ساعات',
    text: 'Just closed my ETH long at +15%. Taking profits here, will re-enter on a dip.',
    textAr: 'أغلقت للتو مركز إيثيريوم الطويل عند +15٪. جني أرباح هنا، سأعيد الدخول عند الانخفاض.',
    tag: 'ETH',
    likes: 89,
    comments: 23,
  },
  {
    id: 3,
    username: '@SolanaFan',
    followers: '890',
    initial: 'S',
    color: '#0ECB81',
    time: '6h ago',
    timeAr: 'قبل ٦ ساعات',
    text: 'SOL ecosystem is booming. Jupiter, Jito, and Marinade all showing strength.',
    textAr: 'نظام سولانا يزدهر. جوبيتر وجيتو ومارينايد جميعها تظهر قوة.',
    tag: 'SOL',
    likes: 34,
    comments: 8,
  },
  {
    id: 4,
    username: '@DerivsMaster',
    followers: '1.5K',
    initial: 'D',
    color: '#F6465D',
    time: '8h ago',
    timeAr: 'قبل ٨ ساعات',
    text: 'Funding rates turning negative on BTC shorts. Could see a short squeeze soon.',
    textAr: 'أسعار التمويل تنعكس سالبة على مراكز البيتكوين القصيرة. قد نشهد انضغاطاً قريباً.',
    tag: 'BTC',
    likes: 67,
    comments: 19,
  },
  {
    id: 5,
    username: '@QTBM_Official',
    followers: '45K',
    initial: 'Q',
    color: '#F0B90B',
    time: '12h ago',
    timeAr: 'قبل ١٢ ساعة',
    text: 'New QTBM listing announcement coming this week! Stay tuned.',
    textAr: 'إعلان إدراج جديد لـ QTBM هذا الأسبوع! ترقبوا.',
    tag: 'QTBM',
    likes: 234,
    comments: 56,
  },
];

const trendingTopics = [
  { tag: '#Bitcoin', posts: '12.3K' },
  { tag: '#Ethereum', posts: '8.7K' },
  { tag: '#Solana', posts: '5.2K' },
  { tag: '#DeFi', posts: '3.8K' },
  { tag: '#NFTs', posts: '2.9K' },
];

const topTraders = [
  { name: 'CryptoKing', roi: '+245%', initial: 'K', color: '#F0B90B' },
  { name: 'DeFiWhale', roi: '+189%', initial: 'W', color: '#627EEA' },
  { name: 'AltHunter', roi: '+156%', initial: 'A', color: '#0ECB81' },
];

const assetTags = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'QTBM'];

export default function SocialFeedView() {
  const { navigateTo, isRTL, language } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FeedTab>('trending');
  const [newPostText, setNewPostText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const postText = (p: typeof feedPosts[number]) => (language === 'ar' && p.textAr ? p.textAr : p.text);
  const postTime = (p: typeof feedPosts[number]) => (language === 'ar' && p.timeAr ? p.timeAr : p.time);

  const tabs: { id: FeedTab; label: string }[] = [
    { id: 'trending', label: t('socialFeed.trending') },
    { id: 'latest', label: t('socialFeed.latest') },
    { id: 'following', label: t('socialFeed.following') },
  ];

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <ScrollArea className="h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Feed Column */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
                onClick={() => navigateTo('more')}
                aria-label={t('common.back')}
              >
                <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">{t('socialFeed.title')}</h1>
              </div>
              <Badge className="bg-[#627EEA]/10 text-[#627EEA] border-0 text-[10px] font-semibold px-2">
                {t('socialFeed.community')}
              </Badge>
            </div>

            {/* Post Composer */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <textarea
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-primary focus:ring-primary/20 transition-all"
                    rows={3}
                    placeholder={t('socialFeed.placeholder')}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {assetTags.slice(0, 5).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all press-scale ${
                            selectedTags.includes(tag)
                              ? 'bg-primary text-background'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <Button className="gradient-yellow hover:opacity-90 text-background font-semibold h-8 px-4 text-xs press-scale shadow-md shadow-primary/15">
                      <Send className="h-3.5 w-3.5 me-1.5" />
                      {t('socialFeed.post')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feed Tabs */}
            <div className="relative flex gap-1 bg-card rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === tab.id ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="feedTabIndicator"
                      className="absolute inset-0 gradient-yellow rounded-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {feedPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Card className="bg-card border-border hover:border-border/80 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: post.color }}
                          >
                            {post.initial}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-foreground">{post.username}</span>
                              <span className="text-[10px] text-muted-foreground">{post.followers} {t('socialFeed.followers')}</span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">{postTime(post)}</span>
                            </div>
                            <p className="text-sm text-foreground mt-1.5 leading-relaxed">{postText(post)}</p>
                            <div className="flex items-center gap-3 mt-3">
                              {/* Asset tag */}
                              <Badge className="bg-secondary text-primary border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
                                {post.tag}
                              </Badge>
                              <div className="flex-1" />
                              {/* Like */}
                              <button
                                onClick={() => toggleLike(post.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors h-9 px-2 -mx-1 rounded-md hover:bg-destructive/10"
                                aria-label={t('socialFeed.like')}
                              >
                                <Heart className={`h-3.5 w-3.5 ${likedPosts.has(post.id) ? 'fill-destructive text-destructive' : ''}`} />
                                <span className={`text-[10px] ${likedPosts.has(post.id) ? 'text-destructive' : ''}`}>
                                  {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                                </span>
                              </button>
                              {/* Comment */}
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-success transition-colors h-9 px-2 -mx-1 rounded-md hover:bg-success/10" aria-label={t('socialFeed.comment')}>
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span className="text-[10px]">{post.comments}</span>
                              </button>
                              {/* Share */}
                              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors h-9 w-9 -mx-1 rounded-md hover:bg-primary/10" aria-label={t('common.share')}>
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-72 space-y-4">
            {/* Trending Topics */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('socialFeed.trendingTopics')}
                </h3>
                <div className="space-y-2.5">
                  {trendingTopics.map((topic) => (
                    <div key={topic.tag} className="flex items-center justify-between">
                      <span className="text-sm text-primary font-medium">{topic.tag}</span>
                      <span className="text-[10px] text-muted-foreground">{topic.posts} {t('socialFeed.posts')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Traders */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  {t('socialFeed.topTraders')}
                </h3>
                <div className="space-y-3">
                  {topTraders.map((trader) => (
                    <div key={trader.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: trader.color }}
                        >
                          {trader.initial}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{trader.name}</p>
                          <Badge className="bg-success/10 text-success border-0 text-[10px] px-1 py-0 h-3 font-bold">
                            {trader.roi}
                          </Badge>
                        </div>
                      </div>
                      <Button className="h-9 px-3 text-[10px] bg-secondary hover:bg-secondary/80 text-foreground border-0 press-scale" aria-label={t('socialFeed.follow')}>
                        {t('socialFeed.follow')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile: Trending & Top Traders */}
        <div className="lg:hidden space-y-4 mt-6">
          {/* Trending Topics - Mobile */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('socialFeed.trendingTopics')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <div key={topic.tag} className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
                    <span className="text-xs text-primary font-medium">{topic.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{topic.posts}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Traders - Mobile */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-success" />
                {t('socialFeed.topTraders')}
              </h3>
              <div className="space-y-3">
                {topTraders.map((trader) => (
                  <div key={trader.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: trader.color }}
                      >
                        {trader.initial}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{trader.name}</p>
                        <Badge className="bg-success/10 text-success border-0 text-[10px] px-1 py-0 h-3 font-bold">
                          {trader.roi}
                        </Badge>
                      </div>
                    </div>
                    <Button className="h-9 px-3 text-[10px] bg-secondary hover:bg-secondary/80 text-foreground border-0 press-scale" aria-label={t('socialFeed.follow')}>
                      {t('socialFeed.follow')}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
