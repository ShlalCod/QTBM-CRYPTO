import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for QTBM CRYPTO Android wrapper.
 *
 * - appId: com.qtbm.crypto  (matches google-services.json package_name)
 * - appName: QTBM CRYPTO
 * - webDir: out/             (Next.js static export destination)
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
      launchShowDuration: 1500,
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
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
