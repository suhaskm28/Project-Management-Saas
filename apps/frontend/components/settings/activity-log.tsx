import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import {
    FolderPlus,
    FileEdit,
    Trash2,
    UserPlus,
    UserMinus,
    ShieldAlert,
    PlusCircle,
    CheckCircle2,
    MessageSquare,
    Activity as ActivityIcon,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLogEntry {
    id: string;
    action: string;
    metadata?: any;
    createdAt: string;
    user?: {
        fullName: string;
        email: string;
    };
    project?: {
        name: string;
    };
}

interface ActivityLogProps {
    activities: ActivityLogEntry[];
    loading?: boolean;
}

const actionIcons: Record<string, any> = {
    PROJECT_CREATED: FolderPlus,
    PROJECT_UPDATED: FileEdit,
    PROJECT_DELETED: Trash2,
    MEMBER_ADDED: UserPlus,
    MEMBER_REMOVED: UserMinus,
    MEMBER_ROLE_UPDATED: ShieldAlert,
    TASK_CREATED: PlusCircle,
    TASK_UPDATED: FileEdit,
    TASK_DELETED: Trash2,
    TASK_STATUS_CHANGED: CheckCircle2,
    COMMENT_ADDED: MessageSquare,
};

export function ActivityLog({ activities, loading }: ActivityLogProps) {
    if (loading) {
        return (
            <Card className="glass shadow-xl rounded-2xl border-border overflow-hidden">
                <CardHeader className="bg-secondary/5 border-b border-border/60 pb-6">
                    <CardTitle className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <History className="h-5 w-5 stroke-[1.5px]" /> Activity Log
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-tight opacity-70">
                        Refining recent timeline...
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 w-10 rounded-xl bg-muted shadow-inner" />
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-3 bg-muted rounded-full w-3/4" />
                                    <div className="h-2 bg-muted rounded-full w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <Card className="glass shadow-xl rounded-2xl border-border overflow-hidden">
                <CardHeader className="bg-secondary/5 border-b border-border/60 pb-6">
                    <CardTitle className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <History className="h-5 w-5 stroke-[1.5px]" /> Activity Log
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-tight opacity-70">
                        Your recent account activity history.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 mb-4 shadow-inner ring-1 ring-border">
                        <ActivityIcon className="h-8 w-8 text-muted-foreground/30 stroke-[1.5px]" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        No recent activity recorded
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass shadow-xl rounded-2xl border-border overflow-hidden">
            <CardHeader className="bg-secondary/5 border-b border-border/60 pb-6">
                <CardTitle className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <History className="h-5 w-5 stroke-[1.5px]" /> Activity Log
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-tight opacity-70">
                    Your recent account activity timeline.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border/80 before:to-border/20">
                    {activities.map((activity) => {
                        const Icon = actionIcons[activity.action] || ActivityIcon;
                        return (
                            <div
                                key={activity.id}
                                className="relative flex items-center gap-4 group transition-all"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border shadow-soft group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 transition-all z-10">
                                    <Icon className="h-5 w-5 stroke-[1.5px]" />
                                </div>
                                <div className="flex-1 py-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div>
                                            <p className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                                {formatAction(activity.action, activity.metadata)}
                                            </p>
                                            {activity.project && (
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                                                    in {activity.project.name}
                                                </p>
                                            )}
                                        </div>
                                        <time className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0 opacity-80">
                                            {formatDistanceToNow(new Date(activity.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function formatAction(action: string, metadata?: any): string {
    const actionMap: Record<string, string> = {
        PROJECT_CREATED: 'Created project',
        PROJECT_UPDATED: 'Updated project',
        PROJECT_DELETED: 'Deleted project',
        MEMBER_ADDED: 'Added team member',
        MEMBER_REMOVED: 'Removed team member',
        MEMBER_ROLE_UPDATED: 'Updated member role',
        TASK_CREATED: 'Created task',
        TASK_UPDATED: 'Updated task',
        TASK_DELETED: 'Deleted task',
        TASK_STATUS_CHANGED: 'Changed task status',
        COMMENT_ADDED: 'Added comment',
    };

    let formattedAction = actionMap[action] || action.replace(/_/g, ' ').toLowerCase();

    if (metadata?.name || metadata?.title) {
        formattedAction += ` "${metadata.name || metadata.title}"`;
    }

    return formattedAction;
}
