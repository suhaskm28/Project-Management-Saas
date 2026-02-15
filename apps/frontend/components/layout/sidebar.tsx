'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderKanban,
    Calendar,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout: clearUserState } = useAuth();

    const handleLogout = async () => {
        try {
            clearUserState();
            await logout();
            router.push('/login');
        } catch (err) {
            router.push('/login');
        }
    };

    // Get initials from fullName
    const getInitials = (name?: string) => {
        if (!name || typeof name !== 'string') return '??';

        return name
            .trim()
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };


    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            active: pathname === '/dashboard'
        },
        {
            label: 'Projects',
            icon: FolderKanban,
            href: '/dashboard/projects',
            active: pathname.startsWith('/dashboard/projects')
        },
        {
            label: 'Tasks',
            icon: CheckSquare,
            href: '/dashboard/tasks',
            active: pathname.startsWith('/dashboard/tasks')
        },
        {
            label: 'Team',
            icon: Users,
            href: '/dashboard/team',
            active: pathname.startsWith('/dashboard/team')
        },
        {
            label: 'Calendar',
            icon: Calendar,
            href: '/dashboard/calendar',
            active: pathname.startsWith('/dashboard/calendar')
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '/dashboard/settings',
            active: pathname.startsWith('/dashboard/settings')
        }
    ];

    return (
        <div
            className={cn(
                "relative flex flex-col h-screen border-r bg-card backdrop-blur-xl transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                className
            )}
        >
            <div className="flex items-center h-16 px-6 border-b">
                <div className={cn("flex items-center gap-2 font-bold text-xl overflow-hidden transition-all duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-soft">
                        <span className="text-primary-foreground text-xs font-bold">PM</span>
                    </div>
                    <span className="bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent">ProjectMaster</span>
                </div>
                {isCollapsed && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mx-auto shadow-soft">
                        <span className="text-primary-foreground text-xs font-bold">PM</span>
                    </div>
                )}
            </div>

            <div className="flex-1 py-6 px-3 space-y-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                            route.active
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <route.icon className={cn("h-5 w-5 shrink-0 stroke-[1.5px]", route.active ? "text-primary-foreground" : "group-hover:text-primary")} />
                        <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>
                            {route.label}
                        </span>
                        {isCollapsed && (
                            <div className="absolute left-14 px-2 py-1 bg-primary text-primary-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                {route.label}
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t space-y-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20">
                            {getInitials(user?.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{user?.fullName || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">{user?.email || 'member'}</p>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className={cn("w-full justify-start gap-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all", isCollapsed && "justify-center")}
                >
                    <LogOut className="h-5 w-5 text-muted-foreground stroke-[1.5px]" />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </Button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background flex items-center justify-center hover:bg-accent shadow-sm z-50 transition-transform hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            </div>
        </div>
    );
}
