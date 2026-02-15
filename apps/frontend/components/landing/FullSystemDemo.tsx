'use client';

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4 }
    })
};

export default function FullSystemDemo() {
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            y: [0, -4, 0],
            transition: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        });
    }, [controls]);

    return (
        <div className="relative mx-auto max-w-6xl pt-28 px-6">

            {/* Subtle Background Grid */}
            <div className="absolute inset-0 -z-10 opacity-40">
                <div className="w-full h-full bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Floating glow (dark adaptive) */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 10 }}
                className="absolute -top-16 left-10 w-80 h-80 bg-primary/20 dark:bg-blue-500/20 rounded-full blur-3xl"
            />

            {/* Multi-layer glass depth */}
            <div className="absolute inset-0 scale-[1.02] rounded-3xl bg-gradient-to-br from-primary/10 to-blue-400/10 blur-2xl opacity-30 -z-10" />

            <motion.div
                animate={controls}
                className="relative backdrop-blur-xl bg-background/70 border border-border rounded-3xl overflow-hidden shadow-2xl"
            >

                {/* HEADER */}
                <div className="h-11 border-b flex items-center px-6 text-xs text-muted-foreground justify-between bg-muted/40">

                    <span>projectmaster.io/dashboard</span>

                    <div className="flex items-center gap-4">

                        {/* Animated status transition */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
                            className="text-[10px] bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded-full"
                        >
                            Active
                        </motion.div>

                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary" />
                            <div className="text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Owner
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex">

                    {/* SIDEBAR */}
                    <div className="w-60 border-r p-6 space-y-6 bg-muted/10">
                        <SidebarItem />
                        <SidebarItem />
                        <SidebarItem />
                        <SidebarItem />
                    </div>

                    {/* MAIN */}
                    <div className="flex-1 p-8 space-y-10">

                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-6 w-56 bg-muted rounded" />
                                <div className="h-4 w-80 bg-muted rounded" />
                            </div>
                            <div className="h-9 w-32 bg-primary/20 rounded-xl" />
                        </div>

                        {/* INTERACTIVE COLUMN DRAG ILLUSION */}
                        <div className="grid grid-cols-3 gap-6">

                            {["Pending", "In Progress", "Completed"].map((status, colIndex) => (
                                <motion.div
                                    key={status}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="space-y-4 bg-muted/20 p-4 rounded-2xl"
                                >

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold">{status}</div>
                                        <div className="text-[10px] bg-muted px-2 py-1 rounded-full">
                                            {colIndex === 0 ? 4 : colIndex === 1 ? 2 : 6}
                                        </div>
                                    </div>

                                    {[1, 2].map((task, i) => (
                                        <motion.div
                                            key={i}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="visible"
                                            custom={colIndex * 2 + i}
                                            whileHover={{ y: -6, rotate: -0.5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="p-4 rounded-xl border bg-card shadow-sm cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                                            <div className="h-3 w-1/2 bg-muted rounded mb-3" />

                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>High Priority</span>
                                                <div className="h-5 w-5 rounded-full bg-primary/40" />
                                            </div>
                                        </motion.div>
                                    ))}

                                </motion.div>
                            ))}

                        </div>

                        {/* LIVE ACTIVITY SCROLL ILLUSION */}
                        <div className="border-t pt-6 space-y-3 overflow-hidden h-24 relative">

                            <motion.div
                                animate={{ y: [0, -60, 0] }}
                                transition={{ repeat: Infinity, duration: 8 }}
                                className="space-y-3"
                            >
                                <ActivityItem text="John moved task to In Progress" />
                                <ActivityItem text="Sarah updated project description" />
                                <ActivityItem text="Admin archived sprint project" />
                            </motion.div>

                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ---------- Components ---------- */

function SidebarItem() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-muted rounded-full" />
            <div className="h-4 w-24 bg-muted rounded" />
        </div>
    );
}

function ActivityItem({ text }: { text: string }) {
    return (
        <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg">
            {text}
        </div>
    );
}
