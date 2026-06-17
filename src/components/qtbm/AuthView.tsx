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
  Shield,
  ArrowLeft,
  Fingerprint,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';

type AuthStep = 'login' | 'register' | '2fa';

// Password strength calculator
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: Math.round((score / 6) * 100), label: 'Weak', color: '#F6465D' };
  if (score <= 4) return { score: Math.round((score / 6) * 100), label: 'Medium', color: '#F0B90B' };
  return { score: Math.round((score / 6) * 100), label: 'Strong', color: '#0ECB81' };
}

export default function AuthView() {
  const { navigateTo, setUser, currentView } = useAppStore();

  const [step, setStep] = useState<AuthStep>(currentView === 'register' ? 'register' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  // 2FA state
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer for 2FA
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const passwordStrength = getPasswordStrength(regPassword);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password');
      return;
    }
    if (loginPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // If 2FA is enabled, go to 2FA step
      if (data.twoFactorEnabled) {
        setResendTimer(60);
        setStep('2fa');
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAuthenticated: true,
        twoFactorEnabled: data.user.twoFactorEnabled,
        kycStatus: data.user.kycStatus,
        role: data.user.role,
        status: data.user.status,
      });
      navigateTo('home');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loginEmail, loginPassword, setUser, navigateTo]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (regPhone && !/^\+?[\d\s-]{7,15}$/.test(regPhone)) {
      setError('Please enter a valid phone number');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          referralCode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAuthenticated: true,
        twoFactorEnabled: false,
        kycStatus: 'not_started',
        role: 'user',
        status: 'registered',
      });
      navigateTo('home');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [regEmail, regPhone, regPassword, regConfirmPassword, referralCode, agreeTerms, setUser, navigateTo]);

  const handle2FA = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify2fa', code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAuthenticated: true,
        twoFactorEnabled: true,
        kycStatus: data.user.kycStatus,
        role: data.user.role,
        status: data.user.status,
      });
      navigateTo('home');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, setUser, navigateTo]);

  const handleResendCode = useCallback(() => {
    setResendTimer(60);
    setError('');
  }, []);

  const goBack = useCallback(() => {
    setError('');
    navigateTo('home');
  }, [navigateTo]);

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
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#0B0E11] relative overflow-hidden">
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
          className="flex items-center gap-1 text-sm text-[#848E9C] hover:text-[#EAECEF] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
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
              <Card className="bg-[#1E2329] border-[#2B3139] shadow-2xl shadow-black/30">
                <CardContent className="p-6 sm:p-8">
                  {/* Animated Logo with Gradient */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#F0B90B]/30 logo-gradient-pulse"
                    >
                      <span className="text-[#0B0E11] font-bold text-2xl">Q</span>
                    </motion.div>
                    <h1 className="text-xl font-bold gradient-text">Log In to QTBM BANK</h1>
                    <p className="text-xs text-[#5E6673] mt-1">Welcome back! Please enter your credentials.</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-[#F6465D]/10 border border-[#F6465D]/20 rounded-lg">
                      <p className="text-xs text-[#F6465D]">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email/Phone Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Email or Phone</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type="text"
                          placeholder="Enter email or phone"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-9 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-9 pr-10 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6673] hover:text-[#848E9C] transition-colors"
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
                          className="data-[state=checked]:bg-[#F0B90B] data-[state=checked]:border-[#F0B90B]"
                        />
                        <Label htmlFor="remember" className="text-xs text-[#848E9C] cursor-pointer">Remember me</Label>
                      </div>
                      <button type="button" className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors">
                        Forgot Password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-bold h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#0B0E11] border-t-transparent rounded-full animate-spin" />
                          Logging in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Log In
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Social Login with Hover Effects */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Separator className="flex-1 bg-[#2B3139]" />
                      <span className="text-[10px] text-[#5E6673] uppercase tracking-wider">Or continue with</span>
                      <Separator className="flex-1 bg-[#2B3139]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] h-10 text-sm social-btn-hover hover-lift"
                        onClick={() => {
                          setUser({
                            id: 'social-1',
                            email: 'user@google.com',
                            name: 'Google User',
                            isAuthenticated: true,
                            twoFactorEnabled: false,
                            kycStatus: 'not_started',
                            role: 'user',
                            status: 'registered',
                          });
                          navigateTo('home');
                        }}
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                        className="border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] h-10 text-sm social-btn-hover hover-lift"
                        onClick={() => {
                          setUser({
                            id: 'social-2',
                            email: 'user@apple.com',
                            name: 'Apple User',
                            isAuthenticated: true,
                            twoFactorEnabled: false,
                            kycStatus: 'not_started',
                            role: 'user',
                            status: 'registered',
                          });
                          navigateTo('home');
                        }}
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        Apple
                      </Button>
                    </div>
                  </div>

                  {/* Switch to Register with Toggle Animation */}
                  <div className="mt-6 text-center toggle-slide-animate">
                    <span className="text-xs text-[#5E6673]">Don&apos;t have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setStep('register'); setError(''); }}
                      className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 font-medium transition-colors"
                    >
                      Sign Up
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
              <Card className="bg-[#1E2329] border-[#2B3139] shadow-2xl shadow-black/30">
                <CardContent className="p-6 sm:p-8">
                  {/* Animated Logo with Gradient */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#F0B90B]/30 logo-gradient-pulse"
                    >
                      <span className="text-[#0B0E11] font-bold text-2xl">Q</span>
                    </motion.div>
                    <h1 className="text-xl font-bold gradient-text">Create Account</h1>
                    <p className="text-xs text-[#5E6673] mt-1">Join QTBM BANK and start trading today</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-[#F6465D]/10 border border-[#F6465D]/20 rounded-lg">
                      <p className="text-xs text-[#F6465D]">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Email <span className="text-[#F6465D]">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-9 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Phone Number <span className="text-[#5E6673]">(optional)</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="pl-9 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Password <span className="text-[#F6465D]">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-9 pr-10 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6673] hover:text-[#848E9C] transition-colors"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {/* Password Strength Meter with Color Gradient */}
                      {regPassword.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          <div className="h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                            <div
                              className={`strength-meter ${
                                passwordStrength.label === 'Weak'
                                  ? 'strength-meter-weak'
                                  : passwordStrength.label === 'Medium'
                                  ? 'strength-meter-medium'
                                  : 'strength-meter-strong'
                              }`}
                              style={{ width: `${passwordStrength.score}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px]" style={{ color: passwordStrength.color }}>
                              {passwordStrength.label}
                            </span>
                            <span className="text-[10px] text-[#5E6673]">{regPassword.length}/8+ chars</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Confirm Password <span className="text-[#F6465D]">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder="Re-enter your password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="pl-9 pr-10 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6673] hover:text-[#848E9C] transition-colors"
                        >
                          {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regConfirmPassword.length > 0 && regPassword !== regConfirmPassword && (
                        <p className="text-[10px] text-[#F6465D] mt-1">Passwords do not match</p>
                      )}
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#848E9C] font-medium">Referral Code <span className="text-[#5E6673]">(optional)</span></Label>
                      <div className="relative">
                        <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6673]" />
                        <Input
                          type="text"
                          placeholder="Enter referral code"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="pl-9 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-sm input-focus-glow"
                        />
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                        className="data-[state=checked]:bg-[#F0B90B] data-[state=checked]:border-[#F0B90B] mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-[11px] text-[#848E9C] leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <button type="button" className="text-[#F0B90B] hover:underline">Terms of Service</button>
                        {' '}and{' '}
                        <button type="button" className="text-[#F0B90B] hover:underline">Privacy Policy</button>
                      </Label>
                    </div>

                    {/* Register Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !agreeTerms}
                      className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-bold h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#0B0E11] border-t-transparent rounded-full animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Switch to Login with Toggle Animation */}
                  <div className="mt-6 text-center toggle-slide-animate">
                    <span className="text-xs text-[#5E6673]">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setStep('login'); setError(''); }}
                      className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 font-medium transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============ 2FA VERIFICATION ============ */}
          {step === '2fa' && (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-[#1E2329] border-[#2B3139] shadow-2xl shadow-black/30">
                <CardContent className="p-6 sm:p-8">
                  {/* 2FA Icon with Success Animation */}
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-14 h-14 bg-[#F0B90B]/10 rounded-2xl flex items-center justify-center mb-3 logo-gradient-pulse"
                    >
                      <Fingerprint className="h-7 w-7 text-[#F0B90B]" />
                    </motion.div>
                    <h1 className="text-xl font-bold gradient-text">Two-Factor Authentication</h1>
                    <p className="text-xs text-[#5E6673] mt-1">Enter the 6-digit code from your authenticator app</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-[#F6465D]/10 border border-[#F6465D]/20 rounded-lg">
                      <p className="text-xs text-[#F6465D]">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handle2FA} className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex flex-col items-center gap-4">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                          <InputOTPSlot index={1} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                          <InputOTPSlot index={2} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                        </InputOTPGroup>
                        <InputOTPSeparator className="text-[#5E6673]" />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                          <InputOTPSlot index={4} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                          <InputOTPSlot index={5} className="w-11 h-13 bg-[#2B3139] border-[#2B3139] text-[#EAECEF] text-lg font-bold data-[active=true]:border-[#F0B90B] data-[active=true]:otp-digit-active input-focus-glow" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {/* Verify Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || otpCode.length < 6}
                      className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-bold h-11 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#0B0E11] border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Verify
                        </div>
                      )}
                    </Button>

                    {/* Resend Code */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-[#5E6673]">
                          Resend code in <span className="text-[#F0B90B] font-medium">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 font-medium transition-colors"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    {/* Back to login */}
                    <button
                      type="button"
                      onClick={() => { setStep('login'); setError(''); setOtpCode(''); }}
                      className="flex items-center gap-1 text-xs text-[#848E9C] hover:text-[#EAECEF] transition-colors mx-auto"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to Login
                    </button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
