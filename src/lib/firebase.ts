/**
 * Firebase initialization for QTBM CRYPTO
 *
 * Configuration is derived from the official google-services.json
 * (Firebase project: qtb-bank-crypto, package: com.qtbm.crypto).
 *
 * These values are safe to expose to the client – they identify the
 * Firebase project, not a privileged credential. Security is enforced
 * through Firebase Security Rules.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore as FirestoreClient } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, type Messaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCjsrjak2u8J0b6rfaqrB-NZmc1apI70JI",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "qtb-bank-crypto.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    "https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "qtb-bank-crypto",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "qtb-bank-crypto.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "506536686458",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:506536686458:android:cb8e1888f30ea8a1ac1cc3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase project metadata pulled directly from google-services.json
// (used by APK build scripts and admin tooling).
export const firebaseProjectInfo = {
  projectNumber: "506536686458",
  projectId: "qtb-bank-crypto",
  databaseUrl:
    "https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "qtb-bank-crypto.firebasestorage.app",
  androidAppId: "1:506536686458:android:cb8e1888f30ea8a1ac1cc3",
  androidPackageName: "com.qtbm.crypto",
  webClientId:
    "506536686458-fj9s8vm1rcc39mglv31segmup9ikprs8.apps.googleusercontent.com",
  region: "europe-west1",
};

// Singleton Firebase app – avoids re-initializing on hot reloads.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app);
export const firestoreClient: FirestoreClient = getFirestore(app);
export const functionsClient: Functions = getFunctions(app, "europe-west1");
export const storage: FirebaseStorage = getStorage(app);

// Messaging is only available in browser environments that support it.
let messagingInstance: Messaging | null = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messagingInstance = getMessaging(app);
  } catch {
    messagingInstance = null;
  }
}
export const messaging: Messaging | null = messagingInstance;

export default app;
