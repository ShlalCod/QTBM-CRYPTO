"use client";

/**
 * QTBM CRYPTO — Auth Context
 *
 * Wraps the app with Firebase Auth state. Provides:
 * - current user (null if not logged in)
 * - loading state (during initial auth check)
 * - login/register/logout functions
 * - profile subscription (real-time user profile from Firestore)
 *
 * All protected screens must check `user` — if null, redirect to login.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, signIn, register } from "@/lib/firebase-auth";
import {
  createUserProfile,
  getUserProfile,
  subscribeToUserProfile,
  type FirestoreUser,
} from "@/lib/firestore";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: FirestoreUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  signInWithEmail: async () => {},
  registerWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous profile subscription
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setFirebaseUser(user);

      if (user) {
        // Check if profile exists; if not, create it
        const existing = await getUserProfile(user.uid);
        if (!existing) {
          await createUserProfile(user.uid, {
            email: user.email ?? "",
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }

        // Subscribe to profile changes (real-time)
        unsubProfile = subscribeToUserProfile(user.uid, setProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const user = await register(email, password, displayName);
      // Profile will be auto-created by the onAuthStateChanged listener above
      // but we pass displayName for immediate use
      await createUserProfile(user.uid, {
        email: user.email ?? email,
        displayName: displayName ?? user.displayName,
        photoURL: user.photoURL,
      });
    },
    []
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isAuthenticated: !!firebaseUser && !!profile,
        signInWithEmail,
        registerWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
