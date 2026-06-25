"use client";

import * as React from "react";

const SIZE = 21;
const FINDER = 7;

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Finder ("position") pattern cell within an FINDER×FINDER block at (br, bc). */
function finderCell(
  r: number,
  c: number,
  br: number,
  bc: number
): boolean | null {
  const rr = r - br;
  const cc = c - bc;
  if (rr < 0 || rr >= FINDER || cc < 0 || cc >= FINDER) return null;
  const ring = rr === 0 || rr === FINDER - 1 || cc === 0 || cc === FINDER - 1;
  const core = rr >= 2 && rr <= FINDER - 3 && cc >= 2 && cc <= FINDER - 3;
  return ring || core;
}

/** Returns the fixed structural cell value, or null if it is a data cell. */
function structural(r: number, c: number): boolean | null {
  const blocks: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [0, SIZE - FINDER],
    [SIZE - FINDER, 0],
  ];
  for (const [br, bc] of blocks) {
    const v = finderCell(r, c, br, bc);
    if (v !== null) return v;
  }
  return null;
}

/** Finder + separator area where data cells must not be drawn. */
function reserved(r: number, c: number): boolean {
  return (
    (r <= FINDER && c <= FINDER) ||
    (r <= FINDER && c >= SIZE - FINDER - 1) ||
    (r >= SIZE - FINDER - 1 && c <= FINDER)
  );
}

function buildData(seed: number): boolean[] {
  const rand = mulberry32(seed);
  const cells = new Array<boolean>(SIZE * SIZE).fill(false);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (reserved(r, c)) continue;
      cells[r * SIZE + c] = rand() > 0.5;
    }
  }
  return cells;
}

/** A fresh full-field pattern (non-deterministic) for each animation frame. */
function randomFrame(): boolean[] {
  const cells = new Array<boolean>(SIZE * SIZE).fill(false);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (reserved(r, c)) continue;
      cells[r * SIZE + c] = Math.random() > 0.5;
    }
  }
  return cells;
}

/**
 * A decorative QR-style matrix that keeps the three corner finder patterns
 * fixed while the inner data modules continuously re-shuffle, giving the
 * impression of a live, animating code. Not a scannable QR — the real,
 * scannable code lives on the downloadable friend card and QR asset.
 */
export default function AnimatedQrMatrix({ seed }: { seed: string }) {
  const seedNum = React.useMemo(() => hashSeed(seed), [seed]);
  const [data, setData] = React.useState<boolean[]>(() => buildData(seedNum));

  // Deterministic per-cell fade delay so modules transition in a ripple
  // rather than all at once (which looks like a gray wash mid-transition).
  const delays = React.useMemo(() => {
    const rand = mulberry32(seedNum ^ 0x9e3779b9);
    const d = new Array<number>(SIZE * SIZE);
    for (let i = 0; i < d.length; i++) d[i] = Math.round(rand() * 900) / 1000;
    return d;
  }, [seedNum]);

  React.useEffect(() => {
    setData(buildData(seedNum));
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setData(randomFrame());
    }, 2600);
    return () => window.clearInterval(id);
  }, [seedNum]);

  const fixedRects: React.ReactNode[] = [];
  const dataRects: React.ReactNode[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const s = structural(r, c);
      if (s !== null) {
        if (s) {
          fixedRects.push(
            <rect key={`f-${r}-${c}`} x={c} y={r} width={1.02} height={1.02} />
          );
        }
        continue;
      }
      if (reserved(r, c)) continue;
      const idx = r * SIZE + c;
      const on = data[idx];
      dataRects.push(
        <rect
          key={`d-${r}-${c}`}
          x={c}
          y={r}
          width={1.02}
          height={1.02}
          style={{
            opacity: on ? 1 : 0,
            transition: "opacity 0.55s ease-in-out",
            transitionDelay: `${delays[idx]}s`,
          }}
        />
      );
    }
  }

  return (
    <div className="aspect-square w-full max-w-[124px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        fill="#0b0c0f"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Decorative animated QR code"
      >
        {fixedRects}
        {dataRects}
      </svg>
    </div>
  );
}
