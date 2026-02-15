'use client';

import { Activity, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const tabs = [
    {
        name: 'Account',
        href: '/dashboard/settings',
        icon: User,
    },
    {
        name: 'Security',
        href: '/dashboard/settings/security',
        icon: Shield,
    },
    {
        name: 'Activity',
        href: '/dashboard/settings/activity',
        icon: Activity,
    },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-6">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient">Settings</h1>
                <p className="text-muted-foreground text-sm font-medium">
                    Manage your personal account settings and preferences.
                </p>
            </div>

            <div className="border-b">
                <nav className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition-all hover:text-primary relative group',
                                    isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground'
                                )}
                            >
                                <Icon className={cn("h-4 w-4 stroke-[1.5px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                {tab.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div>{children}</div>
        </div>
    );
}
