import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // Duolingo Green - Primary Action
                primary:
                    "bg-green-500 text-white border-green-600 border-b-4 hover:bg-green-500/90 active:border-b-0 active:translate-y-[2px]",

                // Duolingo Blue - Lesson/Info
                secondary:
                    "bg-sky-500 text-white border-sky-600 border-b-4 hover:bg-sky-500/90 active:border-b-0 active:translate-y-[2px]",

                // Duolingo Red - Error/Danger
                danger:
                    "bg-rose-500 text-white border-rose-600 border-b-4 hover:bg-rose-500/90 active:border-b-0 active:translate-y-[2px]",

                // Premium/Super - Golden gradient
                super:
                    "bg-gradient-to-b from-amber-400 to-amber-500 text-white border-amber-600 border-b-4 hover:from-amber-400/90 hover:to-amber-500/90 active:border-b-0 active:translate-y-[2px]",

                // Ghost - Minimal style
                ghost:
                    "bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800",

                // Outline/Sidebar style
                sidebar:
                    "bg-transparent text-slate-500 border-2 border-slate-200 hover:bg-slate-100 transition-none",

                // Sidebar active state
                sidebarOutline:
                    "bg-sky-500/15 text-sky-500 border-sky-300 border-2 hover:bg-sky-500/20 transition-none",

                // Locked lesson style
                locked:
                    "bg-slate-200 text-slate-400 border-slate-300 border-b-4 hover:bg-slate-200 cursor-not-allowed",
            },
            size: {
                default: "h-11 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-12 px-8",
                icon: "h-10 w-10",
                rounded: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
