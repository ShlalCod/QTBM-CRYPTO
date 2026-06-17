package com.qtbm.crypto

import android.os.Bundle
import com.getcapacitor.BridgeActivity

/**
 * Main entry point for the QTBM CRYPTO Android app.
 *
 * The app shell is a Capacitor BridgeActivity that hosts the Next.js
 * web build inside a WebView. Firebase Cloud Messaging is wired up via
 * the AndroidManifest (com.google.firebase.MESSAGING_EVENT intent-filter)
 * and the JS-side Firebase Messaging SDK in src/lib/firebase.ts.
 */
class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Register any custom Capacitor plugins before super.onCreate()
        super.onCreate(savedInstanceState)
    }
}
