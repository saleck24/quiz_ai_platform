import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
