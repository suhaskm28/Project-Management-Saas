'use client';

import { useState } from "react";

export default function SpotlightCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden rounded-3xl border bg-background ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.15), transparent 40%)`,
                }}
            />
            <div className="relative z-10 p-8">
                {children}
            </div>
        </div>
    );
}
