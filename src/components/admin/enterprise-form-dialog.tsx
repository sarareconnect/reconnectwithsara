"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  createEnterprise,
  updateEnterprise,
  type ActionResult,
} from "@/lib/actions/enterprises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EnterpriseFormValues {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string | null;
  username: string;
  status: "ACTIVE" | "SUSPENDED";
}

interface EnterpriseFormDialogProps {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  initial?: EnterpriseFormValues;
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Saving…"
        : mode === "create"
          ? "Create enterprise"
          : "Save changes"}
    </Button>
  );
}

export function EnterpriseFormDialog({
  mode,
  trigger,
  initial,
}: EnterpriseFormDialogProps) {
  const action = mode === "create" ? createEnterprise : updateEnterprise;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">(
    initial?.status ?? "ACTIVE"
  );
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) {
      toast.success(
        mode === "create" ? "Enterprise created" : "Enterprise updated"
      );
      setOpen(false);
    }
  }, [state.ok, mode]);

  const fieldError = (key: string) => state.fieldErrors?.[key];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New enterprise" : "Edit enterprise"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a client account and assign login credentials."
              : "Update enterprise details and credentials."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {mode === "edit" && initial && (
            <input type="hidden" name="id" value={initial.id} />
          )}
          <input type="hidden" name="status" value={status} />

          <div className="space-y-2">
            <Label htmlFor="name">Enterprise name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial?.name}
              placeholder="Acme Retail Group"
              required
            />
            {fieldError("name") && (
              <p className="text-xs text-red-600">{fieldError("name")}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="managerName">Manager name</Label>
              <Input
                id="managerName"
                name="managerName"
                defaultValue={initial?.managerName}
                required
              />
              {fieldError("managerName") && (
                <p className="text-xs text-red-600">
                  {fieldError("managerName")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerPhone">Manager phone</Label>
              <Input
                id="managerPhone"
                name="managerPhone"
                defaultValue={initial?.managerPhone ?? ""}
                placeholder="+1 555 0100"
              />
              {fieldError("managerPhone") && (
                <p className="text-xs text-red-600">
                  {fieldError("managerPhone")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerEmail">Manager email</Label>
            <Input
              id="managerEmail"
              name="managerEmail"
              type="email"
              defaultValue={initial?.managerEmail}
              required
            />
            {fieldError("managerEmail") && (
              <p className="text-xs text-red-600">
                {fieldError("managerEmail")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={initial?.username}
                autoComplete="off"
                required
              />
              {fieldError("username") && (
                <p className="text-xs text-red-600">{fieldError("username")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {mode === "create" ? "Password" : "New password"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={mode === "edit" ? "Leave blank to keep" : ""}
                required={mode === "create"}
              />
              {fieldError("password") && (
                <p className="text-xs text-red-600">{fieldError("password")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-trigger">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "ACTIVE" | "SUSPENDED")}
            >
              <SelectTrigger id="status-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <SubmitButton mode={mode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
