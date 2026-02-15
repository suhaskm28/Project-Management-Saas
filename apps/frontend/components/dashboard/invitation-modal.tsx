'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface InvitationModalProps {
    isOpen: boolean;
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function InvitationModal({ isOpen, projectId, onClose, onSuccess }: InvitationModalProps) {
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<'member' | 'owner'>('member');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await api(`/projects/${projectId}/members`, {
                method: 'POST',
                body: JSON.stringify({ email, role }),
            });
            onSuccess();
            onClose();
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md glass-card p-8 border border-white/20 shadow-2xl relative"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                    <UserPlus className="h-3 w-3 stroke-[1.5px]" />
                                    Team Expansion
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Invite <span className="text-gradient">Member</span></h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5 stroke-[1.5px]" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-primary stroke-[1.5px]" /> Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 bg-white/5 border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 flex items-center gap-2">
                                    <Shield className="h-3 w-3 text-primary stroke-[1.5px]" /> Workspace Role
                                </label>
                                <div className="flex gap-2">
                                    {(['member', 'admin', 'owner'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r as any)}
                                            className={cn(
                                                "flex-1 h-10 rounded-lg border font-bold text-xs transition-all capitalize",
                                                role === r
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                            )}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">
                                    {role === 'owner'
                                        ? 'Owners have full administrative access to project settings.'
                                        : 'Members can manage tasks and view project progress.'}
                                </p>
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
                                    disabled={loading || !email.trim()}
                                    className="flex-[2] h-12 font-bold text-lg gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-blue-glow active:scale-95"
                                >
                                    {loading ? 'Sending...' : (
                                        <>
                                            Send Invite <Rocket className="h-5 w-5 stroke-[1.5px]" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
