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
    let profilePollRef: ReturnType<typeof setInterval> | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (profilePollRef) {
        clearInterval(profilePollRef);
        profilePollRef = null;
      }

      setFirebaseUser(user);

      if (user) {
        // Load profile from cache first (instant display), then fetch from Firestore
        try {
          const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem('qtbm:user-profile') : null;
          if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              setProfile(parsed.data);
            }
          }
        } catch { /* ignore */ }

        // Check if profile exists; if not, create it
        const fetchProfile = async () => {
          try {
            let existing = await getUserProfile(user.uid);
            if (!existing) {
              await createUserProfile(user.uid, {
                email: user.email ?? "",
                displayName: user.displayName,
                photoURL: user.photoURL,
              });
              existing = await getUserProfile(user.uid);
            }
            if (existing) {
              setProfile(existing);
              // Cache profile locally
              try {
                localStorage.setItem('qtbm:user-profile', JSON.stringify({
                  data: existing,
                  timestamp: Date.now(),
                }));
              } catch { /* ignore */ }
            }
          } catch (err) {
            // Offline or permission error — keep cached profile
          }
        };
        fetchProfile();
        // Poll profile every 5 minutes (instead of continuous onSnapshot)
        profilePollRef = setInterval(fetchProfile, 5 * 60 * 1000);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (profilePollRef) clearInterval(profilePollRef);
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
