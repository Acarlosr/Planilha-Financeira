import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://saldoclaro.xyz"),
  title: "SaldoClaro | Dashboard financeiro",
  description: "Dashboard financeiro para gerenciar suas finanças pessoais",
  icons: {
    icon: [
      { url: "/logo-saldoclaro.svg", type: "image/svg+xml" },
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
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
