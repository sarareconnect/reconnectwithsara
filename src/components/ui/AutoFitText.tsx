"use client";

import * as React from "react";

interface AutoFitTextProps {
  text: string;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

/**
 * Renders a single line of text at the largest font size (between minSize and
 * maxSize, in px) that fits the available container width. Re-fits on resize.
 */
export default function AutoFitText({
  text,
  minSize = 12,
  maxSize = 44,
  className,
}: AutoFitTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [size, setSize] = React.useState(maxSize);

  React.useEffect(() => {
    const container = containerRef.current;
    const span = spanRef.current;
    if (!container || !span) return;

    const fit = () => {
      const avail = container.clientWidth;
      if (!avail) return;
      let lo = minSize;
      let hi = maxSize;
      let best = minSize;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        span.style.fontSize = `${mid}px`;
        if (span.scrollWidth <= avail) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      span.style.fontSize = `${best}px`;
      setSize(best);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, minSize, maxSize]);

  return (
    <div ref={containerRef} className={className}>
      <span
        ref={spanRef}
        style={{
          fontSize: size,
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      >
        {text}
      </span>
    </div>
  );
}
