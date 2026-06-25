import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A full-screen centered spinner over a blurred backdrop. Used as route-level
 * loading UI so the surrounding chrome stays visible (and blurred) while the
 * next page loads.
 */
export function LoadingOverlay({
  variant = "light",
  label,
}: {
  variant?: "light" | "dark";
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur-sm",
        variant === "dark" ? "bg-[#0a0d14]/50" : "bg-white/50"
      )}
    >
      <Loader2
        className={cn(
          "h-10 w-10 animate-spin",
          variant === "dark" ? "text-white" : "text-slate-900"
        )}
      />
      {label && (
        <span
          className={cn(
            "text-sm font-medium",
            variant === "dark" ? "text-white/80" : "text-slate-600"
          )}
        >
          {label}
        </span>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}
