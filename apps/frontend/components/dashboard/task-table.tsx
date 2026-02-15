'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Circle,
    Calendar,
    User,
    LayoutGrid,
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: number;
    dueDate?: string;
    project: {
        name: string;
    };
    assignee?: {
        fullName: string;
    };
}

interface TaskTableProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
    return (
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border/60 bg-secondary/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Task Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignee</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {tasks.map((task) => (
                            <tr
                                key={task.id}
                                className="group hover:bg-primary/5 transition-all cursor-pointer"
                                onClick={() => onTaskClick(task)}
                            >
                                <td className="px-6 py-4">
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        task.status === 'completed' ? "bg-primary border-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                                    )}>
                                        {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        task.status === 'completed' && "line-through opacity-50"
                                    )}>
                                        {task.title}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        <LayoutGrid className="h-3 w-3" />
                                        {task.project.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={cn(
                                        "text-[9px] font-black uppercase tracking-widest border-transparent",
                                        task.priority >= 3 ? "bg-red-500/10 text-red-500" :
                                            task.priority === 2 ? "bg-amber-500/10 text-amber-500" :
                                                "bg-blue-500/10 text-blue-500"
                                    )}>
                                        {task.priority >= 3 ? "High" : task.priority === 2 ? "Med" : "Low"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '--'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">
                                            {task.assignee?.fullName[0] || '?'}
                                        </div>
                                        <span className="text-[11px] font-bold">{task.assignee?.fullName || 'Unassigned'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tasks.length === 0 && (
                <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">
                    No tasks found matching current filters.
                </div>
            )}
        </div>
    );
}
