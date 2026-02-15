'use client';

import { motion } from 'framer-motion';
import {
    Calendar,
    Flag,
    MessageSquare,
    Link as LinkIcon,
    CheckSquare,
    MoreHorizontal,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface KanbanCardProps {
    task: {
        id: string;
        title: string;
        description?: string;
        status: string;
        priority: number;
        dueDate?: string;
        assignee?: {
            fullName: string;
        };
        project?: {
            name: string;
        };
    };
    onClick?: () => void;
    innerRef?: (el: HTMLElement | null) => void;
    draggableProps?: any;
    dragHandleProps?: any;
    isDragging?: boolean;
}

export function KanbanCard({
    task,
    onClick,
    innerRef,
    draggableProps,
    dragHandleProps,
    isDragging
}: KanbanCardProps) {
    const priorityInfo = {
        3: { label: 'High', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        2: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        1: { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    }[task.priority as 1 | 2 | 3] || { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };

    // Map internal status to display status (like "In Research" from screenshot)
    // For now we use the raw status or a friendly version
    const statusLabel = task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={cn(
                "mb-4 last:mb-0 transition-all duration-200",
                isDragging && "scale-105 rotate-2 z-50 shadow-2xl"
            )}
        >
            <Card
                onClick={onClick}
                className={cn(
                    "glass border-border/50 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all rounded-2xl overflow-hidden",
                    "p-4 space-y-4 group relative",
                    isDragging && "border-primary ring-2 ring-primary/20"
                )}
            >
                <div className="flex items-center justify-between">
                    <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-bold border",
                        task.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' :
                            task.status === 'in_progress' ? 'border-purple-500/20 bg-purple-500/10 text-purple-500' :
                                'border-blue-500/20 bg-blue-500/10 text-blue-500'
                    )}>
                        {statusLabel}
                    </span>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-1">
                    <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assignees :</p>
                        <div className="flex -space-x-2">
                            {task.assignee ? (
                                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-blue-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10" title={task.assignee.fullName}>
                                    {task.assignee.fullName.charAt(0)}
                                </div>
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            {task.dueDate && (
                                <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                    <Flag className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                        <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                            priorityInfo.bg,
                            priorityInfo.color,
                            priorityInfo.border
                        )}>
                            {priorityInfo.label}
                        </span>
                    </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-[10px]">
                            <MessageSquare className="h-3 w-3" />
                            <span>12</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                            <LinkIcon className="h-3 w-3" />
                            <span>1</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                            <CheckSquare className="h-3 w-3" />
                            <span>2/3</span>
                        </div>
                    </div>
                    {task.project && (
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                            {task.project.name}
                        </span>
                    )}
                </div>
            </Card>
        </div>
    );
}
