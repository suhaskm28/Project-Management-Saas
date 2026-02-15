'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, FolderPlus, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await api('/projects', {
                method: 'POST',
                body: JSON.stringify({ name, description }),
            });
            onSuccess();
            onClose();
            setName('');
            setDescription('');
        } catch (err: any) {
            setError(err.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg bg-card p-8 border border-border shadow-2xl overflow-hidden relative rounded-3xl"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                        <Sparkles className="h-3 w-3 stroke-[1.5px]" />
                                        Workspace
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight">Create <span className="text-gradient">Project</span></h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-accent transition-colors">
                                    <X className="h-5 w-5 stroke-[1.5px]" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Project Name</label>
                                    <Input
                                        placeholder="E.g. Lunar Launchpad"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="h-12 bg-secondary border-border focus:border-primary/50 text-lg rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1">Description (Optional)</label>
                                    <textarea
                                        placeholder="Briefly describe the vision..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full min-h-[120px] rounded-xl bg-secondary border border-border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                                    />
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
                                        disabled={loading || !name.trim()}
                                        className="flex-[2] h-12 font-bold text-lg gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-blue-glow active:scale-95"
                                    >
                                        {loading ? 'Creating...' : (
                                            <>
                                                Initialize <Rocket className="h-5 w-5 stroke-[1.5px]" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
