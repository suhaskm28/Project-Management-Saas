'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Plus,
    MoreVertical,
    Users,
    Clock,
    CheckCircle2,
    Circle,
    Calendar,
    MessageSquare,
    Share2,
    Settings,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';
import { TaskDetailsDrawer } from '@/components/dashboard/task-details-drawer';
import { InvitationModal } from '@/components/dashboard/invitation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectDetailSkeleton } from '@/components/ui/skeleton';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    tasks: Task[];
    members: ProjectMember[];
}

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: number;
    dueDate?: string;
    createdAt: string;
    assignee?: {
        fullName: string;
    };
}

interface ProjectMember {
    userId: string;
    role: string;
    user?: {
        fullName: string;
        email: string;
    };
}

export default function ProjectDetail() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate'>('priority');

    const filteredTasks = [...(project?.tasks || [])]
        .filter(t => {
            if (filter === 'all') return true;
            return t.status === filter;
        })
        .sort((a, b) => {
            if (sortBy === 'priority') return (b.priority || 0) - (a.priority || 0);
            if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
        });

    const currentUserRole = project?.members.find(m => m.userId === user?.id)?.role;
    const isOwner = currentUserRole === 'owner';

    const fetchProjectData = async () => {
        try {
            const [projectData, activitiesData] = await Promise.all([
                api<Project>(`/projects/${params.id}`),
                api<any[]>(`/activity/project/${params.id}`)
            ]);
            setProject(projectData);
            setActivities(activitiesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
        try {
            const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            await api(`/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: nextStatus }),
            });
            fetchProjectData();
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    useEffect(() => {
        fetchProjectData();

        // Polling: Refresh every 10 seconds for real-time feel
        const interval = setInterval(fetchProjectData, 10000);
        return () => clearInterval(interval);
    }, [params.id]);

    if (loading && !project) return (
        <div className="p-8 max-w-7xl mx-auto">
            <ProjectDetailSkeleton />
        </div>
    );

    if (!project) return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <h2 className="text-2xl font-bold">Project not found</h2>
            <Button onClick={() => router.push('/dashboard/projects')}>Back to Projects</Button>
        </div>
    );

    const tasks = project.tasks || [];
    const members = project.members || [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Project Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to projects
                    </button>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description || 'Deep dive into project tasks and team collaboration.'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl border-border hover:bg-accent shadow-soft transition-all">
                        <Share2 className="h-4 w-4 stroke-[1.5px]" /> Share
                    </Button>
                    <Link href={`/dashboard/projects/${params.id}/settings`}>
                        <Button variant="outline" className="gap-2 rounded-xl border-border hover:bg-accent shadow-soft transition-all">
                            <Settings className="h-4 w-4 stroke-[1.5px]" /> Settings
                        </Button>
                    </Link>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="gap-2 rounded-xl shadow-lg shadow-primary/25 transition-all bg-primary hover:shadow-blue-glow font-black uppercase tracking-widest h-11 px-6"
                        >
                            <Plus className="h-4 w-4 stroke-[1.5px]" /> New Task
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex bg-secondary/30 p-1 rounded-xl border border-border transition-all">
                            {(['all', 'pending', 'completed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                                        filter === f
                                            ? "bg-background text-primary shadow-soft ring-1 ring-border"
                                            : "hover:bg-accent/50 text-muted-foreground"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-secondary/30 border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all truncate max-w-[120px]"
                            >
                                <option value="priority">Priority</option>
                                <option value="created">Recently Added</option>
                                <option value="dueDate">Due Date</option>
                            </select>
                        </div>
                    </div>

                    <Card className="glass shadow-xl overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border flex-row items-center justify-between px-6 py-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary stroke-[1.5px]" /> Tasks
                            </CardTitle>
                            <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-lg">
                                <Button variant="ghost" size="sm" className="text-[10px] font-bold h-7 px-3 rounded-md bg-background shadow-soft ring-1 ring-border text-primary">All</Button>
                                <Button variant="ghost" size="sm" className="text-[10px] font-bold h-7 px-3 rounded-md text-muted-foreground hover:bg-accent transition-all">Completed</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <motion.div layout className="divide-y divide-border">
                                <AnimatePresence mode="popLayout">
                                    {filteredTasks.map((task) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={task.id}
                                            whileHover={{ backgroundColor: "var(--accent)", opacity: 0.9 }}
                                            className="p-5 flex items-center justify-between transition-all group cursor-pointer border-l-2 border-transparent hover:border-primary"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTaskStatus(task.id, task.status);
                                                    }}
                                                    className="text-muted-foreground hover:text-primary transition-all h-6 w-6 flex items-center justify-center rounded-full border border-border bg-secondary/10 hover:border-primary/50 group-hover:scale-110"
                                                >
                                                    {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-primary stroke-[1.5px]" /> : <Circle className="h-5 w-5 stroke-[1.5px] opacity-40" />}
                                                </button>
                                                <div className="space-y-0.5">
                                                    <div className={cn("text-sm font-bold transition-all", task.status === 'completed' && "line-through text-muted-foreground/60")}>
                                                        {task.title}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                                            task.priority >= 3 ? 'border-red-500/20 bg-red-500/5 text-red-500' :
                                                                task.priority === 2 ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' :
                                                                    'border-blue-500/20 bg-blue-500/5 text-blue-500'
                                                        )}>
                                                            {task.priority >= 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                                                        </span>
                                                        {task.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3 stroke-[1.5px]" /> {new Date(task.dueDate).toLocaleDateString()}</span>}
                                                        {task.assignee && (
                                                            <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20">
                                                                <Users className="h-2.5 w-2.5" />
                                                                {task.assignee.fullName.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">View Details</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent transition-all">
                                                    <MoreVertical className="h-4 w-4 stroke-[1.5px]" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {tasks.length === 0 && (
                                    <div className="py-20 text-center text-muted-foreground italic flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center">
                                            <Plus className="h-8 w-8 text-primary/20" />
                                        </div>
                                        <p>No tasks found. Click "New Task" to begin.</p>
                                    </div>
                                )}
                            </motion.div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Stats & Team */}
                <div className="space-y-6">
                    <Card className="glass shadow-lg rounded-2xl overflow-hidden border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary stroke-[1.5px]" /> Contributors
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {members.map((member, i) => (
                                <div key={member.userId} className="flex items-center justify-between group transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-soft ring-2 ring-background">
                                            {member.user?.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold group-hover:text-primary transition-colors">{member.user?.fullName || 'Anonymous User'}</div>
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{member.role}</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-accent transition-all text-muted-foreground hover:text-primary">
                                        <MessageSquare className="h-3.5 w-3.5 stroke-[1.5px]" />
                                    </Button>
                                </div>
                            ))}
                            {members.length === 0 && <div className="text-sm text-muted-foreground italic py-2">No members found</div>}

                            {isOwner && (
                                <Button
                                    variant="secondary"
                                    className="w-full mt-4 text-xs font-bold gap-2 rounded-xl h-10 border border-border/50 hover:bg-accent hover:shadow-blue-glow/20 transition-all"
                                    onClick={() => setIsInviteModalOpen(true)}
                                >
                                    <Plus className="h-3.5 w-3.5 stroke-[1.5px]" /> Invite Person
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="glass shadow-lg rounded-2xl overflow-hidden border-border">
                        <div className="p-6 bg-secondary/20 border-b border-border">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary stroke-[1.5px]" /> Activity logs
                            </CardTitle>
                        </div>
                        <CardContent className="p-6 space-y-6 bg-background/40">
                            {activities.map((activity, i) => (
                                <div key={activity.id} className="flex gap-4 relative group">
                                    {i !== activities.length - 1 && <div className="absolute left-1.5 top-6 bottom-[-24px] w-px bg-border/60" />}
                                    <div className="h-3 w-3 rounded-full bg-primary mt-1.5 z-10 ring-4 ring-background shadow-soft shadow-primary/20 transition-all group-hover:scale-125" />
                                    <div className="space-y-1">
                                        <p className="text-xs leading-relaxed text-foreground">
                                            <span className="font-bold text-primary">{activity.user?.fullName}</span> {
                                                activity.action === 'PROJECT_CREATED' ? 'created the project' :
                                                    activity.action === 'TASK_CREATED' ? `added task "${activity.metadata?.title}"` :
                                                        activity.action === 'TASK_COMPLETED' ? `completed task "${activity.metadata?.title}"` :
                                                            activity.action === 'TASK_UPDATED' ? `updated task "${activity.metadata?.title}"` :
                                                                activity.action === 'TASK_DELETED' ? `deleted task "${activity.metadata?.title}"` :
                                                                    'performed an action'
                                            }
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-80">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div className="text-sm text-muted-foreground italic text-center py-4">No activity yet</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <CreateTaskModal
                isOpen={isTaskModalOpen}
                projectId={params.id as string}
                onClose={() => setIsTaskModalOpen(false)}
                onSuccess={fetchProjectData}
            />
            <InvitationModal
                isOpen={isInviteModalOpen}
                projectId={params.id as string}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchProjectData}
            />
            <TaskDetailsDrawer
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onTaskUpdate={() => {
                    fetchProjectData();
                    if (selectedTask) {
                        api<Project>(`/projects/${params.id}`).then(p => {
                            const updated = p.tasks.find(t => t.id === selectedTask.id);
                            if (updated) setSelectedTask(updated);
                        });
                    }
                }}
            />
        </div>
    );
}
