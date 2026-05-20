import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

export const metadata: Metadata = {
  title: "FinançasPro | Dashboard financeiro",
  description: "Dashboard financeiro para gerenciar suas finanças pessoais",
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
