'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PlaceholderPage({ title = "Page" }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary"
            >
                <Construction className="h-12 w-12" />
            </motion.div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">{title} is under construction</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    We're working hard to bring you the best experience. Check back soon for new features!
                </p>
            </div>
            <Link href="/dashboard">
                <Button className="gap-2 font-bold px-8 h-12">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>
        </div>
    );
}
