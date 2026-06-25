/**
 * Helpers to turn stored store fields (which may be handles, numbers, or full
 * URLs) into safe, clickable destinations for the landing page buttons.
 */

function digitsOnly(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export function telHref(phone?: string | null): string | null {
  if (!phone) return null;
  return `tel:${digitsOnly(phone)}`;
}

export function whatsappHref(whatsapp?: string | null): string | null {
  if (!whatsapp) return null;
  const num = digitsOnly(whatsapp).replace(/^\+/, "");
  if (!num) return null;
  return `https://wa.me/${num}`;
}

export function mapsHref(mapsLink?: string | null): string | null {
  if (!mapsLink) return null;
  return mapsLink;
}

export function instagramHref(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").trim();
  return `https://instagram.com/${handle}`;
}

export function youtubeHref(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").trim();
  return `https://youtube.com/${handle.startsWith("@") ? handle : "@" + handle}`;
}

export function facebookHref(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://facebook.com/${value.replace(/^@/, "").trim()}`;
}

export function externalHref(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/** Display handle (e.g. "@instagram") from a stored value or URL. */
export function displayHandle(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    const last = value.replace(/\/$/, "").split("/").pop() ?? value;
    return last.startsWith("@") ? last : `@${last}`;
  }
  return value.startsWith("@") ? value : `@${value}`;
}
