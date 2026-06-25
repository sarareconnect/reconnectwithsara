"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateStore } from "@/lib/actions/stores";
import type { ActionResult } from "@/lib/actions/enterprises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StoreFormValues {
  id: string;
  storeName: string;
  slug: string;
  offerTitle: string | null;
  benefits: string[];
  phone: string | null;
  whatsapp: string | null;
  mapsLink: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  storeLink: string | null;
  active: boolean;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function StoreForm({
  store,
  backHref,
}: {
  store: StoreFormValues;
  backHref: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult, FormData>(
    updateStore,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Store updated");
      router.push(backHref);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.ok, state.error, router, backHref]);

  const err = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={store.id} />

      <Card>
        <CardHeader>
          <CardTitle>Store details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input
              id="storeName"
              name="storeName"
              defaultValue={store.storeName}
              required
            />
            {err("storeName") && (
              <p className="text-xs text-red-600">{err("storeName")}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="offerTitle">Offer title</Label>
            <Input
              id="offerTitle"
              name="offerTitle"
              defaultValue={store.offerTitle ?? ""}
              placeholder="GRAB THE PRODUCT @9RS ONLY"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              name="benefits"
              rows={4}
              defaultValue={store.benefits.join("\n")}
              placeholder={"VISIT THE STORE\nSHOW THE CARD AT CHECKOUT"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact &amp; links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={store.phone ?? ""} />
            {err("phone") && (
              <p className="text-xs text-red-600">{err("phone")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              defaultValue={store.whatsapp ?? ""}
            />
            {err("whatsapp") && (
              <p className="text-xs text-red-600">{err("whatsapp")}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mapsLink">Directions (Google Maps link)</Label>
            <Input
              id="mapsLink"
              name="mapsLink"
              defaultValue={store.mapsLink ?? ""}
              placeholder="https://maps.google.com/…"
            />
            {err("mapsLink") && (
              <p className="text-xs text-red-600">{err("mapsLink")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              defaultValue={store.instagram ?? ""}
              placeholder="@handle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              name="youtube"
              defaultValue={store.youtube ?? ""}
              placeholder="@channel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              name="facebook"
              defaultValue={store.facebook ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeLink">Store link</Label>
            <Input
              id="storeLink"
              name="storeLink"
              defaultValue={store.storeLink ?? ""}
              placeholder="https://…"
            />
            {err("storeLink") && (
              <p className="text-xs text-red-600">{err("storeLink")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <Checkbox
              name="active"
              defaultChecked={store.active}
              value="true"
            />
            Landing page active
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer">
                Preview
              </a>
            </Button>
            <SaveButton />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
