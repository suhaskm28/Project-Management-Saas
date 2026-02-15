import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  // 🔴 CHANGE THIS to your real production domain

  title: {
    default: "ProjectMaster – Modern Project Management for Teams",
    template: "%s | ProjectMaster",
  },

  description:
    "ProjectMaster is a secure, role-based project management platform with Kanban boards, activity logs, and team collaboration tools.",

  keywords: [
    "project management",
    "kanban board",
    "team collaboration",
    "saas project tool",
    "task tracking",
    "rbac",
    "activity logs",
  ],

  openGraph: {
    title: "ProjectMaster – Project Management for Modern Teams",
    description:
      "Manage projects with Kanban boards, role-based access control, and real-time activity tracking.",
    url: "https://yourdomain.com", // 🔴 CHANGE THIS
    siteName: "ProjectMaster",
    images: [
      {
        url: "/og-image.png", // 🔴 You must add this file in /public
        width: 1200,
        height: 630,
        alt: "ProjectMaster Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ProjectMaster – Modern Project Management",
    description:
      "Kanban boards, role-based access, and audit logs built for serious teams.",
    images: ["/og-image.png"], // 🔴 Must exist
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="noise-overlay" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
