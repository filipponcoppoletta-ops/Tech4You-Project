"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Zap, LogOut } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAdmin, logout } = useProject();

    // Do not render the sidebar on the login page
    if (pathname === '/login') return null;

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <aside className="w-full lg:w-64 border-b lg:border-r border-border/40 bg-card/50 backdrop-blur-xl lg:h-screen lg:sticky lg:top-0 flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-border/40">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tight">Tech4You PM</span>
            </div>
            <nav className="flex-1 p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                <Link href="/" className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors ${pathname === '/' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>
                <Link href="/resources" className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors ${pathname === '/resources' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                    <Users className="h-4 w-4" />
                    RACI & Resources
                </Link>
            </nav>
            {user && (
                <div className="p-6 border-t border-border/40 hidden lg:block">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden ring-1 ring-border/50">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col max-w-[100px] overflow-hidden">
                                <span className="text-sm font-semibold truncate" title={user.email}>{user.email?.split('@')[0]}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{isAdmin ? 'Admin' : 'User'}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10" title="Log out">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
