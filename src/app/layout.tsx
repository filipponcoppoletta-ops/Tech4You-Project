import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, Zap } from "lucide-react";
import { ProjectProvider } from "@/lib/ProjectContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PM Dashboard",
  description: "Modern Project Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background lg:flex-row`}>
        <ProjectProvider>
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 border-b lg:border-r border-border/40 bg-card/50 backdrop-blur-xl lg:h-screen lg:sticky lg:top-0 flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-border/40">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">Tech4You PM</span>
            </div>
            <nav className="flex-1 p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-muted text-foreground font-medium transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/resources" className="flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
                <Users className="h-4 w-4" />
                RACI & Resources
              </Link>
            </nav>
            <div className="p-6 border-t border-border/40 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden ring-1 ring-border/50">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Filippo`} alt="User" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Filippo N.</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </ProjectProvider>
      </body>
    </html>
  );
}
