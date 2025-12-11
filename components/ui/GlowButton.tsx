'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: 'primary' | 'danger' | 'ghost';
    isLoading?: boolean;
    icon?: any;
}

export default function GlowButton({
    children,
    className,
    variant = 'primary',
    isLoading,
    icon: Icon,
    disabled,
    ...props
}: GlowButtonProps) {

    const variants = {
        primary: 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] border border-blue-500/50',
        danger: 'bg-red-600/80 hover:bg-red-500 text-white shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_-5px_rgba(220,38,38,0.7)] border border-red-500/50',
        ghost: 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled || isLoading}
            className={clsx(
                'relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm',
                variants[variant],
                (disabled || isLoading) && 'opacity-50 cursor-not-allowed grayscale',
                className
            )}
            {...props}
        >
            {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : Icon ? (
                <Icon size={18} />
            ) : null}
            {children}
        </motion.button>
    );
}
