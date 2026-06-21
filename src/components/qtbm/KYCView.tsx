'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Upload,
  FileText,
  User,
  Shield,
  Camera,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

type KYCLevel = 'basic' | 'intermediate' | 'advanced';

const kycLevels: {
  id: KYCLevel;
  labelKey: string;
  descriptionKey: string;
  withdrawalLimit: string;
  featuresKeys: string[];
  requiredKeys: string[];
}[] = [
  {
    id: 'basic',
    labelKey: 'kyc.basic',
    descriptionKey: 'kyc.basicDesc',
    withdrawalLimit: '2 BTC/day',
    featuresKeys: ['kyc.featSpotTrading', 'kyc.featP2PTrading', 'kyc.featBasicDeposits'],
    requiredKeys: ['kyc.reqEmail', 'kyc.reqPhone'],
  },
  {
    id: 'intermediate',
    labelKey: 'kyc.intermediate',
    descriptionKey: 'kyc.intermediateDesc',
    withdrawalLimit: '100 BTC/day',
    featuresKeys: ['kyc.featAllBasic', 'kyc.featFuturesTrading', 'kyc.featEarnProducts', 'kyc.featHigherLimits'],
    requiredKeys: ['kyc.reqGovId', 'kyc.reqSelfie', 'kyc.reqAddressProof'],
  },
  {
    id: 'advanced',
    labelKey: 'kyc.advanced',
    descriptionKey: 'kyc.advancedDesc',
    withdrawalLimit: 'kyc.unlimited',
    featuresKeys: ['kyc.featAllIntermediate', 'kyc.featInstitutional', 'kyc.featApiAccess', 'kyc.featUnlimitedWithdrawals'],
    requiredKeys: ['kyc.reqProofIncome', 'kyc.reqSourceFunds', 'kyc.reqAdditionalDocs'],
  },
];

const verificationSteps = [
  { id: 1, labelKey: 'kyc.personalInfo', status: 'completed', icon: User },
  { id: 2, labelKey: 'kyc.documentUploadStep', status: 'current', icon: FileText },
  { id: 3, labelKey: 'kyc.selfieVerificationStep', status: 'pending', icon: Camera },
  { id: 4, labelKey: 'kyc.reviewSubmit', status: 'pending', icon: Shield },
];

export default function KYCView() {
  const { navigateTo, user } = useAppStore();
  const { t } = useTranslation();
  const { firebaseUser } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<KYCLevel>('intermediate');
  const [uploadState, setUploadState] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const currentLevelIndex = kycLevels.findIndex((l) => l.id === selectedLevel);
  const completedSteps = verificationSteps.filter((s) => s.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  // Real file upload to Firebase Storage + Firestore KYC document
  const handleFileUpload = async (field: string, file: File) => {
    if (!firebaseUser) {
      toast.error('Authentication required');
      return;
    }
    setUploading(field);
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { firestore } = await import('@/lib/firestore');

      // Upload to Firebase Storage: /users/{uid}/kyc/{field}
      const storageRef = ref(storage, `users/${firebaseUser.uid}/kyc/${field}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata to Firestore KYC document
      await setDoc(doc(firestore, 'kyc', firebaseUser.uid), {
        uid: firebaseUser.uid,
        [field]: {
          url: downloadURL,
          fileName: file.name,
          uploadedAt: serverTimestamp(),
        },
        status: 'pending',
        level: selectedLevel,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setUploadState((prev) => ({ ...prev, [field]: 'uploaded' }));
      toast.success(`${field} uploaded successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(null);
    }
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
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('kyc.verifyTitle')}</h1>
            <p className="text-xs text-muted-foreground">{t('kyc.verifySubtitle')}</p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="bg-gradient-to-r from-primary/10 to-card border-primary/20 border-glow-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('kyc.currentStatus')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {user.kycStatus === 'verified' ? (
                    <CheckCircle2 className="h-4 w-4 text-success check-pop-animate" />
                  ) : user.kycStatus === 'pending' ? (
                    <Clock className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive warning-animate" />
                  )}
                  <span className={`text-sm font-semibold ${
                    user.kycStatus === 'verified' ? 'text-success neon-glow-green' : 'text-foreground'
                  }`}>
                    {user.kycStatus === 'verified'
                      ? t('kyc.verified')
                      : user.kycStatus === 'pending'
                      ? t('kyc.underReview')
                      : t('kyc.notVerified')}
                  </span>
                </div>
              </div>
              <Badge
                className={`border-0 text-xs ${
                  user.kycStatus === 'verified'
                    ? 'bg-success/10 text-success'
                    : user.kycStatus === 'pending'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {t('kyc.level')} {currentLevelIndex + 1}
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-2 bg-secondary" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {completedSteps} {t('kyc.stepsCompleted')} {totalSteps}
            </p>
          </CardContent>
        </Card>

        {/* KYC Level Progress */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('kyc.verificationLevels')}
          </h3>
          <div className="space-y-2">
            {kycLevels.map((level, index) => {
              const isActive = selectedLevel === level.id;
              const isCompleted = index < currentLevelIndex;

              return (
                <Card
                  key={level.id}
                  className={`border transition-colors cursor-pointer card-hover-effect ${
                    isActive
                      ? `kyc-gradient-${level.id} border-primary/30 ${level.id === 'advanced' ? 'border-glow-green' : level.id === 'intermediate' ? 'border-glow-yellow' : ''}`
                      : 'bg-card border-border hover:border-border/80'
                  }`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </motion.div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {t(level.labelKey)}
                          </span>
                          <p className="text-[10px] text-muted-foreground">{t(level.descriptionKey)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                        {level.withdrawalLimit === 'kyc.unlimited' ? t('kyc.unlimited') : level.withdrawalLimit}
                      </Badge>
                    </div>
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] text-muted-foreground mb-1.5">{t('kyc.requirements')}</p>
                        <div className="space-y-1">
                          {level.requiredKeys.map((req) => (
                            <div key={req} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              <span className="text-xs text-muted-foreground">{t(req)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Verification Steps */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('kyc.verificationSteps')}
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {verificationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed'
                            ? 'bg-success/10'
                            : step.status === 'current'
                            ? 'bg-primary/10'
                            : 'bg-secondary'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-success step-complete-animate" />
                        ) : step.status === 'current' ? (
                          <Loader2 className="h-4 w-4 text-primary icon-spin" />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            step.status === 'completed'
                              ? 'text-success'
                              : step.status === 'current'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {t(step.labelKey)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {step.status === 'completed'
                            ? t('kyc.stepCompleted')
                            : step.status === 'current'
                            ? t('kyc.stepInProgress')
                            : t('kyc.stepPending')}
                        </p>
                      </div>
                      {step.status === 'current' && (
                        <ChevronRight className="rtl:scale-x-[-1] h-4 w-4 text-primary [dir=rtl]:rotate-180" />
                      )}
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <div className="ms-8 w-px h-4 bg-secondary relative overflow-hidden">
                        <div
                          className="kyc-progress-line absolute inset-0"
                          style={{ width: step.status === 'completed' ? '100%' : step.status === 'current' ? '50%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Document Upload Section */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('kyc.documentUpload')}
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-3 fancy-scrollbar max-h-64 overflow-y-auto">
              {[
                { id: 'id-front', labelKey: 'kyc.idFront', descKey: 'kyc.idFrontDesc' },
                { id: 'id-back', labelKey: 'kyc.idBack', descKey: 'kyc.idBackDesc' },
                { id: 'selfie', labelKey: 'kyc.selfieWithId', descKey: 'kyc.selfieDesc' },
                { id: 'address', labelKey: 'kyc.proofOfAddressDoc', descKey: 'kyc.proofDesc' },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors dashed-border-animate ${
                    uploadState[doc.id]
                      ? 'bg-success/10 border-success/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {uploadState[doc.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{t(doc.labelKey)}</p>
                      <p className="text-[10px] text-muted-foreground">{t(doc.descKey)}</p>
                    </div>
                  </div>
                  {uploadState[doc.id] ? (
                    <Badge className="bg-success/10 text-success border-0 text-[10px] flex items-center gap-1">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5 L4 7 L8 3" stroke="#0ECB81" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="draw-checkmark" />
                        </svg>
                      </motion.div>
                      {t('kyc.uploaded')}
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-primary hover:bg-primary/10 h-7 text-xs"
                      onClick={() => handleFileUpload(doc.id)}
                    >
                      <Upload className="h-3 w-3 me-1" />
                      {t('kyc.upload')}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <Button className="w-full gradient-submit-btn text-primary-foreground font-semibold h-11 ripple-effect rounded-xl">
          {t('kyc.submitForVerification')}
        </Button>
      </div>
    </ScrollArea>
  );
}
