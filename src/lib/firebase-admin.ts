/**
 * QTBM CRYPTO — Firebase Admin SDK (server-side only)
 *
 * Used in Next.js API routes and Cloud Functions for privileged operations.
 * NEVER import this in client components — it uses the service account key.
 */

import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

let adminApp: App;

function initAdmin(): App {
  if (getApps().length) return getApp();

  // Load service account key from file (functions/serviceAccountKey.json)
  // In production, this is set via GOOGLE_APPLICATION_CREDENTIALS env var
  const keyPath = path.join(process.cwd(), "functions", "serviceAccountKey.json");
  let serviceAccount;

  if (fs.existsSync(keyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback: use GOOGLE_APPLICATION_CREDENTIALS (standard for Cloud Functions)
    // initializeApp() with no args uses ADC
    return initializeApp({
      projectId: "qtb-bank-crypto",
    });
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: "qtb-bank-crypto",
    databaseURL: "https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "qtb-bank-crypto.firebasestorage.app",
  });
}

adminApp = initAdmin();

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export const adminStorage: Storage = getStorage(adminApp);
export default adminApp;
