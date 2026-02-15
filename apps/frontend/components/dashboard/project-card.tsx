'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FolderKanban, MoreHorizontal, Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Link as LinkIcon, Archive, Trash2, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { EditProjectModal } from './edit-project-modal';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    members?: {
        user: {
            fullName: string;
            profile?: { avatarUrl?: string };
        };
    }[];
    _count?: {
        members: number;
        tasks: number;
    };
}

export function ProjectCard({
    project,
    index,
    onRefresh,
    viewMode = 'grid'
}: {
    project: Project;
    index: number;
    onRefresh?: () => void;
    viewMode?: 'grid' | 'list';
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const statusColors: Record<string, string> = {
        active: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500',
        completed: 'border-blue-500/30 bg-blue-500/5 text-blue-500',
        archived: 'border-slate-500/30 bg-slate-500/5 text-slate-500',
    };

    // Format initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Calculate time ago (simple version)
    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        return `${Math.floor(diffInSeconds / 86400)}d`;
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/dashboard/projects/${project.id}`;
        navigator.clipboard.writeText(url);
        // We could add a toast here later if we have a toast component
    };

    const handleArchive = async () => {
        if (isArchiving) return;
        setIsArchiving(true);
        try {
            await api(`/projects/${project.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'archived' }),
            });
            onRefresh?.();
        } catch (err) {
            console.error('Failed to archive project:', err);
        } finally {
            setIsArchiving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await api(`/projects/${project.id}`, {
                method: 'DELETE',
            });
            onRefresh?.();
        } catch (err) {
            console.error('Failed to delete project:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <div className="group glass rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-lg p-4 flex items-center gap-6 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <FolderKanban className="h-5 w-5 stroke-[1.5px]" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">{project.name}</h3>
                            <span className={cn(
                                "text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-lg border shadow-sm",
                                statusColors[project.status.toLowerCase()] || 'border-slate-500/30 bg-slate-500/5 text-slate-500'
                            )}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 truncate max-w-md">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 px-4 border-l border-border/50 h-10">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {(project.members || []).map((member, i) => (
                                    <div
                                        key={i}
                                        title={member.user.fullName}
                                        className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-[9px] font-black shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform cursor-help"
                                    >
                                        {getInitials(member.user.fullName)}
                                    </div>
                                ))}
                            </div>
                            {(project._count?.members || 0) > 3 && (
                                <span className="text-[10px] text-muted-foreground font-bold">
                                    +{project._count!.members - 3} more
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest min-w-[140px]">
                            <span className="flex items-center gap-1.5 opacity-80" title="Last Activity">
                                <Clock className="h-3.5 w-3.5 stroke-[1.5px]" /> {getTimeAgo(project.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5 opacity-80" title="Task Count">
                                <Users className="h-3.5 w-3.5 stroke-[1.5px]" /> {project._count?.tasks || 0}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/projects/${project.id}`}>
                            <Button variant="secondary" size="sm" className="hidden sm:flex text-[10px] font-black uppercase tracking-widest gap-2 h-9 rounded-lg border border-border shadow-soft transition-all">
                                Open <ArrowRight className="h-3 w-3 stroke-[1.5px]" />
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    <span>Open Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Quick Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}/settings`)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyLink}>
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleArchive}
                                    disabled={isArchiving || project.status === 'archived'}
                                    className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    <span>{isArchiving ? 'Archiving...' : 'Archive Project'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <EditProjectModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => onRefresh?.()}
                    project={project}
                />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
        >
            <Card className="group glass rounded-2xl border-border hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-xl relative overflow-hidden backdrop-blur-xl">
                {/* Decorative Gradient */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                                <FolderKanban className="h-4 w-4 stroke-[1.5px]" />
                            </div>
                            <span className={cn(
                                "text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border shadow-sm",
                                statusColors[project.status.toLowerCase()] || 'border-slate-500/30 bg-slate-500/5 text-slate-500'
                            )}>
                                {project.status}
                            </span>
                        </div>
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100 hover:bg-accent/50">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                <span>Open Project</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Quick Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}/settings`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                <span>Copy Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleArchive}
                                disabled={isArchiving || project.status === 'archived'}
                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                <span>{isArchiving ? 'Archiving...' : 'Archive Project'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="pb-4">
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed min-h-[40px]">
                        {project.description || 'No description provided for this project. Organize your tasks and keep your team in sync.'}
                    </CardDescription>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border flex flex-col gap-4 bg-secondary/20">
                    <div className="flex items-center justify-between w-full px-1">
                        <div className="flex -space-x-2.5">
                            {(project.members || []).map((member, i) => (
                                <div
                                    key={i}
                                    title={member.user.fullName}
                                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform cursor-help"
                                >
                                    {getInitials(member.user.fullName)}
                                </div>
                            ))}
                            {(project._count?.members || 0) > 3 && (
                                <div className="h-8 w-8 rounded-full border-2 border-background bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold shadow-sm ring-1 ring-border">
                                    +{project._count!.members - 3}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 opacity-80" title="Last Activity">
                                <Clock className="h-3 w-3 stroke-[1.5px]" /> {getTimeAgo(project.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5 opacity-80" title="Task Count">
                                <Users className="h-3 w-3 stroke-[1.5px]" /> {project._count?.tasks || 0}
                            </span>
                        </div>
                    </div>

                    <Link href={`/dashboard/projects/${project.id}`} className="w-full">
                        <Button variant="secondary" className="w-full text-[11px] font-black uppercase tracking-widest gap-2 group/btn h-10 rounded-xl border border-border shadow-soft hover:bg-accent hover:shadow-blue-glow/20 transition-all">
                            View Project
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1 stroke-[1.5px]" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => onRefresh?.()}
                project={project}
            />
        </motion.div>
    );
}

