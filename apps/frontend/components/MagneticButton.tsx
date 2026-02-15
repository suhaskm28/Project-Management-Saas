'use client';

import { useRef } from "react";
import { motion } from "framer-motion";

export default function MagneticButton({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        ref.current!.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    }

    function handleMouseLeave() {
        if (ref.current) {
            ref.current.style.transform = "translate(0px, 0px)";
        }
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`inline-flex ${className}`}
            style={{ willChange: "transform" }}
        >
            {children}
        </motion.div>
    );
}
