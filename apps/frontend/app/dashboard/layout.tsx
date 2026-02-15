'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout: clearUserState } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // 1. Clear local state immediately for fast UI
            clearUserState();

            // 2. Revoke backend session
            await logout();

            // 3. Redirect
            router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
            // Fallback: still redirect
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


    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b flex items-center justify-between px-8 bg-card backdrop-blur-xl sticky top-0 z-40 shadow-soft">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground stroke-[1.5px]" />
                            <Input
                                placeholder="Search everything..."
                                className="pl-10 h-9 bg-secondary border-border focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative transition-all hover:bg-accent rounded-xl">
                            <Bell className="h-5 w-5 text-muted-foreground stroke-[1.5px]" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background shadow-soft" />
                        </Button>
                        <div className="h-4 w-px bg-border mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-2 hover:bg-accent transition-all rounded-xl">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-soft">
                                        {user ? getInitials(user.fullName) : '??'}
                                    </div>
                                    <span className="text-sm font-bold hidden sm:inline-block">
                                        {loading ? 'Loading...' : (user?.fullName || 'User')}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => router.push('/dashboard/settings')}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/dashboard/settings/security')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Security</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={handleLogout}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
