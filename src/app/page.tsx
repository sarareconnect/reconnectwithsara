import Link from "next/link";

export const metadata = {
  title: "Sara — Reconnect • Retain • Grow",
  description:
    "Helping businesses convert existing customers into repeat and referral customers through QR-powered Friend Cards.",
};

const BRAND = "#15a079";

const scope = [
  "Friend Card Design",
  "QR Code Generation",
  "Mobile Landing Page",
  "WhatsApp Integration",
  "Call Button",
  "Google Maps",
  "Social Media Buttons",
  "Hosting Included",
  "Unlimited Offer Updates",
];

const why = [
  {
    Icon: TrendingUpIcon,
    title: "Increase Repeat Customers",
    text: "Turn one-time buyers into loyal regulars who keep coming back.",
  },
  {
    Icon: ReferralIcon,
    title: "Generate Customer Referrals",
    text: "Every happy customer becomes your most trusted promoter.",
  },
  {
    Icon: WalletIcon,
    title: "Affordable Acquisition",
    text: "Win new customers for a fraction of the cost of paid ads.",
  },
  {
    Icon: BoltIcon,
    title: "Ready within 2 Days",
    text: "Go live fast — your Friend Card is earning within 48 hours.",
  },
];

const pricing = [
  { label: "One-Time Setup", sub: "Per Store", price: "₹2,500", note: "" },
  { label: "Annual Hosting & Unlimited Updates", sub: "Billed yearly", price: "₹999", note: "/year", highlight: true },
  { label: "Monthly Maintenance", sub: "Always free", price: "₹0", note: "" },
];

type IconProps = { className?: string };

function baseSvg(children: React.ReactNode, className = "h-6 w-6") {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function TrendingUpIcon({ className }: IconProps) {
  return baseSvg(
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </>,
    className
  );
}

function ReferralIcon({ className }: IconProps) {
  return baseSvg(
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M16.5 14c2.5.4 4.5 2.2 4.5 4.8" />
    </>,
    className
  );
}

function WalletIcon({ className }: IconProps) {
  return baseSvg(
    <>
      <path d="M3 7a2 2 0 0 1 2-2h12v4" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
    </>,
    className
  );
}

function BoltIcon({ className }: IconProps) {
  return baseSvg(<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />, className);
}

function PhoneGlyph({ className }: IconProps) {
  return baseSvg(
    <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5a2 2 0 0 1 2-2Z" />,
    className
  );
}

function MailGlyph({ className }: IconProps) {
  return baseSvg(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>,
    className
  );
}

function GlobeGlyph({ className }: IconProps) {
  return baseSvg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </>,
    className
  );
}

function PinGlyph({ className }: IconProps) {
  return baseSvg(
    <>
      <path d="M12 21s7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>,
    className
  );
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`} style={{ color: BRAND }}>
      Sara
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-baseline gap-2">
            <Wordmark className="text-2xl" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="#contact"
              className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: "radial-gradient(60% 60% at 50% 0%, #e9f9f2 0%, #ffffff 70%)" }}
        />
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:py-28">
          <div className="reveal mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND }} />
            QR-POWERED FRIEND CARDS · LIVE IN 48 HOURS
          </div>
          <h1 className="reveal text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl" style={{ animationDelay: "0.05s" }}>
            Turn Every Customer Into a{" "}
            <span style={{ color: BRAND }}>Repeat Buyer</span> &amp; Referrer
          </h1>
          <p className="reveal mx-auto mt-6 max-w-2xl text-lg text-slate-600" style={{ animationDelay: "0.1s" }}>
            <Wordmark /> gives your business a QR-powered Friend Card that brings
            customers back and turns them into your best marketers — no apps, no ads,
            no hassle.
          </p>
          <div className="reveal mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.15s" }}>
            <Link
              href="#contact"
              className="rounded-full px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Get Your Friend Card
            </Link>
            <Link
              href="#commercials"
              className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Pricing
            </Link>
          </div>
          <div className="reveal mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4" style={{ animationDelay: "0.2s" }}>
            {[
              { value: "48 hrs", label: "Go Live" },
              { value: "₹999/yr", label: "Hosting & Updates" },
              { value: "∞", label: "Offer Updates" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-white px-3 py-4 shadow-sm">
                <p className="text-2xl font-extrabold" style={{ color: BRAND }}>
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-8 text-center sm:p-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: BRAND }}>
            About Sara
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-medium text-slate-700">
            <span className="font-bold text-slate-900">Reconnect • Retain • Grow.</span>{" "}
            A simple, mobile-first system that helps your business convert existing
            customers into repeat buyers and powerful referrers — powered by a single
            QR-driven Friend Card.
          </p>
        </div>
      </section>

      {/* Scope of Work */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading kicker="What's Included" title="Scope of Work" />
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scope.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:border-slate-200 hover:shadow-md"
            >
              <Check />
              <span className="font-medium text-slate-800">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Why Sara */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading kicker="The Value" title="Why Sara?" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w) => (
            <div key={w.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#e9f9f2", color: BRAND }}
              >
                <w.Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{w.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commercials */}
      <section id="commercials" className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading kicker="Transparent Pricing" title="Commercials" />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.label}
              className={`relative rounded-3xl border p-7 shadow-sm ${
                p.highlight ? "border-transparent text-white" : "border-slate-100 bg-white"
              }`}
              style={p.highlight ? { backgroundColor: BRAND } : undefined}
            >
              {p.highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Best Value
                </span>
              )}
              <p className={`text-sm font-semibold ${p.highlight ? "text-white/80" : "text-slate-500"}`}>
                {p.sub}
              </p>
              <h3 className={`mt-1 text-lg font-bold ${p.highlight ? "text-white" : "text-slate-900"}`}>
                {p.label}
              </h3>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{p.price}</span>
                <span className={`text-sm font-medium ${p.highlight ? "text-white/80" : "text-slate-500"}`}>
                  {p.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery / Payment / Support */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard title="Delivery" highlight="Within 2 Working Days">
            Your complete Friend Card setup, live and ready to share.
          </InfoCard>
          <InfoCard title="Payment Terms" highlight="50% Advance">
            50% advance to begin, 50% after successful delivery.
          </InfoCard>
          <InfoCard title="Support" highlight="Unlimited">
            Unlimited technical support while the annual hosting subscription is active.
          </InfoCard>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-12">
        <div className="overflow-hidden rounded-3xl" style={{ backgroundColor: "#0c1512" }}>
          <div className="grid grid-cols-1 gap-10 p-9 sm:p-12 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: BRAND }}>
                Get in Touch
              </h2>
              <p className="mt-3 text-3xl font-extrabold text-white">
                Let&apos;s grow your business together.
              </p>
              <p className="mt-4 max-w-md text-slate-400">
                Your Friend Card can be live within 2 days. Get in touch and start
                turning customers into referrers today.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">Vanumu Lakshmi Sai Ram</p>
              <ContactRow href="tel:+918333027544" label="8333027544" Icon={PhoneGlyph} />
              <ContactRow href="mailto:contact@reconnectwithsara.in" label="contact@reconnectwithsara.in" Icon={MailGlyph} />
              <ContactRow href="https://reconnectwithsara.in" label="reconnectwithsara.in" Icon={GlobeGlyph} />
              <div className="flex items-center gap-3 text-slate-300">
                <span style={{ color: BRAND }}>
                  <PinGlyph className="h-5 w-5" />
                </span>
                <span>Kakinada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
          <div className="flex items-baseline gap-2">
            <Wordmark className="text-lg" />
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Sara · reconnectwithsara.in
          </p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: BRAND }}>
        {kicker}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function InfoCard({
  title,
  highlight,
  children,
}: {
  title: string;
  highlight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-xl font-extrabold" style={{ color: BRAND }}>
        {highlight}
      </p>
      <p className="mt-3 text-sm text-slate-500">{children}</p>
    </div>
  );
}

function ContactRow({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 text-slate-200 transition hover:text-white"
    >
      <span style={{ color: BRAND }}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
