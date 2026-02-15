'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Zap,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    Plus,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import { CreateProjectModal } from '@/components/dashboard/create-project-modal';

interface Project {
    id: string;
    name: string;
    status: string;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
        velocity: '0%',
        upcomingTasks: [] as any[],
        projectProgress: [] as any[]
    });
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const [projectsData, activitiesData, statsData] = await Promise.all([
                api<Project[]>('/projects'),
                api<any[]>('/activity/recent'),
                api<any>('/dashboard/stats')
            ]);
            setRecentProjects(projectsData.slice(0, 3));
            setActivities(activitiesData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch overview data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActivityText = (activity: any) => {
        const projectName = activity.project?.name || 'a project';
        const meta = activity.metadata || {};

        switch (activity.action) {
            case 'PROJECT_CREATED': return `created the project ${projectName}`;
            case 'TASK_CREATED': return `added task "${meta.title || meta.name}" to ${projectName}`;
            case 'TASK_COMPLETED': return `completed task "${meta.title || meta.name}" in ${projectName}`;
            case 'TASK_UPDATED': return `updated task "${meta.title || meta.name}" in ${projectName}`;
            case 'TASK_DELETED': return `deleted task "${meta.title || meta.name}" from ${projectName}`;
            default: return `performed an action in ${projectName}`;
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    if (loading) return (
        <div className="space-y-10 max-w-7xl mx-auto animate-pulse">
            <div className="h-32 w-2/3 bg-primary/5 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-primary/5 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-primary/5 rounded-2xl" />
                <div className="h-96 bg-primary/5 rounded-2xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider"
                    >
                        <Sparkles className="h-4 w-4 stroke-[1.5px]" />
                        Executive Summary
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold tracking-tight"
                    >
                        Welcome, <span className="text-gradient">Builder</span> 🛠️
                    </motion.h1>
                    <p className="text-muted-foreground max-w-lg text-sm font-medium">
                        Here's what's happening across your workspaces today.
                    </p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2 rounded-xl shadow-lg shadow-primary/25 transition-all font-black uppercase tracking-widest h-11 px-6 bg-primary hover:shadow-blue-glow"
                    >
                        <Plus className="h-4 w-4 stroke-[1.5px]" />
                        Create New Project
                    </Button>
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Projects', value: stats.totalProjects, icon: BarChart3, color: 'text-blue-500' },
                    { label: 'Active Tasks', value: stats.activeTasks, icon: Zap, color: 'text-amber-500' },
                    { label: 'Tasks Done', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Velocity', value: stats.velocity, icon: ArrowUpRight, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="glass rounded-2xl overflow-hidden border-border group hover:border-primary/50 transition-all duration-300 shadow-soft backdrop-blur-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</p>
                                        <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                                    </div>
                                    <div className={cn("p-4 rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110 shadow-inner ring-1 ring-border", stat.color)}>
                                        <stat.icon className="h-6 w-6 stroke-[1.5px]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Project Progress */}
                    <Card className="glass rounded-2xl border-border shadow-soft overflow-hidden backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 stroke-[1.5px]" /> Project Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {stats.projectProgress.map((project) => (
                                <div key={project.id} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                        <span>{project.name}</span>
                                        <span className="text-primary">{project.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full shadow-blue-glow"
                                        />
                                    </div>
                                </div>
                            ))}
                            {stats.projectProgress.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-xs uppercase tracking-widest opacity-50 font-bold">No active projects</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Projects */}
                    <Card className="glass rounded-2xl border-border shadow-soft overflow-hidden backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-secondary/5 pb-4">
                            <div className="space-y-0.5">
                                <CardTitle className="text-lg font-black uppercase tracking-widest text-primary">Recent Projects</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-tight opacity-70">Recently modified workspaces</CardDescription>
                            </div>
                            <Link href="/dashboard/projects">
                                <Button variant="ghost" size="sm" className="gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 hover:text-primary transition-all">
                                    View all <ArrowRight className="h-3 w-3 stroke-[1.5px]" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            {recentProjects.map((project, i) => (
                                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group relative overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-secondary/60 flex items-center justify-center text-primary font-black text-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground shadow-soft ring-1 ring-border">
                                                {project.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold group-hover:text-primary transition-colors">{project.name}</div>
                                                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-60">{project.status}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 text-primary stroke-[2px]" />
                                    </div>
                                </Link>
                            ))}
                            {recentProjects.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-50">No projects found. Create one to get started!</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Areas */}
                <div className="space-y-8">
                    {/* Upcoming Deadlines */}
                    <Card className="glass rounded-2xl border-border shadow-soft overflow-hidden backdrop-blur-xl bg-gradient-to-br from-card to-secondary/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Clock className="h-5 w-5 stroke-[1.5px]" /> Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {stats.upcomingTasks.map((task) => (
                                <div key={task.id} className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-500 flex items-center gap-2">
                                        <Zap className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm font-bold group-hover:text-primary transition-colors truncate">{task.title}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{task.project.name}</div>
                                </div>
                            ))}
                            {stats.upcomingTasks.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-xs uppercase tracking-widest opacity-50 font-bold">No upcoming deadlines</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="glass rounded-2xl border-border shadow-soft overflow-hidden backdrop-blur-xl">
                        <CardHeader className="border-b border-border/60 bg-secondary/5 pb-4">
                            <CardTitle className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Clock className="h-5 w-5 stroke-[1.5px]" /> Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-1.5 before:h-full before:w-px before:bg-gradient-to-b before:from-border before:to-transparent">
                                {activities.map((activity, i) => (
                                    <div key={activity.id} className="relative flex gap-4 transition-all group">
                                        <div className="h-3 w-3 rounded-full bg-primary mt-1.5 z-10 shrink-0 ring-4 ring-background shadow-soft shadow-primary/20 group-hover:scale-125 transition-transform" />
                                        <div className="space-y-1 py-0.5">
                                            <p className="text-xs leading-relaxed text-foreground">
                                                <span className="font-bold text-primary">{activity.user?.fullName}</span> {getActivityText(activity)}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-80">
                                                {formatDistance(new Date(activity.createdAt), new Date(), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground italic text-xs font-bold uppercase tracking-widest opacity-50">No recent activity</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchOverview}
            />
        </div>
    );
}

function formatDistance(date: Date, baseDate: Date, options: any) {
    const diffInSeconds = Math.floor((baseDate.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
