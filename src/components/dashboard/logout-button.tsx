"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/lib/actions/auth";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SignOutButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();
  if (compact) {
    return (
      <button
        type="submit"
        disabled={pending}
        aria-label="Sign out"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </button>
    );
  }
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function LogoutButton({
  compact,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <form action={logoutAction} className={cn(className)}>
      <SignOutButton compact={compact} />
    </form>
  );
}
