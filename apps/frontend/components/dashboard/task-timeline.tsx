'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    createdAt: string;
    project: {
        name: string;
    };
}

interface TaskTimelineProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskTimeline({ tasks, onTaskClick }: TaskTimelineProps) {
    // Basic timeline logic: group tasks by month/week
    const sortedTasks = [...tasks].sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.createdAt).getTime();
        const db = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.createdAt).getTime();
        return da - db;
    });

    const tasksByDate = React.useMemo(() => {
        const groups: Record<string, Task[]> = {};
        sortedTasks.forEach(task => {
            const date = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
            const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        });
        return groups;
    }, [sortedTasks]);

    return (
        <div className="space-y-12 py-8">
            {Object.entries(tasksByDate).map(([date, groupTasks]) => (
                <div key={date} className="relative">
                    {/* Month Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-border/60" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary bg-background px-4 py-2 rounded-full border border-border shadow-soft flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> {date}
                        </h3>
                        <div className="h-px flex-1 bg-border/60" />
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary before:to-transparent before:opacity-30">
                        {groupTasks.map((task, i) => {
                            const dateObj = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative flex gap-8 group pl-2"
                                    onClick={() => onTaskClick(task)}
                                >
                                    {/* Timeline Marker */}
                                    <div className="h-10 w-10 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>

                                    {/* Task Card */}
                                    <div className="flex-1 glass p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all shadow-soft group-hover:-translate-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <h4 className={cn("font-bold text-sm", task.status === 'completed' && "line-through opacity-50")}>
                                                    {task.title}
                                                </h4>
                                                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-1.5">
                                                    <LayoutGrid className="h-2.5 w-2.5" />
                                                    {task.project.name}
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "h-8 px-3 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-tighter",
                                                task.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                                                    task.status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                                        "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {task.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 opacity-50">
                    <Calendar className="h-16 w-16 mb-4 text-muted-foreground/20" />
                    <p className="text-xs font-black uppercase tracking-widest">No tasks scheduled yet</p>
                </div>
            )}
        </div>
    );
}
