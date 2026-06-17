'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  { key: 'whatIsBitcoin', label: 'What is Bitcoin?' },
  { key: 'howToTrade', label: 'How to trade?' },
  { key: 'securityTips', label: 'Security tips' },
  { key: 'whatIsDeFi', label: 'What is DeFi?' },
  { key: 'howToEarn', label: 'How to earn?' },
  { key: 'feesExplained', label: 'Fees explained' },
];

const SYSTEM_CONTEXT = `You are QTBM AI, a helpful assistant for the QTBM BANK crypto exchange platform. You help users with:
- Trading questions (spot, margin, futures)
- Platform features (Earn, P2P, Launchpad, Staking, Swap)
- Security best practices (2FA, KYC, wallet safety)
- Crypto education (Bitcoin, Ethereum, DeFi, blockchain basics)
- Account management (deposits, withdrawals, transfers)
- Fee structures and trading pairs
- Referral program details

Keep responses concise and helpful. When discussing trading, always include risk warnings. QTBM BANK supports 200+ trading pairs with spot, margin (3x-5x), and futures (up to 125x) trading. The platform also offers Earn products with up to 12% APR, P2P trading, and a Launchpad for new token launches.`;

export default function AIChatView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('aiChat.welcomeMessage'),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.concat(userMsg).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message || t('aiChat.defaultResponse'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('aiChat.errorMessage'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t('aiChat.welcomeMessage'),
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#2B3139] bg-[#0B0E11]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#0B0E11]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#EAECEF]">{t('aiChat.title')}</h1>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse" />
                <span className="text-[10px] text-[#0ECB81]">{t('aiChat.online')}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#848E9C] hover:text-[#F6465D] hover:bg-[#F6465D]/10 h-8 w-8"
          onClick={clearChat}
          title={t('aiChat.clearChat')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/60 flex items-center justify-center mt-1">
                  <Bot className="h-3.5 w-3.5 text-[#0B0E11]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[#F0B90B] text-[#0B0E11] rounded-br-md'
                    : 'bg-[#1E2329] border border-[#2B3139]/60 text-[#EAECEF] rounded-bl-md glass-card'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.role === 'user' ? 'text-[#0B0E11]/50' : 'text-[#5E6673]'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#2B3139] flex items-center justify-center mt-1">
                  <User className="h-3.5 w-3.5 text-[#848E9C]" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/60 flex items-center justify-center mt-1">
              <Bot className="h-3.5 w-3.5 text-[#0B0E11]" />
            </div>
            <div className="bg-[#1E2329] border border-[#2B3139]/60 rounded-2xl rounded-bl-md px-4 py-3 glass-card">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F0B90B] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#F0B90B] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#F0B90B] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Questions - show only when few messages */}
        {messages.length <= 2 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2"
          >
            <p className="text-[10px] text-[#5E6673] uppercase tracking-wider mb-2 font-semibold">
              {t('aiChat.quickQuestions')}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleQuickQuestion(q.label)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#1E2329] border border-[#2B3139] text-[#848E9C] hover:text-[#F0B90B] hover:border-[#F0B90B]/30 transition-all duration-200 hover:bg-[#2B3139]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-[#2B3139] bg-[#0B0E11]/80 backdrop-blur-sm p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('aiChat.placeholder')}
              disabled={isLoading}
              className="bg-[#1E2329] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-10 text-sm pr-10 focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-10 w-10 p-0 rounded-xl shadow-md shadow-[#F0B90B]/20 transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-[9px] text-[#3E444D] mt-1.5 text-center">
          {t('aiChat.disclaimer')}
        </p>
      </div>
    </div>
  );
}
