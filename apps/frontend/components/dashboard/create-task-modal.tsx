'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, CheckSquare, Rocket, Calendar as CalendarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
    userId: string;
    user: {
        id: string;
        fullName: string;
    };
}

interface CreateTaskModalProps {
    isOpen: boolean;
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTaskModal({ isOpen, projectId, onClose, onSuccess }: CreateTaskModalProps) {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [priority, setPriority] = React.useState(1);
    const [dueDate, setDueDate] = React.useState('');
    const [assignedTo, setAssignedTo] = React.useState<string | undefined>(undefined);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen && projectId) {
            api<Member[]>(`/projects/${projectId}/members`).then(setMembers).catch(console.error);
        }
    }, [isOpen, projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await api(`/projects/${projectId}/tasks`, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    priority: Number(priority),
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    assignedTo: assignedTo === 'none' ? undefined : assignedTo
                }),
            });
            onSuccess();
            onClose();
            setTitle('');
            setDescription('');
            setPriority(1);
            setDueDate('');
            setAssignedTo(undefined);
        } catch (err: any) {
            setError(err.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg glass-card p-8 border border-white/20 dark:border-white/5 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                    <CheckSquare className="h-3 w-3" />
                                    Task Assignment
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">New <span className="text-gradient">Task</span></h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                                <X className="h-5 w-5 stroke-[1.5px]" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Task Title</label>
                                <Input
                                    placeholder="E.g. Design initial wireframes"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Description</label>
                                <textarea
                                    placeholder="Add more details about this task..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[80px] rounded-xl bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3 text-primary" /> Due Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-11 bg-white/5 border-white/10 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" /> Assignee
                                    </label>
                                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                                        <SelectTrigger className="h-11 bg-white/5 border-white/10 focus:ring-primary/20">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.userId} value={member.userId}>
                                                    {member.user.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Priority (1-5)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={cn(
                                                "flex-1 h-10 rounded-lg border font-bold text-xs transition-all",
                                                priority === p
                                                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                            )}
                                        >
                                            {p === 1 ? 'Low' : p === 3 ? 'Med' : p === 5 ? 'High' : p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" className="flex-1 h-12 font-bold" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !title.trim()}
                                    className="flex-[2] h-12 font-bold text-lg gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-blue-glow active:scale-95"
                                >
                                    {loading ? 'Adding...' : 'Add Task'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
