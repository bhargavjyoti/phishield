import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function GlassCard({ className, children, hoverEffect = false, ...props }) {
    return (
        <div
            className={twMerge(
                clsx(
                    'glass-panel rounded-2xl p-6 transition-all duration-300',
                    hoverEffect && 'hover:bg-glass-highlight hover:scale-[1.01] hover:shadow-lg hover:shadow-neon-blue/10',
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
}
