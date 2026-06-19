import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for QTBM CRYPTO Android wrapper.
 *
 * Based on research best practices for mobile WebView apps:
 * - androidScheme: "https" (required for service workers, FCM)
 * - allowMixedContent: false (security)
 * - webContentsDebuggingEnabled: false (production)
 * - backgroundColor matches app theme (prevents white flash)
 */
const config: CapacitorConfig = {
  appId: "com.qtbm.crypto",
  appName: "QTBM CRYPTO",
  webDir: "out",
  backgroundColor: "#0B0E11",
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#0B0E11",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#F0B90B",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B0E11",
      overlaysWebView: false,
    },
    NavigationBar: {
      backgroundColor: "#0B0E11",
      style: "DARK",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
