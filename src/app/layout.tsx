import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://saldoclaro.xyz"),
  title: "SaldoClaro | Dashboard financeiro",
  description: "Dashboard financeiro para gerenciar suas finanças pessoais",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SaldoClaro",
  },
  icons: {
    icon: [
      { url: "/logo-saldoclaro.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "SaldoClaro | Dashboard financeiro",
    description: "Dashboard financeiro para gerenciar suas finanças pessoais",
    url: "https://saldoclaro.xyz",
    siteName: "SaldoClaro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaldoClaro FinançasPro Beta",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaldoClaro | Dashboard financeiro",
    description: "Dashboard financeiro para gerenciar suas finanças pessoais",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
