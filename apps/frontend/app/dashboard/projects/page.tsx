'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, LayoutGrid, ListFilter, SlidersHorizontal, Sparkles, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateProjectModal } from '@/components/dashboard/create-project-modal';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    members?: {
        user: {
            fullName: string;
            profile?: { avatarUrl?: string };
        };
    }[];
    _count?: {
        members: number;
        tasks: number;
    };
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Management states
    const [activeTab, setActiveTab] = useState<'all' | 'shared' | 'archived'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            // Map tabs to backend filter types
            const typeParam = activeTab === 'all' ? 'all' : activeTab === 'shared' ? 'shared' : 'archived';
            const data = await api<Project[]>(`/projects?type=${typeParam}`);
            setProjects(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [activeTab]);

    // Client-side search filtering
    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && projects.length === 0) return (
        <div className="flex flex-col gap-8 h-full">
            <div className="h-32 w-full bg-primary/5 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 w-full bg-primary/5 rounded-xl animate-pulse" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider"
                    >
                        <Sparkles className="h-4 w-4 stroke-[1.5px]" />
                        Projects
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold tracking-tight"
                    >
                        Your <span className="text-gradient">Projects</span>
                    </motion.h1>
                    <p className="text-muted-foreground max-w-lg">
                        Manage all your active workspaces and team collaborations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Input
                            placeholder="Search projects..."
                            className="w-64 h-11 pl-10 pr-4 rounded-xl border-border bg-card shadow-soft focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <SlidersHorizontal className="h-4 w-4 stroke-[1.5px]" />
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="gap-2 rounded-xl shadow-lg shadow-primary/25 transition-all font-black uppercase tracking-widest h-11 px-6 bg-primary hover:shadow-blue-glow"
                        >
                            <Plus className="h-4 w-4 stroke-[1.5px]" />
                            Create Project
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "text-sm pb-4 -mb-4 px-1 transition-all",
                                activeTab === 'all' ? "font-bold border-b-2 border-primary text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('shared')}
                            className={cn(
                                "text-sm pb-4 -mb-4 px-1 transition-all",
                                activeTab === 'shared' ? "font-bold border-b-2 border-primary text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Shared with me
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={cn(
                                "text-sm pb-4 -mb-4 px-1 transition-all",
                                activeTab === 'archived' ? "font-bold border-b-2 border-primary text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Archived
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/60 shadow-inner">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "h-8 w-8 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-background shadow-soft ring-1 ring-border text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4 stroke-[1.5px]" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "h-8 w-8 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-background shadow-soft ring-1 ring-border text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <ListFilter className="h-4 w-4 stroke-[1.5px]" />
                        </Button>
                    </div>
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20 gap-4">
                        <p className="text-destructive font-medium">Error fetching projects: {error}</p>
                        <Button variant="outline" onClick={() => fetchProjects()}>Try Again</Button>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border/50 text-center space-y-6 shadow-inner">
                        <div className="h-24 w-24 bg-gradient-to-br from-primary/10 to-blue-500/5 rounded-full flex items-center justify-center shadow-soft">
                            <Plus className="h-10 w-10 text-primary opacity-40 stroke-[1.5px]" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">{searchQuery ? 'No matches found' : 'No projects yet'}</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                {searchQuery ? `We couldn't find any projects matching "${searchQuery}"` : 'Click the button above to create your first project and start collaborating.'}
                            </p>
                        </div>
                        {!searchQuery && (
                            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 mt-4 font-bold rounded-xl h-11 px-6 transition-all hover:scale-[1.05] hover:shadow-blue-glow">
                                <Plus className="h-4 w-4 stroke-[1.5px]" />
                                Create Your First Project
                            </Button>
                        )}
                        {searchQuery && (
                            <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4 font-bold rounded-xl">
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-8",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredProjects.map((p, i) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                index={i}
                                onRefresh={fetchProjects}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchProjects}
            />
        </div>
    );
}
