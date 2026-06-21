'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Newspaper,
  Bookmark,
  Share2,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Flame,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type NewsCategory = 'Breaking' | 'Market' | 'Regulation' | 'Tech';

interface NewsArticle {
  id: string;
  category: NewsCategory;
  title: string;
  titleAr?: string;
  excerpt: string;
  excerptAr?: string;
  source: string;
  sourceIcon: string;
  timestamp: string;
  timestampAr?: string;
  readTime: string;
  views: number;
  comments: number;
  gradient: string;
  featured?: boolean;
  summary?: string;
  bookmarked?: boolean;
}

interface TrendingTopic {
  tag: string;
  posts: number;
  coin?: string;
  priceChange?: number;
}

const mockNews: NewsArticle[] = [
  {
    id: '1',
    category: 'Breaking',
    title: 'Bitcoin Surges Past $70K as Institutional Demand Reaches Record High',
    titleAr: 'البيتكوين يتخطى 70 ألف دولار مع وصول الطلب المؤسسي ل مستوى قياسي',
    excerpt: 'Major financial institutions continue to pour billions into Bitcoin ETFs, driving the price to new all-time highs and signaling mainstream adoption.',
    excerptAr: 'تواصل المؤسسات المالية الكبرى ضخ مليارات الدولارات في صناديق البيتكوين، مما يدفع السعر إلى مستويات قياسية جديدة ويعكس التبني السائد.',
    source: 'CoinDesk',
    sourceIcon: '🔵',
    timestamp: '2h ago',
    timestampAr: 'قبل ساعتين',
    readTime: '5 min',
    views: 28400,
    comments: 342,
    gradient: 'from-primary/20 via-card to-success/10',
    featured: true,
    summary: 'Bitcoin has broken through the $70,000 resistance level for the first time, fueled by unprecedented institutional demand. BlackRock\'s IBIT ETF alone saw $2.1B in inflows this week, while Fidelity\'s FBTC recorded $1.8B. The total AUM across all spot Bitcoin ETFs now exceeds $55 billion. Analysts believe the upcoming halving event could push prices even higher as supply tightens.',
  },
  {
    id: '2',
    category: 'Market',
    title: 'Ethereum Layer 2 Solutions See 300% Growth in Daily Transactions',
    titleAr: 'حلول الطبقة الثانية للإيثيريوم تسجل نمواً 300٪ في المعاملات اليومية',
    excerpt: 'Arbitrum, Optimism, and Base are leading the charge as L2 adoption accelerates across DeFi and gaming sectors.',
    excerptAr: 'أربيترم وأوبتيميزم وبيس تتصدر القيادة مع تسارع تبني الطبقة الثانية في قطاعي DeFi والألعاب.',
    source: 'The Block',
    sourceIcon: '🟢',
    timestamp: '4h ago',
    timestampAr: 'قبل ٤ ساعات',
    readTime: '4 min',
    views: 15600,
    comments: 189,
    gradient: 'from-[#627EEA]/20 via-card to-card',
  },
  {
    id: '3',
    category: 'Regulation',
    title: 'SEC Approves New Framework for Crypto Asset Classification',
    titleAr: 'هيئة الأوراق المالية تعتمد إطاراً جديداً لتصنيف الأصول الرقمية',
    excerpt: 'The new regulatory framework provides clearer guidelines for distinguishing between securities and commodities in the crypto space.',
    excerptAr: 'يوفر الإطار التنظيمي الجديد إرشادات أوضح للتمييز بين الأوراق المالية والسلع في فضاء العملات الرقمية.',
    source: 'Bloomberg',
    sourceIcon: '🟡',
    timestamp: '6h ago',
    timestampAr: 'قبل ٦ ساعات',
    readTime: '6 min',
    views: 12300,
    comments: 267,
    gradient: 'from-destructive/20 via-card to-card',
  },
  {
    id: '4',
    category: 'Tech',
    title: 'Solana Launches Game-Changing State Compression for NFTs',
    titleAr: 'سولانا تطلق ضغط الحالة الثوري لـ NFTs',
    excerpt: 'The new compression technology reduces NFT minting costs by 100x, making large-scale NFT projects economically viable on Solana.',
    excerptAr: 'تقنية الضغط الجديدة تقلل تكاليف سك NFT بمقدار 100 مرة، مما يجعل مشاريع NFT واسعة النطاق مجدية اقتصادياً على سولانا.',
    source: 'Decrypt',
    sourceIcon: '🟣',
    timestamp: '8h ago',
    timestampAr: 'قبل ٨ ساعات',
    readTime: '3 min',
    views: 9800,
    comments: 145,
    gradient: 'from-[#9945FF]/20 via-card to-card',
  },
  {
    id: '5',
    category: 'Market',
    title: 'DeFi Total Value Locked Surpasses $200B Milestone',
    titleAr: 'إجمالي القيمة المقفلة في DeFi يتخطى حاجز 200 مليار دولار',
    excerpt: 'The DeFi ecosystem reaches a new milestone as lending protocols and DEXs see renewed interest from institutional players.',
    excerptAr: 'يبلغ نظام DeFi معلماً جديداً مع عودة اهتمام المؤسسات ببروتوكولات الإقراض والبورصات اللامركزية.',
    source: 'DeFi Pulse',
    sourceIcon: '🔵',
    timestamp: '10h ago',
    timestampAr: 'قبل ١٠ ساعات',
    readTime: '4 min',
    views: 7600,
    comments: 98,
    gradient: 'from-success/20 via-card to-card',
  },
  {
    id: '6',
    category: 'Breaking',
    title: 'Major Bank Announces Crypto Custody Services for Retail Clients',
    titleAr: 'بنك كبير يعلن خدمات حفظ العملات الرقمية للعملاء الأفراد',
    excerpt: 'One of the world\'s largest banks will offer Bitcoin and Ethereum custody directly to retail customers starting Q2.',
    excerptAr: 'سيقدم أحد أكبر بنوك العالم خدمات حفظ البيتكوين والإيثيريوم مباشرة للعملاء الأفراد بدءاً من الربع الثاني.',
    source: 'Reuters',
    sourceIcon: '🟠',
    timestamp: '12h ago',
    timestampAr: 'قبل ١٢ ساعة',
    readTime: '5 min',
    views: 34200,
    comments: 456,
    gradient: 'from-primary/20 via-card to-card',
  },
  {
    id: '7',
    category: 'Tech',
    title: 'Zero-Knowledge Proofs Enable Privacy-Preserving DeFi on Ethereum',
    titleAr: 'أدلة المعرفة الصفرية تمكن DeFi الخاص على الإيثيريوم',
    excerpt: 'New ZK-rollup technology allows private transactions without compromising on security or decentralization.',
    excerptAr: 'تقنية ZK-rollup الجديدة تسمح بمعاملات خاصة دون المساومة على الأمان أو اللامركزية.',
    source: 'CoinTelegraph',
    sourceIcon: '🔵',
    timestamp: '14h ago',
    timestampAr: 'قبل ١٤ ساعة',
    readTime: '7 min',
    views: 5400,
    comments: 76,
    gradient: 'from-[#8B5CF6]/20 via-card to-card',
  },
  {
    id: '8',
    category: 'Regulation',
    title: 'EU MiCA Regulations Take Effect: What It Means for Crypto Exchanges',
    titleAr: 'لوائح MiCA الأوروبية تدخل حيز التنفيذ: ماذا يعني ذلك للبورصات؟',
    excerpt: 'Comprehensive crypto regulations now apply across all EU member states, setting a global benchmark for crypto oversight.',
    excerptAr: 'لوائح شاملة للعملات الرقمية أصبحت سارية في جميع دول الاتحاد الأوروبي، مما يضع معياراً عالمياً للرقابة.',
    source: 'Financial Times',
    sourceIcon: '🟤',
    timestamp: '16h ago',
    timestampAr: 'قبل ١٦ ساعة',
    readTime: '8 min',
    views: 8900,
    comments: 234,
    gradient: 'from-destructive/20 via-card to-card',
  },
  {
    id: '9',
    category: 'Market',
    title: 'Memecoin Market Cap Reaches $80B as Retail Traders Return',
    titleAr: 'القيمة السوقية للعملات الميمية تبلغ 80 مليار دولار مع عودة المتداولين الأفراد',
    excerpt: 'Dogecoin, Shiba Inu, and newer entrants like PEPE and WIF drive a memecoin renaissance that has divided the crypto community.',
    excerptAr: 'دوجكوين وشيبا إينو ووافدون جدد مثل PEPE و WIF تقود نهضة العملات الميمية التي شقّت مجتمع العملات الرقمية.',
    source: 'CoinDesk',
    sourceIcon: '🔵',
    timestamp: '18h ago',
    timestampAr: 'قبل ١٨ ساعة',
    readTime: '4 min',
    views: 19800,
    comments: 567,
    gradient: 'from-primary/20 via-card to-card',
  },
  {
    id: '10',
    category: 'Tech',
    title: 'Cardano Completes Chang Hard Fork, Enables On-Chain Governance',
    titleAr: 'كاردانو تكمل هارد فورك تشانج وتفعّل الحوكمة على السلسلة',
    excerpt: 'The Chang upgrade marks Cardano\'s transition to a fully decentralized governance model with on-chain voting capabilities.',
    excerptAr: 'يحدّث تشانج انتقال كاردانو إلى نموذج حوكمة لامركزي بالكامل مع إمكانيات التصويت على السلسلة.',
    source: 'Decrypt',
    sourceIcon: '🟣',
    timestamp: '20h ago',
    timestampAr: 'قبل ٢٠ ساعة',
    readTime: '5 min',
    views: 6200,
    comments: 112,
    gradient: 'from-success/20 via-card to-card',
  },
];

const mockTrendingTopics: TrendingTopic[] = [
  { tag: '#Bitcoin', posts: 45200, coin: 'BTC', priceChange: 3.45 },
  { tag: '#Ethereum', posts: 32800, coin: 'ETH', priceChange: 2.12 },
  { tag: '#AltSeason', posts: 21500 },
  { tag: '#DeFi', posts: 18700 },
  { tag: '#Memecoins', posts: 15400, coin: 'DOGE', priceChange: 8.76 },
];

const newsCategoryStripes: Record<NewsCategory, string> = {
  Breaking: 'border-s-[3px] border-s-destructive',
  Market: 'border-s-[3px] border-s-[#0ECB81]',
  Regulation: 'border-s-[3px] border-s-muted-foreground',
  Tech: 'border-s-[3px] border-s-[#627EEA]',
};

const categoryColors: Record<NewsCategory, string> = {
  Breaking: 'bg-destructive/10 text-destructive',
  Market: 'bg-success/10 text-success',
  Regulation: 'bg-primary/10 text-primary',
  Tech: 'bg-[#627EEA]/10 text-[#627EEA]',
};

function FearGreedGauge({ value }: { value: number }) {
  const { t } = useTranslation();
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const angle = ((animatedValue / 100) * 180) - 90;
  const radians = (angle * Math.PI) / 180;
  const needleLength = 70;
  const cx = 100;
  const cy = 90;
  const nx = cx + needleLength * Math.cos(radians);
  const ny = cy + needleLength * Math.sin(radians);

  const getLabel = (v: number) => {
    if (v <= 20) return t('newsFeed.extremeFear');
    if (v <= 40) return t('newsFeed.fear');
    if (v <= 60) return t('newsFeed.neutral');
    if (v <= 80) return t('newsFeed.greed');
    return t('newsFeed.extremeGreed');
  };

  const getColor = (v: number) => {
    if (v <= 20) return '#F6465D';
    if (v <= 40) return '#F08040';
    if (v <= 60) return '#F0B90B';
    if (v <= 80) return '#0ECB81';
    return '#0ECB81';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Background arc */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="#2B3139"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Gradient arc segments */}
        <path
          d="M 20 90 A 80 80 0 0 1 60 25"
          fill="none"
          stroke="#F6465D"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 60 25 A 80 80 0 0 1 100 10"
          fill="none"
          stroke="#F08040"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 100 10 A 80 80 0 0 1 140 25"
          fill="none"
          stroke="#F0B90B"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 140 25 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="#0ECB81"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={getColor(animatedValue)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Center circle */}
        <circle cx={cx} cy={cy} r="6" fill={getColor(animatedValue)} opacity="0.8" />
        <circle cx={cx} cy={cy} r="3" fill="#0B0E11" />
      </svg>
      <div className="text-center -mt-2">
        <motion.p
          className="text-3xl font-bold"
          style={{ color: getColor(animatedValue) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {animatedValue}
        </motion.p>
        <p className="text-xs font-medium" style={{ color: getColor(animatedValue) }}>
          {getLabel(animatedValue)}
        </p>
      </div>
    </div>
  );
}

export default function NewsFeedView() {
  const { goBack, isRTL, language } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'latest' | 'trending' | 'analysis'>('latest');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [sentimentValue] = useState(72);

  const articleTitle = (a: NewsArticle) => (language === 'ar' && a.titleAr ? a.titleAr : a.title);
  const articleExcerpt = (a: NewsArticle) => (language === 'ar' && a.excerptAr ? a.excerptAr : a.excerpt);
  const articleTime = (a: NewsArticle) => (language === 'ar' && a.timestampAr ? a.timestampAr : a.timestamp);
  const categoryLabel = (c: NewsCategory) =>
    c === 'Breaking' ? t('newsFeed.catBreaking')
    : c === 'Market' ? t('newsFeed.catMarket')
    : c === 'Regulation' ? t('newsFeed.catRegulation')
    : t('newsFeed.catTech');

  const toggleBookmark = (id: string) => {
    setBookmarkedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <ScrollArea className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Breaking News Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3 overflow-hidden"
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">{t('newsFeed.breaking')}</span>
          </div>
          <div className="overflow-hidden flex-1" dir="ltr">
            <motion.p
              className="text-xs text-foreground whitespace-nowrap"
              animate={{ x: isRTL ? ['0%', '50%'] : ['0%', '-50%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            >
              {t('newsFeed.breakingText')} • {t('newsFeed.breakingText')}
            </motion.p>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{t('newsFeed.title')}</h1>
          </div>
        </div>

        {/* Market Sentiment Widget */}
        <Card className="bg-card/80 backdrop-blur border-border mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">{t('newsFeed.marketSentiment')}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-[10px] text-success">+5 (24h)</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <FearGreedGauge value={sentimentValue} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-4">
              <span>{t('newsFeed.extremeFear')}</span>
              <span>{t('newsFeed.neutral')}</span>
              <span>{t('newsFeed.extremeGreed')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tab Selector */}
        <div className="flex bg-card rounded-lg p-1 mb-4">
          {([
            { id: 'latest' as const, label: t('newsFeed.latest') },
            { id: 'trending' as const, label: t('newsFeed.trending') },
            { id: 'analysis' as const, label: t('newsFeed.analysis') },
          ]).map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {(activeTab === 'latest' || activeTab === 'analysis') && (
              <div>
                {/* Featured News - only show in latest tab */}
                {activeTab === 'latest' && mockNews.filter(n => n.featured).map(article => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-card/80 backdrop-blur border-border mb-4 overflow-hidden news-featured-overlay">
                      <div className={`h-32 bg-gradient-to-r ${article.gradient} relative`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Newspaper className="h-12 w-12 text-white/10" />
                        </div>
                        <div className="absolute top-3 start-3 flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${categoryColors[article.category]}`}>
                            {categoryLabel(article.category)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                            {t('newsFeed.featuredLabel')}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h2 className="text-base font-bold text-foreground mb-2 leading-tight">{articleTitle(article)}</h2>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{articleExcerpt(article)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{article.sourceIcon}</span>
                            <span className="text-[11px] text-muted-foreground">{article.source}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground animate-fade-scale">{articleTime(article)}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">{article.readTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(article.id)}
                              className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10 h-9 w-9 flex items-center justify-center"
                              aria-label={t('common.bookmark')}
                            >
                              <Bookmark className={`h-4 w-4 transition-transform ${bookmarkedArticles.has(article.id) ? 'fill-primary text-primary bookmark-fill-anim' : ''}`} />
                            </button>
                            <button className="p-1.5 text-muted-foreground hover:text-success transition-all hover:-translate-y-0.5 rounded-md hover:bg-success/10 h-9 w-9 flex items-center justify-center" aria-label={t('common.share')}>
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* News Feed List */}
                <div className="space-y-3">
                  {(activeTab === 'analysis'
                    ? mockNews.filter(n => n.category === 'Market' || n.category === 'Tech')
                    : mockNews.filter(n => !n.featured)
                  ).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className={`bg-card/80 backdrop-blur border-border ${newsCategoryStripes[article.category] || ''}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${article.gradient} flex items-center justify-center shrink-0`}>
                              <Newspaper className="h-6 w-6 text-white/15" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryColors[article.category]}`}>
                                  {categoryLabel(article.category)}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
                                {articleTitle(article)}
                              </h3>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px]">{article.sourceIcon}</span>
                                <span className="text-[10px] text-muted-foreground">{article.source}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">{articleTime(article)}</span>
                              </div>
                              {/* Stats */}
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{formatViews(article.views)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{article.comments}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable summary */}
                          {article.summary && (
                            <AnimatePresence>
                              {expandedArticle === article.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <Separator className="bg-secondary my-3" />
                                  <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <button
                              onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                            >
                              {expandedArticle === article.id ? (
                                <> <ChevronUp className="h-3 w-3" /> {t('newsFeed.showLess')}</>
                              ) : (
                                <> <ChevronDown className="h-3 w-3" /> {t('newsFeed.readMore')}</>
                              )}
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleBookmark(article.id)}
                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10 h-9 w-9 flex items-center justify-center"
                                aria-label={t('common.bookmark')}
                              >
                                <Bookmark className={`h-3.5 w-3.5 transition-transform ${bookmarkedArticles.has(article.id) ? 'fill-primary text-primary bookmark-fill-anim' : ''}`} />
                              </button>
                              <button className="p-1.5 text-muted-foreground hover:text-success transition-all hover:-translate-y-0.5 rounded-md hover:bg-success/10 h-9 w-9 flex items-center justify-center" aria-label={t('common.share')}>
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trending' && (
              <div>
                {/* Trending Topics */}
                <Card className="bg-card/80 backdrop-blur border-border mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="h-4 w-4 text-destructive" />
                      <h3 className="text-sm font-semibold text-foreground">{t('newsFeed.trendingTopics')}</h3>
                    </div>
                    <div className="space-y-2">
                      {mockTrendingTopics.map((topic, index) => (
                        <motion.div
                          key={topic.tag}
                          initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background/40 hover:bg-secondary/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                              <Hash className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{topic.tag}</p>
                              <p className="text-[10px] text-muted-foreground">{formatViews(topic.posts)} {t('newsFeed.posts')}</p>
                            </div>
                          </div>
                          {topic.coin && topic.priceChange !== undefined && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                                {topic.coin}
                              </Badge>
                              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                                topic.priceChange >= 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                {topic.priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {topic.priceChange >= 0 ? '+' : ''}{topic.priceChange}%
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending news (same list but sorted by views) */}
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">{t('newsFeed.trendingNews')}</h3>
                <div className="space-y-3">
                  {[...mockNews].sort((a, b) => b.views - a.views).slice(0, 5).map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`bg-card/80 backdrop-blur border-border ${newsCategoryStripes[article.category] || ''}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${article.gradient} flex items-center justify-center shrink-0`}>
                              <Newspaper className="h-6 w-6 text-white/15" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${categoryColors[article.category]}`}>
                                  {categoryLabel(article.category)}
                                </span>
                                <div className="flex items-center gap-1 ms-auto">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{formatViews(article.views)}</span>
                                </div>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{articleTitle(article)}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px]">{article.sourceIcon}</span>
                                <span className="text-[10px] text-muted-foreground">{article.source}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">{articleTime(article)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
