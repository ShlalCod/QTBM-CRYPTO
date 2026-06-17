'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
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
  label: string;
  description: string;
  withdrawalLimit: string;
  features: string[];
  required: string[];
}[] = [
  {
    id: 'basic',
    label: 'Basic',
    description: 'Email & phone verification',
    withdrawalLimit: '2 BTC/day',
    features: ['Spot trading', 'P2P trading', 'Basic deposits'],
    required: ['Email verification', 'Phone number'],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Identity document verification',
    withdrawalLimit: '100 BTC/day',
    features: ['All Basic features', 'Futures trading', 'Earn products', 'Higher limits'],
    required: ['Government ID', 'Selfie verification', 'Address proof'],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Enhanced due diligence',
    withdrawalLimit: 'Unlimited',
    features: ['All Intermediate features', 'Institutional features', 'API access', 'Unlimited withdrawals'],
    required: ['Proof of income', 'Source of funds', 'Additional documentation'],
  },
];

const verificationSteps = [
  { id: 1, label: 'Personal Information', status: 'completed', icon: User },
  { id: 2, label: 'Document Upload', status: 'current', icon: FileText },
  { id: 3, label: 'Selfie Verification', status: 'pending', icon: Camera },
  { id: 4, label: 'Review & Submit', status: 'pending', icon: Shield },
];

export default function KYCView() {
  const { navigateTo, user } = useAppStore();
  const [selectedLevel, setSelectedLevel] = useState<KYCLevel>('intermediate');
  const [uploadState, setUploadState] = useState<Record<string, string>>({});

  const currentLevelIndex = kycLevels.findIndex((l) => l.id === selectedLevel);
  const completedSteps = verificationSteps.filter((s) => s.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  const handleFileUpload = (field: string) => {
    setUploadState((prev) => ({ ...prev, [field]: 'uploaded' }));
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#EAECEF]">KYC Verification</h1>
            <p className="text-xs text-[#848E9C]">Verify your identity to unlock full features</p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="bg-gradient-to-r from-[#F0B90B]/10 to-[#1E2329] border-[#F0B90B]/20 border-glow-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#848E9C]">Current Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {user.kycStatus === 'verified' ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0ECB81] check-pop-animate" />
                  ) : user.kycStatus === 'pending' ? (
                    <Clock className="h-4 w-4 text-[#F0B90B]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-[#F6465D] warning-animate" />
                  )}
                  <span className={`text-sm font-semibold ${
                    user.kycStatus === 'verified' ? 'text-[#0ECB81] neon-glow-green' : 'text-[#EAECEF]'
                  }`}>
                    {user.kycStatus === 'verified'
                      ? 'Verified'
                      : user.kycStatus === 'pending'
                      ? 'Under Review'
                      : 'Not Verified'}
                  </span>
                </div>
              </div>
              <Badge
                className={`border-0 text-xs ${
                  user.kycStatus === 'verified'
                    ? 'bg-[#0ECB81]/10 text-[#0ECB81]'
                    : user.kycStatus === 'pending'
                    ? 'bg-[#F0B90B]/10 text-[#F0B90B]'
                    : 'bg-[#F6465D]/10 text-[#F6465D]'
                }`}
              >
                Level {currentLevelIndex + 1}
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-2 bg-[#2B3139]" />
            <p className="text-[10px] text-[#5E6673] mt-1.5">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </CardContent>
        </Card>

        {/* KYC Level Progress */}
        <div>
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            Verification Levels
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
                      ? `kyc-gradient-${level.id} border-[#F0B90B]/30 ${level.id === 'advanced' ? 'border-glow-green' : level.id === 'intermediate' ? 'border-glow-yellow' : ''}`
                      : 'bg-[#1E2329] border-[#2B3139] hover:border-[#2B3139]/80'
                  }`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                            <CheckCircle2 className="h-5 w-5 text-[#0ECB81]" />
                          </motion.div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#F0B90B] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-[#5E6673]" />
                        )}
                        <div>
                          <span className="text-sm font-semibold text-[#EAECEF]">
                            {level.label}
                          </span>
                          <p className="text-[10px] text-[#5E6673]">{level.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-[#2B3139] text-[#848E9C]">
                        {level.withdrawalLimit}
                      </Badge>
                    </div>
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-[#2B3139]">
                        <p className="text-[10px] text-[#5E6673] mb-1.5">Requirements:</p>
                        <div className="space-y-1">
                          {level.required.map((req) => (
                            <div key={req} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-[#0ECB81]" />
                              <span className="text-xs text-[#848E9C]">{req}</span>
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
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            Verification Steps
          </h3>
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-0">
              {verificationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed'
                            ? 'bg-[#0ECB81]/10'
                            : step.status === 'current'
                            ? 'bg-[#F0B90B]/10'
                            : 'bg-[#2B3139]'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#0ECB81] step-complete-animate" />
                        ) : step.status === 'current' ? (
                          <Loader2 className="h-4 w-4 text-[#F0B90B] icon-spin" />
                        ) : (
                          <Icon className="h-4 w-4 text-[#5E6673]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            step.status === 'completed'
                              ? 'text-[#0ECB81]'
                              : step.status === 'current'
                              ? 'text-[#F0B90B]'
                              : 'text-[#5E6673]'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-[#3E444D]">
                          {step.status === 'completed'
                            ? 'Completed'
                            : step.status === 'current'
                            ? 'In progress'
                            : 'Pending'}
                        </p>
                      </div>
                      {step.status === 'current' && (
                        <ChevronRight className="h-4 w-4 text-[#F0B90B]" />
                      )}
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <div className="ml-8 w-px h-4 bg-[#2B3139] relative overflow-hidden">
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
          <h3 className="text-[10px] font-semibold text-[#5E6673] uppercase tracking-wider px-1 mb-2">
            Document Upload
          </h3>
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4 space-y-3 fancy-scrollbar max-h-64 overflow-y-auto">
              {[
                { id: 'id-front', label: 'ID Card (Front)', desc: 'Upload front of your ID' },
                { id: 'id-back', label: 'ID Card (Back)', desc: 'Upload back of your ID' },
                { id: 'selfie', label: 'Selfie with ID', desc: 'Hold your ID next to your face' },
                { id: 'address', label: 'Proof of Address', desc: 'Utility bill or bank statement' },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors dashed-border-animate ${
                    uploadState[doc.id]
                      ? 'bg-[#0ECB81]/5 border-[#0ECB81]/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {uploadState[doc.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-[#0ECB81]" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#5E6673]" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-[#EAECEF]">{doc.label}</p>
                      <p className="text-[10px] text-[#5E6673]">{doc.desc}</p>
                    </div>
                  </div>
                  {uploadState[doc.id] ? (
                    <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px] flex items-center gap-1">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5 L4 7 L8 3" stroke="#0ECB81" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="draw-checkmark" />
                        </svg>
                      </motion.div>
                      Uploaded
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#2B3139] text-[#F0B90B] hover:bg-[#F0B90B]/10 h-7 text-xs"
                      onClick={() => handleFileUpload(doc.id)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <Button className="w-full gradient-submit-btn text-[#0B0E11] font-semibold h-11 ripple-effect">
          Submit for Verification
        </Button>
      </div>
    </ScrollArea>
  );
}
