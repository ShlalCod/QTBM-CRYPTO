'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  UserPlus,
  LogIn,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { signIn, register } from '@/lib/firebase-auth';
import type { FirebaseError } from 'firebase/app';

type AuthStep = 'login' | 'register';

type PasswordLevel = 'weak' | 'medium' | 'strong';

// Password strength calculator
function getPasswordStrength(password: string): { score: number; level: PasswordLevel; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: Math.round((score / 6) * 100), level: 'weak', color: 'var(--destructive)' };
  if (score <= 4) return { score: Math.round((score / 6) * 100), level: 'medium', color: 'var(--primary)' };
  return { score: Math.round((score / 6) * 100), level: 'strong', color: '#0ECB81' };
}

// Map Firebase Auth error codes to localized user-facing messages (SEC-002).
function firebaseErrorToMessage(err: unknown, fallback: string): string {
  const code = (err as FirebaseError)?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-email': 'auth.errFirebaseInvalidEmail',
    'auth/user-disabled': 'auth.errFirebaseUserDisabled',
    'auth/user-not-found': 'auth.errFirebaseUserNotFound',
    'auth/wrong-password': 'auth.errFirebaseWrongPassword',
    'auth/invalid-credential': 'auth.errFirebaseInvalidCredentials',
    'auth/email-already-in-use': 'auth.errFirebaseEmailInUse',
    'auth/weak-password': 'auth.errFirebaseWeakPassword',
    'auth/too-many-requests': 'auth.errFirebaseTooManyRequests',
    'auth/network-request-failed': 'auth.errFirebaseNetwork',
    'auth/operation-not-allowed': 'auth.errFirebaseOperationNotAllowed',
  };
  return map[code] ? map[code] : fallback;
}

export default function AuthView() {
  const { navigateTo, setUser, currentView, language } = useAppStore();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<AuthStep>(currentView === 'register' ? 'register' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const passwordStrength = getPasswordStrength(regPassword);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!loginEmail.trim()) {
      setError(t('auth.errEnterEmailOrPhone'));
      return;
    }
    if (!loginPassword) {
      setError(t('auth.errEnterPassword'));
      return;
    }
    if (loginPassword.length < 6) {
      setError(t('auth.errPasswordMin6'));
      return;
    }

    setIsLoading(true);
    try {
      const appUser = await signIn(loginEmail.trim(), loginPassword);
      setUser({
        id: appUser.uid,
        email: appUser.email,
        name: appUser.displayName,
        isAuthenticated: true,
        twoFactorEnabled: false,
        kycStatus: 'not_started',
        role: 'user',
        status: 'registered',
      });
      navigateTo('home');
    } catch (err) {
      setError(t(firebaseErrorToMessage(err, 'auth.errLoginFailed')));
    } finally {
      setIsLoading(false);
    }
  }, [loginEmail, loginPassword, setUser, navigateTo, t]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError(t('auth.errValidEmail'));
      return;
    }
    if (regPhone && !/^\+?[\d\s-]{7,15}$/.test(regPhone)) {
      setError(t('auth.errValidPhone'));
      return;
    }
    if (regPassword.length < 8) {
      setError(t('auth.errPasswordMin8'));
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    if (!agreeTerms) {
      setError(t('auth.errMustAgreeTerms'));
      return;
    }

    setIsLoading(true);
    try {
      const appUser = await register(regEmail.trim(), regPassword, regEmail.split('@')[0]);
      setUser({
        id: appUser.uid,
        email: appUser.email,
        name: appUser.displayName,
        isAuthenticated: true,
        twoFactorEnabled: false,
        kycStatus: 'not_started',
        role: 'user',
        status: 'registered',
      });
      navigateTo('home');
    } catch (err) {
      setError(t(firebaseErrorToMessage(err, 'auth.errRegisterFailed')));
    } finally {
      setIsLoading(false);
    }
  }, [regEmail, regPhone, regPassword, regConfirmPassword, agreeTerms, setUser, navigateTo, t]);

  const goBack = useCallback(() => {
    setError('');
    navigateTo('home');
  }, [navigateTo]);

  const handleSocialClick = useCallback(() => {
    setNotice(t('auth.socialComingSoon'));
  }, [t]);

  // Floating particles for auth background
  const cryptoSymbols = ['₿', 'Ξ', '◆', '◎', '⚡', '₮', '◈', '✦'];
  const particles = React.useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      symbol: cryptoSymbols[i % cryptoSymbols.length],
      left: `${(i * 7.5) % 100}%`,
      delay: `${i * 1.8}s`,
      duration: `${12 + (i % 5) * 3}s`,
      size: 14 + (i % 3) * 4,
    })),
    []
  );

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Floating crypto particles background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className="floating-particle"
            style={{
              left: p.left,
              bottom: '-30px',
              fontSize: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={goBack}
          aria-label={t('actions.back')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('auth.backToHome')}
        </button>

        <AnimatePresence mode="wait">
          {/* ============ LOGIN FORM ============ */}
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card border-border shadow-2xl shadow-black/30">
                <CardContent className="p-6 sm:p-8">
                  {/* Animated Logo with Gradient */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30 logo-gradient-pulse"
                    >
                      <span className="text-background font-bold text-2xl">Q</span>
                    </motion.div>
                    <h1 className="text-xl font-bold gradient-text">{t('auth.loginTitle')}</h1>
                    <p className="text-xs text-muted-foreground mt-1">{t('auth.loginSubtitle')}</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}
                  {notice && (
                    <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs text-primary">{notice}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email/Phone Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.emailOrPhone')}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={t('auth.enterEmailOrPhone')}
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder={t('auth.enterPassword')}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="ps-9 pe-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          aria-label={showLoginPassword ? t('actions.close') : t('actions.search')}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me + Forgot password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">{t('auth.rememberMe')}</Label>
                      </div>
                      <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          {t('auth.loggingIn')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          {t('auth.login')}
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Social Login (coming soon — no longer mock-authenticates) */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Separator className="flex-1 bg-border" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('auth.orContinueWith')}</span>
                      <Separator className="flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border text-foreground hover:bg-secondary h-10 text-sm social-btn-hover hover-lift"
                        onClick={handleSocialClick}
                      >
                        <svg className="h-4 w-4 me-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border text-foreground hover:bg-secondary h-10 text-sm social-btn-hover hover-lift"
                        onClick={handleSocialClick}
                      >
                        <svg className="h-4 w-4 me-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        Apple
                      </Button>
                    </div>
                  </div>

                  {/* Switch to Register */}
                  <div className="mt-6 text-center toggle-slide-animate">
                    <span className="text-xs text-muted-foreground">{t('auth.dontHaveAccount')} </span>
                    <button
                      type="button"
                      onClick={() => { setStep('register'); setError(''); setNotice(''); }}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {t('auth.signUp')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============ REGISTER FORM ============ */}
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card border-border shadow-2xl shadow-black/30">
                <CardContent className="p-6 sm:p-8">
                  {/* Animated Logo with Gradient */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/30 logo-gradient-pulse"
                    >
                      <span className="text-background font-bold text-2xl">Q</span>
                    </motion.div>
                    <h1 className="text-xl font-bold gradient-text">{t('auth.registerTitle')}</h1>
                    <p className="text-xs text-muted-foreground mt-1">{t('auth.registerSubtitle')}</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.email')} <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder={t('auth.enterEmail')}
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.phoneNumber')} <span className="text-muted-foreground">{t('auth.optional')}</span></Label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.password')} <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder={t('auth.atLeast8Chars')}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="ps-9 pe-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          aria-label={showRegPassword ? t('actions.close') : t('actions.search')}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {/* Password Strength Meter */}
                      {regPassword.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`strength-meter ${
                                passwordStrength.level === 'weak'
                                  ? 'strength-meter-weak'
                                  : passwordStrength.level === 'medium'
                                  ? 'strength-meter-medium'
                                  : 'strength-meter-strong'
                              }`}
                              style={{ width: `${passwordStrength.score}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px]" style={{ color: passwordStrength.color }}>
                              {t(`auth.${passwordStrength.level}`)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{regPassword.length}{t('auth.passwordChars')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.confirmPassword')} <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.reenterPassword')}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="ps-9 pe-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          aria-label={showRegConfirmPassword ? t('actions.close') : t('actions.search')}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regConfirmPassword.length > 0 && regPassword !== regConfirmPassword && (
                        <p className="text-[10px] text-destructive mt-1">{t('auth.passwordsDoNotMatch')}</p>
                      )}
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">{t('auth.referralCode')} <span className="text-muted-foreground">{t('auth.optional')}</span></Label>
                      <div className="relative">
                        <ChevronRight className={`absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                        <Input
                          type="text"
                          placeholder={t('auth.enterReferralCode')}
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 text-sm input-focus-glow"
                        />
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                        {t('auth.iAgreeTo')}{' '}
                        <button type="button" className="text-primary hover:underline">{t('auth.termsOfService')}</button>
                        {' '}{t('auth.and')}{' '}
                        <button type="button" className="text-primary hover:underline">{t('auth.privacyPolicy')}</button>
                      </Label>
                    </div>

                    {/* Register Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !agreeTerms}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          {t('auth.creatingAccount')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          {t('auth.createAccount')}
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Switch to Login */}
                  <div className="mt-6 text-center toggle-slide-animate">
                    <span className="text-xs text-muted-foreground">{t('auth.haveAccount')} </span>
                    <button
                      type="button"
                      onClick={() => { setStep('login'); setError(''); setNotice(''); }}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {t('auth.login')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
