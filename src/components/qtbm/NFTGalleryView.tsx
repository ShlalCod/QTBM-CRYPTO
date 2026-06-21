'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Eye, Heart, MessageCircle, Share2, Plus, TrendingUp, Activity } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const trendingCollections = [
  { name: 'CryptoPunks', floor: '48.5 ETH', change: '+5.2%', changeColor: 'text-success', gradient: 'from-[#627EEA] to-[#3B5998]' },
  { name: 'Bored Apes', floor: '28.1 ETH', change: '-2.1%', changeColor: 'text-destructive', gradient: 'from-primary to-[#D4A00A]' },
  { name: 'Azuki', floor: '6.8 ETH', change: '+12.4%', changeColor: 'text-success', gradient: 'from-destructive to-[#C2364A]' },
  { name: 'Doodles', floor: '2.3 ETH', change: '+1.8%', changeColor: 'text-success', gradient: 'from-success to-[#09A76A]' },
];

const myNfts = [
  { name: 'QTBM Genesis #0042', collection: 'QTBM Genesis', price: '0.85 ETH', gradient: 'from-primary via-[#FFD700] to-primary' },
  { name: 'CryptoPunk #7523', collection: 'CryptoPunks', price: '48.5 ETH', gradient: 'from-[#627EEA] via-[#8B9FFF] to-[#3B5998]' },
  { name: 'Azuki #4821', collection: 'Azuki', price: '6.8 ETH', gradient: 'from-destructive via-[#FF8A9B] to-[#C2364A]' },
];

const recentActivity = [
  { buyer: '0x3f...8a2c', seller: '0x7b...1d4e', name: 'CryptoPunk #3100', price: '48.5 ETH', time: '2m ago' },
  { buyer: '0x5c...9e1f', seller: '0x2a...7b3d', name: 'BAYC #1234', price: '28.1 ETH', time: '5m ago' },
  { buyer: '0x8d...4c2a', seller: '0x1e...6f8b', name: 'Azuki #892', price: '6.2 ETH', time: '12m ago' },
  { buyer: '0x9a...3b7c', seller: '0x4f...2d9e', name: 'Doodle #4521', price: '2.1 ETH', time: '18m ago' },
  { buyer: '0x6e...5a1d', seller: '0x3c...8f2b', name: 'QTBM Genesis #0089', price: '0.6 ETH', time: '25m ago' },
];

export default function NFTGalleryView() {
  const { navigateTo, isRTL } = useAppStore();
  const { t } = useTranslation();

  return (
    <ScrollArea className="h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
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
            <Palette className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{t('nftGallery.title')}</h1>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold px-2">
            {t('common.beta')}
          </Badge>
        </div>

        {/* Featured Collection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-border bg-card hover-lift">
            <div className="relative h-48 sm:h-56">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-success/20" />
              <div className="absolute inset-0 shimmer-gradient" />
              <div className="absolute top-0 start-0 end-0 h-full flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-primary to-gold flex items-center justify-center shadow-2xl shadow-primary/20 animate-float">
                  <Palette className="h-12 w-12 sm:h-16 sm:w-16 text-background" />
                </div>
              </div>
              <div className="absolute bottom-0 start-0 end-0 bg-gradient-to-t from-card to-transparent h-24" />
            </div>
            <CardContent className="p-4 -mt-8 relative z-10">
              <h2 className="text-xl font-bold text-foreground mb-2">QTBM Genesis Collection</h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-wider">{t('nftGallery.floorPrice')}</p>
                  <p className="text-sm font-semibold text-foreground">0.5 ETH</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-wider">{t('nftGallery.items')}</p>
                  <p className="text-sm font-semibold text-foreground">10,000</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground tracking-wider">{t('nftGallery.owners')}</p>
                  <p className="text-sm font-semibold text-foreground">3,245</p>
                </div>
              </div>
              <Button className="gradient-yellow hover:opacity-90 text-background font-semibold h-10 px-6 press-scale shadow-lg shadow-primary/20">
                {t('nftGallery.explore')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Collections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('nftGallery.trendingCollections')}
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide-mobile pb-2">
            {trendingCollections.map((collection, i) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Card className="min-w-[160px] bg-card border-border hover-lift cursor-pointer">
                  <CardContent className="p-3">
                    <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${collection.gradient} mb-3 flex items-center justify-center`}>
                      <Palette className="h-8 w-8 text-white/80" />
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{collection.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{t('nftGallery.floor')}</span>
                      <span className="text-[10px] text-muted-foreground">{collection.floor}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-xs font-semibold ${collection.changeColor}`}>{collection.change}</span>
                      <span className="text-[10px] text-muted-foreground ms-1">{t('nftGallery.h24')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My NFTs */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-success" />
            {t('nftGallery.myNfts')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {myNfts.map((nft, i) => (
              <motion.div
                key={nft.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Card className="bg-card border-border overflow-hidden hover-lift cursor-pointer group">
                  <div className={`h-36 bg-gradient-to-br ${nft.gradient} flex items-center justify-center relative`}>
                    <Palette className="h-12 w-12 text-white/70 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-2 end-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/20 text-white/70 hover:text-white hover:bg-black/40 rounded-full" aria-label={t('common.bookmark')}>
                        <Heart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold text-foreground truncate">{nft.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{nft.collection}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{t('nftGallery.lastPrice')}</span>
                      <span className="text-xs font-semibold text-foreground">{nft.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mint NFT Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex justify-center"
        >
          <Button className="gradient-yellow hover:opacity-90 text-background font-bold h-12 px-8 text-base press-scale glow-pulse-yellow shadow-xl shadow-primary/25">
            <Plus className="h-5 w-5 me-2" />
            {t('nftGallery.mintNft')}
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('nftGallery.totalVolume'), value: '$1.2B' },
            { label: t('nftGallery.totalCollections'), value: '500+' },
            { label: t('nftGallery.totalNfts'), value: '100K+' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border text-center">
              <CardContent className="p-3">
                <p className="text-base font-bold text-primary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-success" />
            {t('nftGallery.recentActivity')}
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {recentActivity.map((activity, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{activity.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-success" dir="ltr">{activity.buyer}</span>
                        <span className="text-[10px] text-muted-foreground">{isRTL ? '→' : '←'}</span>
                        <span className="text-[10px] text-destructive" dir="ltr">{activity.seller}</span>
                      </div>
                    </div>
                    <div className="text-end shrink-0 ms-3">
                      <p className="text-sm font-semibold text-foreground">{activity.price}</p>
                      <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {i < recentActivity.length - 1 && <div className="border-t border-border mx-4" />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
