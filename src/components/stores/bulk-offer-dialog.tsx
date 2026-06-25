"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { bulkApplyOffer } from "@/lib/actions/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BulkOfferDialogProps {
  enterpriseId: string;
  selectedIds: string[];
  onApplied?: () => void;
}

export function BulkOfferDialog({
  enterpriseId,
  selectedIds,
  onApplied,
}: BulkOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [benefits, setBenefits] = useState("");
  const [pending, startTransition] = useTransition();

  const scopeLabel =
    selectedIds.length > 0
      ? `${selectedIds.length} selected store${selectedIds.length === 1 ? "" : "s"}`
      : "ALL stores";

  const apply = () => {
    if (!offerTitle.trim()) {
      toast.error("Offer title is required.");
      return;
    }
    startTransition(async () => {
      const res = await bulkApplyOffer({
        enterpriseId,
        offerTitle: offerTitle.trim(),
        benefits: benefits
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        storeIds: selectedIds,
      });
      if (res.ok) {
        toast.success(`Offer applied to ${res.updated ?? 0} stores.`);
        setOpen(false);
        setOfferTitle("");
        setBenefits("");
        onApplied?.();
      } else {
        toast.error(res.error ?? "Failed to apply offer.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="h-4 w-4" /> Apply offer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply offer in bulk</DialogTitle>
          <DialogDescription>
            This offer will be applied to <strong>{scopeLabel}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-offer-title">Offer title</Label>
            <Input
              id="bulk-offer-title"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="GRAB THE PRODUCT @9RS ONLY"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-benefits">Benefits (one per line)</Label>
            <Textarea
              id="bulk-benefits"
              rows={4}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder={"VISIT THE STORE\nSHOW THE CARD AT CHECKOUT"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={apply} disabled={pending}>
            {pending ? "Applying…" : "Apply offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
