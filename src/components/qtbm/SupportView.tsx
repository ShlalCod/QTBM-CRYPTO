'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockFAQs, mockSupportTickets, getTimeAgo } from '@/lib/mock-data';
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Search,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { icon: React.ElementType; color: string; labelKey: string }> = {
  open: { icon: AlertCircle, color: 'text-primary', labelKey: 'support.statusOpen' },
  in_progress: { icon: Loader2, color: 'text-primary', labelKey: 'support.statusInProgress' },
  resolved: { icon: CheckCircle2, color: 'text-success', labelKey: 'support.statusResolved' },
  closed: { icon: CheckCircle2, color: 'text-muted-foreground', labelKey: 'support.statusClosed' },
};

export default function SupportView() {
  const { navigateTo } = useAppStore();
  const { t } = useTranslation();
  const [searchFAQ, setSearchFAQ] = useState('');
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketStep, setTicketStep] = useState(1); // 1=Category, 2=Details, 3=Submit
  const [chatOpen, setChatOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFAQs = mockFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchFAQ.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchFAQ.toLowerCase())
  );

  const faqCategories = [...new Set(mockFAQs.map((f) => f.category))];

  const handleCreateTicket = () => {
    setCreateTicketOpen(false);
    setTicketSubject('');
    setTicketCategory('');
    setTicketMessage('');
    setTicketStep(1);
  };

  const canAdvanceStep = () => {
    if (ticketStep === 1) return !!ticketCategory;
    if (ticketStep === 2) return !!ticketSubject && !!ticketMessage;
    return true;
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-5 max-w-4xl mx-auto">
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
              <h1 className="text-lg font-bold text-foreground">{t('support.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('support.subtitle')}</p>
            </div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
            onClick={() => setCreateTicketOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 me-1" />
            {t('support.newTicket')}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="bg-card border-border hover:border-primary/20 cursor-pointer transition-colors rounded-xl"
            onClick={() => setCreateTicketOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t('support.createTicket')}</p>
                <p className="text-[10px] text-muted-foreground">{t('support.getPersonalizedHelp')}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border hover:border-success/20 cursor-pointer transition-colors rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t('support.liveChat')}</p>
                <p className="text-[10px] text-muted-foreground">{t('support.chatWithAgent')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('support.faqTitle')}</h3>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('support.searchFaqs')}
              value={searchFAQ}
              onChange={(e) => setSearchFAQ(e.target.value)}
              className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus:border-primary"
            />
          </div>

          {/* FAQ Accordion with Animations */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border-b border-border last:border-0"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-4 py-3 hover:bg-secondary/50 text-sm text-foreground text-start flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      <span>{faq.question}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className={`h-4 w-4 text-muted-foreground faq-chevron ${expandedFaq === faq.id ? 'faq-chevron-open' : ''}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {filteredFAQs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">{t('support.noFaqs')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Tickets */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('support.myTickets')}</h3>
          <div className="space-y-2">
            {mockSupportTickets.map((ticket) => {
              const config = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = config.icon;

              return (
                <Card
                  key={ticket.id}
                  className="bg-card border-border hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            ticket.status === 'open' || ticket.status === 'in_progress'
                              ? 'bg-primary/10'
                              : 'bg-success/10'
                          } flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          <FileText
                            className={`h-4 w-4 ${
                              ticket.status === 'open' || ticket.status === 'in_progress'
                                ? 'text-primary'
                                : 'text-success'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {ticket.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-4 px-1.5 border-0 ${
                                ticket.status === 'open'
                                  ? 'bg-primary/10 text-primary'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-primary/10 text-primary'
                                  : ticket.status === 'resolved'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-muted-foreground/10 text-muted-foreground'
                              }`}
                            >
                              <StatusIcon className={`h-2.5 w-2.5 me-0.5 ${config.color}`} />
                              {t(config.labelKey)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {t('support.updated')} {getTimeAgo(ticket.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-border text-muted-foreground shrink-0"
                      >
                        #{ticket.id}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Create Ticket Dialog with Step Progress */}
        <Dialog open={createTicketOpen} onOpenChange={(open) => { setCreateTicketOpen(open); if (!open) setTicketStep(1); }}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('support.createSupportTicket')}</DialogTitle>
            </DialogHeader>

            {/* Step Progress Indicator */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    s < ticketStep ? 'bg-success' : s === ticketStep ? 'bg-primary' : 'bg-secondary'
                  }`} />
                  {s < 3 && (
                    <div className="w-2 h-0.5 bg-secondary rounded" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
              <span className={ticketStep >= 1 ? 'text-primary' : ''}>{t('support.stepCategory')}</span>
              <span className={ticketStep >= 2 ? 'text-primary' : ''}>{t('support.stepDetails')}</span>
              <span className={ticketStep >= 3 ? 'text-primary' : ''}>{t('support.stepSubmit')}</span>
            </div>

            <AnimatePresence mode="wait">
              {ticketStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 py-2">
                  <label className="text-xs text-muted-foreground">{t('support.category')}</label>
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger className="bg-secondary border-border text-foreground h-10 text-sm">
                      <SelectValue placeholder={t('support.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      {[
                        { value: 'deposit', label: t('support.catDeposit') },
                        { value: 'withdrawal', label: t('support.catWithdrawal') },
                        { value: 'trading', label: t('support.catTrading') },
                        { value: 'verification', label: t('support.catVerification') },
                        { value: 'security', label: t('support.catSecurity') },
                        { value: 'p2p', label: t('support.catP2P') },
                        { value: 'earn', label: t('support.catEarn') },
                        { value: 'other', label: t('support.catOther') },
                      ].map(
                        (cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="text-foreground text-sm">
                            {cat.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
              {ticketStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">{t('support.subject')}</label>
                    <Input
                      placeholder={t('support.subjectPlaceholder')}
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="bg-secondary border-border text-foreground h-10 text-sm input-focus-glow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">{t('support.message')}</label>
                    <Textarea
                      placeholder={t('support.messagePlaceholder')}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-[120px] text-sm resize-none input-focus-glow"
                    />
                  </div>
                </motion.div>
              )}
              {ticketStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3 py-2">
                  <p className="text-xs text-muted-foreground mb-2">{t('support.reviewTicket')}</p>
                  <div className="bg-secondary rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.category')}</span>
                      <span className="text-foreground">{t(`support.cat${ticketCategory.charAt(0).toUpperCase()}${ticketCategory.slice(1)}`)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.subject')}</span>
                      <span className="text-foreground">{ticketSubject}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('support.message')}</span>
                      <p className="text-muted-foreground mt-1 line-clamp-3">{ticketMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter>
              <div className="w-full flex gap-2">
                {ticketStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setTicketStep(ticketStep - 1)}
                    className="flex-1 border-border text-muted-foreground hover:text-foreground h-11"
                  >
                    {t('support.back')}
                  </Button>
                )}
                {ticketStep < 3 ? (
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                    onClick={() => canAdvanceStep() && setTicketStep(ticketStep + 1)}
                    disabled={!canAdvanceStep()}
                  >
                    {t('support.next')}
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gradient-submit-btn text-primary-foreground font-semibold h-11"
                    onClick={handleCreateTicket}
                  >
                    {t('support.submitTicket')}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floating Chat Button */}
        <div className="fixed bottom-24 lg:bottom-8 end-4 z-50">
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-16 end-0 w-72 bg-card border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-primary/80 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                    <span className="text-sm font-bold text-primary-foreground">{t('support.liveSupport')}</span>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3 h-48 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-2 fancy-scrollbar">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Headphones className="h-3 w-3 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-lg rounded-tl-none p-2 text-[11px] text-muted-foreground">
                        {t('support.chatGreeting')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Input
                      placeholder={t('support.typeMessage')}
                      className="bg-secondary border-border text-foreground h-8 text-xs input-focus-glow"
                    />
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3">
                      {t('support.send')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="support-chat-btn w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground group relative"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-8 end-0 bg-card text-foreground text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t('support.help')}
            </span>
          </button>
        </div>
      </div>
    </ScrollArea>
  );
}
