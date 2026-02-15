'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Users,
    CheckCircle2,
    Circle,
    Calendar,
    Search,
    Filter,
    LayoutGrid,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Kanban as KanbanIcon,
    List as ListIcon,
    Settings2,
    Share2,
    PlusCircle,
    MoreHorizontal,
    Table as TableIcon,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDetailsDrawer } from '@/components/dashboard/task-details-drawer';
import { KanbanCard } from '@/components/dashboard/kanban-card';
import { InvitationModal } from '@/components/dashboard/invitation-modal';
import { ProjectSelector } from '@/components/dashboard/project-selector';
import { TaskTable } from '@/components/dashboard/task-table';
import { TaskTimeline } from '@/components/dashboard/task-timeline';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Project {
    id: string;
    name: string;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: number;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    project: {
        id: string;
        name: string;
    };
    assignee?: {
        fullName: string;
    };
}

const COLUMNS = [
    { id: 'pending', title: 'To do', color: 'bg-amber-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
];

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';
type GroupOption = 'status' | 'project' | 'priority' | 'none';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'board' | 'list' | 'table' | 'timeline'>('board');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const [sortBy, setSortBy] = useState<SortOption>('createdAt');
    const [groupBy, setGroupBy] = useState<GroupOption>('status');

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isInvitationStepTwo, setIsInvitationStepTwo] = useState(false);
    const [inviteProjectId, setInviteProjectId] = useState<string>('');

    const fetchData = async () => {
        try {
            const [tasksData, projectsData] = await Promise.all([
                api<Task[]>('/tasks'),
                api<Project[]>('/projects')
            ]);
            setTasks(tasksData);
            setProjects(projectsData);
            if (projectsData.length > 0 && !inviteProjectId) {
                setInviteProjectId(projectsData[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            await api(`/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            fetchData();
        } catch (err) {
            console.error('Failed to update task:', err);
            fetchData();
        }
    };

    const handleDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        updateTaskStatus(draggableId, destination.droppableId);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const processedTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.project.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || (
                priorityFilter === 'high' ? task.priority >= 3 :
                    priorityFilter === 'medium' ? task.priority === 2 :
                        priorityFilter === 'low' ? task.priority === 1 : true
            );
            return matchesSearch && matchesStatus && matchesPriority;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'priority') return b.priority - a.priority;
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="h-10 w-64 bg-muted rounded-xl animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-[500px] bg-muted rounded-2xl animate-pulse" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <ArrowUpRight className="h-4 w-4 rotate-180" />
                <span>Team spaces</span>
                <span className="opacity-40">/</span>
                <span className="text-foreground font-bold">Tasks Dashboard</span>
            </div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter text-gradient">Global Board</h1>
                    <p className="text-muted-foreground font-semibold">Consolidated view of all project tasks and progress.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-3 mr-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-lg ring-1 ring-white/10">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={() => setIsInviteModalOpen(true)}
                        variant="default"
                        className="rounded-xl font-bold bg-primary hover:shadow-blue-glow transition-all gap-2 px-6"
                    >
                        <PlusCircle className="h-4 w-4" /> Invite Member
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* View Tabs & Main Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-4">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'board', icon: KanbanIcon, label: 'Board' },
                        { id: 'list', icon: ListIcon, label: 'List' },
                        { id: 'table', icon: TableIcon, label: 'Table' },
                        { id: 'timeline', icon: Clock, label: 'Timeline' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id as any)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all relative whitespace-nowrap",
                                view === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <t.icon className="h-4 w-4" /> {t.label}
                            {view === t.id && <motion.div layoutId="view-tab" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find tasks..."
                            className="h-10 pl-10 w-full md:w-[200px] rounded-xl border-border bg-background/50 focus:ring-primary/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-xl font-bold gap-2 text-muted-foreground">
                                <ArrowUpRight className="h-4 w-4" /> Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-border shadow-xl w-48">
                            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortBy('createdAt')} className="font-bold cursor-pointer">Date Created</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('dueDate')} className="font-bold cursor-pointer">Due Date</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('priority')} className="font-bold cursor-pointer">Priority</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('title')} className="font-bold cursor-pointer">Alphabetical</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Group Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-xl font-bold gap-2 text-muted-foreground">
                                <Settings2 className="h-4 w-4" /> Group by
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-border shadow-xl w-48">
                            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Group tasks by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setGroupBy('status')} className="font-bold cursor-pointer">Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGroupBy('project')} className="font-bold cursor-pointer">Project</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGroupBy('priority')} className="font-bold cursor-pointer">Priority</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGroupBy('none')} className="font-bold cursor-pointer">None</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-xl font-bold gap-2 text-muted-foreground">
                                <Filter className="h-4 w-4" /> Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-border shadow-xl w-56 p-2 space-y-2">
                            <div className="px-2 py-1.5 font-black uppercase text-[10px] tracking-widest text-primary">Status</div>
                            <div className="grid grid-cols-2 gap-1">
                                {(['all', 'pending', 'in_progress', 'completed'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold border transition-all truncate",
                                            statusFilter === s ? "bg-primary text-white border-primary" : "border-border hover:bg-secondary"
                                        )}
                                    >
                                        {s === 'pending' ? 'To Do' : s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <div className="px-2 py-1.5 font-black uppercase text-[10px] tracking-widest text-primary">Priority</div>
                            <div className="grid grid-cols-2 gap-1">
                                {(['all', 'high', 'medium', 'low'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriorityFilter(p)}
                                        className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold border transition-all",
                                            priorityFilter === p ? "bg-primary text-white border-primary" : "border-border hover:bg-secondary"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="min-h-[600px]">
                {view === 'board' ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {COLUMNS.map((column) => (
                                <div key={column.id} className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-3 w-3 rounded-full", column.color)} />
                                            <h3 className="font-black text-sm uppercase tracking-widest">{column.title}</h3>
                                            <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">{processedTasks.filter(t => t.status === column.id).length}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "min-h-[500px] rounded-2xl transition-colors duration-200 p-2",
                                                    snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/10" : "bg-transparent"
                                                )}
                                            >
                                                {processedTasks
                                                    .filter(task => task.status === column.id)
                                                    .map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <KanbanCard
                                                                    task={task}
                                                                    innerRef={provided.innerRef}
                                                                    draggableProps={provided.draggableProps}
                                                                    dragHandleProps={provided.dragHandleProps}
                                                                    isDragging={snapshot.isDragging}
                                                                    onClick={() => setSelectedTask(task)}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                ) : view === 'list' ? (
                    <Card className="glass shadow-xl overflow-hidden rounded-2xl border-border/50">
                        <div className="divide-y divide-border">
                            {processedTasks.length > 0 ? processedTasks.map((task) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={task.id}
                                    className="p-5 flex items-center justify-between transition-all group cursor-pointer hover:bg-accent/30"
                                    onClick={() => setSelectedTask(task)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                            task.status === 'completed' ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                                        )}>
                                            {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                        </div>
                                        <div>
                                            <h4 className={cn("font-bold text-sm", task.status === 'completed' && "line-through opacity-50")}>{task.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <span className="text-primary">{task.project.name}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center text-muted-foreground font-black uppercase text-xs tracking-widest opacity-50">No tasks found.</div>
                            )}
                        </div>
                    </Card>
                ) : view === 'table' ? (
                    <TaskTable tasks={processedTasks} onTaskClick={setSelectedTask} />
                ) : (
                    <TaskTimeline tasks={processedTasks} onTaskClick={setSelectedTask} />
                )}
            </div>

            <TaskDetailsDrawer
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onTaskUpdate={fetchData}
            />

            {/* Invitation System Overlay */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card glass border border-border shadow-2xl rounded-3xl p-8 w-full max-w-xl space-y-8"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tighter">Team <span className="text-gradient">Expansion</span></h2>
                                    <p className="text-muted-foreground font-semibold">Invite members to collaborate on your projects.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsInviteModalOpen(false)} className="rounded-full">
                                    <Plus className="h-6 w-6 rotate-45" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-primary">Target Project</label>
                                <ProjectSelector
                                    projects={projects}
                                    selectedProjectId={inviteProjectId}
                                    onSelect={setInviteProjectId}
                                    className="h-14 text-base"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-blue-glow active:scale-[0.98] transition-all"
                                    onClick={() => {
                                        if (inviteProjectId) {
                                            setIsInvitationStepTwo(true);
                                            setIsInviteModalOpen(false);
                                        }
                                    }}
                                >
                                    Proceed to Send Invite
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <InvitationModal
                isOpen={isInvitationStepTwo}
                projectId={inviteProjectId}
                onClose={() => setIsInvitationStepTwo(false)}
                onSuccess={() => {
                    setIsInvitationStepTwo(false);
                    fetchData();
                }}
            />
        </div>
    );
}
