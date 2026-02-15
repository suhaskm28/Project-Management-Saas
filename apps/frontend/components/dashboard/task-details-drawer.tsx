'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    MessageSquare,
    Send,
    Clock,
    User,
    CheckCircle2,
    Circle,
    Calendar,
    Flag,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
}

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: number;
    dueDate?: string;
    assignee?: {
        fullName: string;
    };
}

interface TaskDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onTaskUpdate: () => void;
}

export function TaskDetailsDrawer({ isOpen, onClose, task, onTaskUpdate }: TaskDetailsDrawerProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const fetchComments = async () => {
        if (!task) return;
        setIsLoadingComments(true);
        try {
            const data = await api<Comment[]>(`/tasks/${task.id}/comments`);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !task || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api(`/tasks/${task.id}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: newComment }),
            });
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async () => {
        if (!task) return;
        try {
            const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
            await api(`/tasks/${task.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: nextStatus }),
            });
            onTaskUpdate();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async () => {
        if (!task || !confirm('Are you sure you want to delete this task?')) return;
        setIsSubmitting(true);
        try {
            await api(`/tasks/${task.id}`, { method: 'DELETE' });
            onClose();
            onTaskUpdate();
        } catch (err) {
            console.error('Failed to delete task:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen && task) {
            fetchComments();
        } else {
            setComments([]);
        }
    }, [isOpen, task?.id]);

    if (!task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-white/10 z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleStatus}
                                    className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors"
                                >
                                    {task.status === 'completed' ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                                <h2 className="text-xl font-bold truncate pr-4">{task.title}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    className="rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                    title="Delete Task"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" title="Close">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</p>
                                    <div className={cn(
                                        "flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold w-fit border",
                                        task.priority >= 3 ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                            task.priority === 2 ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    )}>
                                        <Flag className="h-3 w-3" />
                                        {task.priority >= 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due Date</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assignee</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {task.assignee ? task.assignee.fullName : 'Unassigned'}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" /> Description
                                </h3>
                                <div className="p-4 rounded-xl bg-primary/5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[100px]">
                                    {task.description || 'No description provided for this task.'}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" /> Activity & Comments
                                </h3>

                                {/* Comment Feed */}
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-[10px] ring-1 ring-primary/10 flex-shrink-0">
                                                {comment.user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold">{comment.user.fullName}</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-muted/30 text-xs leading-relaxed">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && !isLoadingComments && (
                                        <div className="py-8 text-center text-xs text-muted-foreground italic bg-primary/5 rounded-xl">
                                            No comments yet. Be the first to start the conversation!
                                        </div>
                                    )}
                                    {isLoadingComments && (
                                        <div className="space-y-4 animate-pulse">
                                            {[1, 2].map(i => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-2 w-1/4 bg-muted rounded" />
                                                        <div className="h-10 bg-muted rounded-xl" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Input Area */}
                        <div className="p-6 border-t border-white/10 bg-card">
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-primary/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none custom-scrollbar min-h-[44px] max-h-[120px]"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment(e);
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="rounded-xl h-11 w-11 flex-shrink-0 shadow-lg shadow-primary/20"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                            <p className="mt-2 text-[10px] text-muted-foreground text-center">
                                Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
