"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Swaps its children for a spinner while the nearest parent <Link> is
 * navigating. Must be rendered inside a <Link>.
 */
export function LinkPending({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { pending } = useLinkStatus();
    if (pending) {
        return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
    }
    return <>{children}</>;
}
