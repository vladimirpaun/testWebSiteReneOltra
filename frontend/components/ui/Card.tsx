import { HTMLAttributes, ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
