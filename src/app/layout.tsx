import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QTBM CRYPTO — Digital Asset Exchange",
  description: "Trade cryptocurrencies with confidence on QTBM CRYPTO. Buy, sell, and manage your digital assets securely.",
  keywords: ["QTBM", "cryptocurrency", "bitcoin", "ethereum", "trading", "exchange", "digital assets"],
  authors: [{ name: "QTBM CRYPTO" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "QTBM CRYPTO — Digital Asset Exchange",
    description: "Trade cryptocurrencies with confidence on QTBM CRYPTO",
    siteName: "QTBM CRYPTO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QTBM CRYPTO — Digital Asset Exchange",
    description: "Trade cryptocurrencies with confidence on QTBM CRYPTO",
  },
};

// Viewport optimized for Capacitor Android WebView + mobile browsers.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0E11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Default to Arabic (RTL) — the app's primary language.
  // The inline script normalizes both 'ar' and '"ar"' localStorage forms
  // and applies the correct dir/lang BEFORE first paint to prevent flash.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('qtbm-language');
                  var lang = stored ? stored.replace(/^["']|["']$/g, '') : 'ar';
                  if (lang === 'en') {
                    document.documentElement.dir = 'ltr';
                    document.documentElement.lang = 'en';
                  } else {
                    document.documentElement.dir = 'rtl';
                    document.documentElement.lang = 'ar';
                  }
                } catch(e) {
                  document.documentElement.dir = 'rtl';
                  document.documentElement.lang = 'ar';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
