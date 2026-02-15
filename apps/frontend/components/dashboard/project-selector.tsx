'use client';

import * as React from 'react';
import {
    Check,
    ChevronsUpDown,
    LayoutGrid,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Project {
    id: string;
    name: string;
}

interface ProjectSelectorProps {
    projects: Project[];
    selectedProjectId?: string;
    onSelect: (projectId: string) => void;
    placeholder?: string;
    className?: string;
}

export function ProjectSelector({
    projects,
    selectedProjectId,
    onSelect,
    placeholder = "Select a project...",
    className
}: ProjectSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between rounded-xl border-border bg-background/50 backdrop-blur-sm font-bold",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <LayoutGrid className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">
                            {selectedProject ? selectedProject.name : placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-2xl border-border shadow-2xl" align="start">
                <Command className="rounded-2xl bg-background">
                    <CommandInput placeholder="Search projects..." className="h-12 border-none focus:ring-0" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-xs font-bold uppercase tracking-widest opacity-50">
                            No projects found.
                        </CommandEmpty>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                        onSelect(project.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-primary/5 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-black group-aria-selected:bg-primary group-aria-selected:text-primary-foreground">
                                            {project.name[0]}
                                        </div>
                                        <span className="font-bold text-sm">{project.name}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4 text-primary",
                                            selectedProjectId === project.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
