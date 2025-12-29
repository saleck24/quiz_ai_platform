import * as React from "react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./LoadingSpinner";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    variant === 'default' && "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500 shadow-sm",
                    variant === 'secondary' && "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-sm",
                    variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
                    variant === 'outline' && "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-500",
                    variant === 'ghost' && "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500",
                    size === 'default' && "h-10 px-5 py-2",
                    size === 'sm' && "h-9 rounded-lg px-4 text-xs",
                    size === 'lg' && "h-12 rounded-xl px-8",
                    size === 'icon' && "h-10 w-10",
                    className
                )}
                disabled={disabled || isLoading}
                ref={ref}
                {...props}
            >
                {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
