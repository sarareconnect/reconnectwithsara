import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/queries/stores";
import {
  telHref,
  whatsappHref,
  mapsHref,
  instagramHref,
  youtubeHref,
  facebookHref,
  externalHref,
  displayHandle,
} from "@/lib/landing-links";
import {
  PhoneIcon,
  WhatsAppIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  MapPinIcon,
  GlobeIcon,
} from "@/components/landing/brand-icons";
import AnimatedQrMatrix from "@/components/ui/AnimatedQrMatrix";
import AutoFitText from "@/components/ui/AutoFitText";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store not found" };
  return {
    title: store.storeName,
    description: store.offerTitle ?? `Visit ${store.storeName}`,
    robots: { index: true, follow: true },
  };
}

interface ContactRow {
  key: string;
  value: string;
  href: string | null;
  icon: React.ReactNode;
}

interface ActionButton {
  key: string;
  label: string;
  href: string;
  className: string;
  icon: React.ReactNode;
}

export default async function StoreLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store || !store.active) notFound();

  const customButtons = (
    Array.isArray(store.customButtons) ? store.customButtons : []
  ) as Array<{ label: string; url: string }>;

  // ── Contact rows (left side of the card) ──
  const contactRows: ContactRow[] = [];
  if (store.phone)
    contactRows.push({
      key: "phone",
      value: store.phone,
      href: telHref(store.phone),
      icon: <PhoneIcon className="h-4 w-4" />,
    });
  if (store.whatsapp)
    contactRows.push({
      key: "whatsapp",
      value: store.whatsapp,
      href: whatsappHref(store.whatsapp),
      icon: <WhatsAppIcon className="h-4 w-4" />,
    });
  if (store.instagram)
    contactRows.push({
      key: "instagram",
      value: displayHandle(store.instagram) ?? "Instagram",
      href: instagramHref(store.instagram),
      icon: <InstagramIcon className="h-4 w-4" />,
    });
  if (store.youtube)
    contactRows.push({
      key: "youtube",
      value: displayHandle(store.youtube) ?? "YouTube",
      href: youtubeHref(store.youtube),
      icon: <YouTubeIcon className="h-4 w-4" />,
    });

  // ── CTA buttons ──
  const buttons: ActionButton[] = [];
  const wa = whatsappHref(store.whatsapp);
  if (wa)
    buttons.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: wa,
      className: "bg-[#25d366] hover:bg-[#20be59]",
      icon: <WhatsAppIcon className="h-4 w-4 shrink-0" />,
    });
  const tel = telHref(store.phone);
  if (tel)
    buttons.push({
      key: "call",
      label: "Call",
      href: tel,
      className: "bg-[#2f66db] hover:bg-[#2758c1]",
      icon: <PhoneIcon className="h-4 w-4 shrink-0" />,
    });
  const dir = mapsHref(store.mapsLink);
  if (dir)
    buttons.push({
      key: "directions",
      label: "Directions",
      href: dir,
      className: "bg-[#0f9d58] hover:bg-[#0b8043]",
      icon: <MapPinIcon className="h-4 w-4 shrink-0" />,
    });
  const ig = instagramHref(store.instagram);
  if (ig)
    buttons.push({
      key: "instagram",
      label: "Instagram",
      href: ig,
      className: "bg-[#c13584] hover:bg-[#a02d6e]",
      icon: <InstagramIcon className="h-4 w-4 shrink-0" />,
    });
  const yt = youtubeHref(store.youtube);
  if (yt)
    buttons.push({
      key: "youtube",
      label: "YouTube",
      href: yt,
      className: "bg-[#ff0000] hover:bg-[#cc0000]",
      icon: <YouTubeIcon className="h-4 w-4 shrink-0" />,
    });
  const fb = facebookHref(store.facebook);
  if (fb)
    buttons.push({
      key: "facebook",
      label: "Facebook",
      href: fb,
      className: "bg-[#1877f2] hover:bg-[#1568d6]",
      icon: <FacebookIcon className="h-4 w-4 shrink-0" />,
    });
  const storeLink = externalHref(store.storeLink);
  if (storeLink)
    buttons.push({
      key: "store",
      label: "Store",
      href: storeLink,
      className: "bg-[#7c3aed] hover:bg-[#6d31d4]",
      icon: <GlobeIcon className="h-4 w-4 shrink-0" />,
    });
  for (const cb of customButtons) {
    const href = externalHref(cb.url);
    if (!href) continue;
    buttons.push({
      key: `custom-${cb.label}`,
      label: cb.label,
      href,
      className: "bg-violet-600 hover:bg-violet-700",
      icon: <GlobeIcon className="h-4 w-4 shrink-0" />,
    });
  }

  const benefits = store.benefits ?? [];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(160deg,#0d0f14_0%,#111520_60%,#0b0d12_100%)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        {/* ── Business card ── */}
        <section className="reveal" style={{ animationDelay: "0.08s" }}>
          <div className="gold-border-spin relative overflow-hidden">
            <div className="overflow-hidden rounded-[12px] bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0)_46%),linear-gradient(130deg,#0f1012_0%,#171b22_58%,#0b0c0f_100%)] text-white shadow-[0_18px_40px_-24px_rgba(2,6,23,0.95)]">
              <div className="flex items-center justify-center border-b border-white/10 px-5 py-3">
                <AutoFitText
                  text={store.storeName.toUpperCase()}
                  minSize={12}
                  maxSize={40}
                  className="w-full text-center font-semibold tracking-[0.18em] text-white"
                />
              </div>
              <div className="grid min-h-[160px] grid-cols-5">
                <div className="col-span-3 flex flex-col justify-center px-5 py-3">
                  {contactRows.length > 0 ? (
                    <ul className="space-y-1">
                      {contactRows.slice(0, 5).map((item) => {
                        const isExternal = item.href?.startsWith("http");
                        return (
                          <li key={item.key}>
                            <a
                              href={item.href ?? undefined}
                              target={isExternal ? "_blank" : undefined}
                              rel={
                                isExternal ? "noopener noreferrer" : undefined
                              }
                              className="group flex items-center gap-2 py-0.5 text-white/90 transition-colors hover:text-white"
                            >
                              <span className="text-white/70">{item.icon}</span>
                              <span className="truncate text-[13px] font-medium text-white/85">
                                {item.value}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center px-3 text-center text-sm font-medium text-white/70">
                      Add contact details.
                    </div>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-center pr-5">
                  <AnimatedQrMatrix seed={store.slug} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tagline ── */}
        {store.offerTitle && (
          <section
            className="reveal mt-5 text-center"
            style={{ animationDelay: "0.14s" }}
          >
            <p className="mx-auto max-w-sm text-base font-semibold text-white/70">
              {store.offerTitle}
            </p>
          </section>
        )}

        {/* ── Benefits ── */}
        {benefits.length > 0 && (
          <section className="reveal mt-5" style={{ animationDelay: "0.22s" }}>
            <ul className="space-y-2">
              {benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 text-sm font-medium text-white/75"
                >
                  <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── CTA buttons ── */}
        {buttons.length > 0 && (
          <section className="mt-6">
            <div
              className="reveal grid grid-cols-3 gap-2.5"
              style={{ animationDelay: "0.3s" }}
            >
              {buttons.map((action) => (
                <a
                  key={action.key}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2.5 text-[11px] font-semibold leading-tight text-white transition-colors ${action.className}`}
                  aria-label={action.label}
                  title={action.label}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="mt-6 border-t border-white/10 pt-4 text-center">
          <p
            className="reveal text-xs font-bold uppercase tracking-[0.18em] text-white/25"
            style={{ animationDelay: "0.46s" }}
          >
            Scan. Visit. Connect.
          </p>
        </footer>
      </div>
    </div>
  );
}
