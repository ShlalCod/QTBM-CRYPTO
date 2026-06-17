import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "QTBM BANK - Digital Asset Exchange",
  description: "Trade cryptocurrencies with confidence on QTBM BANK. Buy, sell, and manage your digital assets securely.",
  keywords: ["QTBM", "cryptocurrency", "bitcoin", "ethereum", "trading", "exchange", "digital assets"],
  authors: [{ name: "QTBM BANK" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "QTBM BANK - Digital Asset Exchange",
    description: "Trade cryptocurrencies with confidence on QTBM BANK",
    siteName: "QTBM BANK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QTBM BANK - Digital Asset Exchange",
    description: "Trade cryptocurrencies with confidence on QTBM BANK",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0E11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="dark">
      <head>
        {/* Inline script to set initial direction from localStorage before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('qtbm-language');
                  if (stored === '"ar"' || stored === 'ar') {
                    document.documentElement.dir = 'rtl';
                    document.documentElement.lang = 'ar';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
