/**
 * Firebase Authentication Client (SEC-002, FIREBASE-001)
 *
 * Provides real Firebase Auth integration — replaces the deleted mock
 * /api/auth endpoint. All sensitive operations go through Cloud Functions.
 */
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import app from './firebase';

export const auth = getAuth(app);

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAuthenticated: boolean;
}

/**
 * Convert Firebase User to app user state.
 */
function toAppUser(user: User | null): AppUser {
  if (!user) {
    return {
      uid: '',
      email: null,
      displayName: null,
      photoURL: null,
      isAuthenticated: false,
    };
  }
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAuthenticated: true,
  };
}

/**
 * Sign in with email/password via Firebase Auth.
 */
export async function signIn(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return toAppUser(credential.user);
}

/**
 * Register a new account via Firebase Auth.
 */
export async function register(email: string, password: string, displayName?: string): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return toAppUser(credential.user);
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuth(callback: (user: AppUser) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(toAppUser(user));
  });
}

/**
 * Get the current user synchronously (may be null on first load).
 */
export function getCurrentUser(): AppUser {
  return toAppUser(auth.currentUser);
}
