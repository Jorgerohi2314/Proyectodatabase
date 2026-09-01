import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProviderRoot } from "@/contexts/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base de Datos de Usuarios",
  description: "Aplicación web para la gestión y visualización de la base de datos de usuarios. Desarrollada con Next.js, TypeScript, Tailwind CSS y shadcn/ui.",
  keywords: ["Base de Datos", "Usuarios", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "Jorge Rodriguez" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "Base de Datos de Usuarios",
    description: "Gestión y visualización de la base de datos de usuarios con Next.js y Tailwind CSS.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base de Datos de Usuarios",
    description: "Gestión y visualización de la base de datos de usuarios con Next.js y Tailwind CSS.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProviderRoot>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProviderRoot>
      </body>   
    </html>
  );
}
