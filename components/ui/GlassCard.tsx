'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

export default function GlassCard({ children, className, onClick, hoverEffect = true }: GlassCardProps) {
    return (
        <motion.div
            whileHover={hoverEffect ? { scale: 1.02, y: -2 } : {}}
            whileTap={hoverEffect ? { scale: 0.98 } : {}}
            onClick={onClick}
            className={clsx(
                'glass-card rounded-2xl p-6 relative overflow-hidden group',
                className
            )}
        >
            {/* Subtle shine effect on hover */}
            {hoverEffect && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}
            {children}
        </motion.div>
    );
}
