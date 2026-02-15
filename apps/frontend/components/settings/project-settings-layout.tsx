'use client';

import { Settings, Users, Activity as ActivityIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface ProjectSettingsLayoutProps {
    children: React.ReactNode;
    projectName?: string;
}

const tabs = [
    {
        name: 'General',
        path: '',
        icon: Settings,
    },
    {
        name: 'Members',
        path: '/members',
        icon: Users,
    },
    {
        name: 'Activity',
        path: '/activity',
        icon: ActivityIcon,
    },
    {
        name: 'Danger Zone',
        path: '/danger',
        icon: AlertTriangle,
    },
];

export function ProjectSettingsLayout({ children, projectName }: ProjectSettingsLayoutProps) {
    const pathname = usePathname();
    const params = useParams();
    const projectId = params?.id as string;
    const baseHref = `/dashboard/projects/${projectId}/settings`;

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-6">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient">Project Settings</h1>
                <p className="text-muted-foreground text-sm font-medium">
                    {projectName ? `Configuring settings for "${projectName}"` : 'Manage project configuration and team permissions.'}
                </p>
            </div>

            <div className="border-b">
                <nav className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const href = baseHref + tab.path;
                        const isActive = pathname === href;
                        const isDangerZone = tab.name === 'Danger Zone';

                        return (
                            <Link
                                key={tab.path}
                                href={href}
                                className={cn(
                                    'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-bold transition-all relative group',
                                    isActive
                                        ? isDangerZone
                                            ? 'border-red-500 text-red-500'
                                            : 'border-primary text-primary'
                                        : 'border-transparent',
                                    isDangerZone && !isActive
                                        ? 'text-red-500/70 hover:text-red-500'
                                        : !isActive && 'text-muted-foreground hover:text-primary transition-colors'
                                )}
                            >
                                <Icon className={cn("h-4 w-4 stroke-[1.5px]",
                                    isActive ? (isDangerZone ? "text-red-500" : "text-primary") :
                                        (isDangerZone ? "text-red-500/70 group-hover:text-red-500" : "text-muted-foreground group-hover:text-primary")
                                )} />
                                {tab.name}
                                {isActive && !isDangerZone && (
                                    <motion.div
                                        layoutId="activeProjectTab"
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
