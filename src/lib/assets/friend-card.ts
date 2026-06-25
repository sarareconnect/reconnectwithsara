import "server-only";
import {
  createCanvas,
  loadImage,
  GlobalFonts,
  type SKRSContext2D,
} from "@napi-rs/canvas";
import path from "node:path";
import fs from "node:fs";
import { generateStoreQrPng } from "@/lib/assets/qr";

// ---------------------------------------------------------------------------
// Font registration
//
// The reference design uses a brush-script title and a bold sans-serif body.
// Drop matching .ttf/.otf files in /public/fonts to match the design exactly;
// the generator falls back to canvas defaults when a file is absent so it
// never crashes in a fresh environment.
// ---------------------------------------------------------------------------
let fontsReady = false;
function ensureFonts() {
  if (fontsReady) return;
  const dir = path.join(process.cwd(), "public", "fonts");
  const register = (file: string, family: string) => {
    const full = path.join(dir, file);
    if (fs.existsSync(full)) {
      try {
        GlobalFonts.registerFromPath(full, family);
      } catch {
        /* ignore registration failures, fall back to defaults */
      }
    }
  };
  register("script.ttf", "SaraScript");
  register("sans-bold.ttf", "SaraSans");
  fontsReady = true;
}

const SCRIPT_FONT = "SaraScript, 'Brush Script MT', cursive";
const SANS_FONT = "SaraSans, Arial, sans-serif";

// Card geometry (portrait 2:3).
const WIDTH = 800;
const HEIGHT = 1200;
const BG = "#1c1c1e";
const FG = "#ffffff";

function roundRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPhoneGlyph(ctx: SKRSContext2D, cx: number, cy: number, r: number) {
  // Outline circle
  ctx.save();
  ctx.strokeStyle = FG;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Simplified handset glyph
  ctx.fillStyle = FG;
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 12);
  const s = r * 0.5;
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s * 0.7);
  ctx.quadraticCurveTo(-s, -s, -s * 0.2, -s * 0.2);
  ctx.quadraticCurveTo(s * 0.2, s * 0.2, s, s * 0.6);
  ctx.quadraticCurveTo(s * 0.9, s, s * 0.5, s * 0.5);
  ctx.quadraticCurveTo(s * 0.1, s * 0.1, -s * 0.2, -s * 0.2);
  ctx.quadraticCurveTo(-s * 0.5, -s * 0.45, -s * 0.6, -s * 0.7);
  ctx.fill();
  ctx.restore();
}

export interface FriendCardData {
  storeName: string;
  offerTitle?: string | null;
  phone?: string | null;
  slug: string;
}

/** Render a store's friend card to a PNG buffer, replicating the template. */
export async function generateFriendCardPng(
  data: FriendCardData
): Promise<Buffer> {
  ensureFonts();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const cx = WIDTH / 2;

  // Title — store name in script style
  ctx.fillStyle = FG;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `italic 700 92px ${SCRIPT_FONT}`;
  const title = data.storeName.trim() || "Store";
  ctx.fillText(title, cx, 180, WIDTH - 120);

  // Decorative underline strokes beneath the title
  ctx.strokeStyle = FG;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  const titleWidth = Math.min(ctx.measureText(title).width, WIDTH - 160);
  ctx.beginPath();
  ctx.moveTo(cx - titleWidth / 2, 210);
  ctx.lineTo(cx - 20, 210);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 20, 210);
  ctx.lineTo(cx + titleWidth / 2, 210);
  ctx.stroke();

  // Subtitle — offer / call to action
  ctx.font = `700 30px ${SANS_FONT}`;
  ctx.fillStyle = FG;
  const subtitle = (
    data.offerTitle?.trim() || "Business offer to attract customers"
  ).toUpperCase();
  wrapText(ctx, subtitle, cx, 320, WIDTH - 140, 42);

  // QR card
  const qrBuffer = await generateStoreQrPng(data.slug);
  const qrImg = await loadImage(qrBuffer);
  const qrBox = 420;
  const qrPad = 36;
  const cardSize = qrBox + qrPad * 2;
  const cardX = cx - cardSize / 2;
  const cardY = 420;
  ctx.fillStyle = "#fbfbfb";
  roundRect(ctx, cardX, cardY, cardSize, cardSize, 36);
  ctx.fill();
  ctx.drawImage(qrImg, cardX + qrPad, cardY + qrPad, qrBox, qrBox);

  // Scan caption
  ctx.fillStyle = FG;
  ctx.font = `400 34px ${SANS_FONT}`;
  ctx.fillText("Scan and know more about the offer.", cx, cardY + cardSize + 90);

  // Phone row
  const phone = data.phone?.trim();
  if (phone) {
    ctx.font = `700 46px ${SANS_FONT}`;
    const phoneWidth = ctx.measureText(phone).width;
    const iconR = 30;
    const gap = 24;
    const totalWidth = iconR * 2 + gap + phoneWidth;
    const startX = cx - totalWidth / 2;
    const rowY = HEIGHT - 120;
    drawPhoneGlyph(ctx, startX + iconR, rowY, iconR);
    ctx.textAlign = "left";
    ctx.fillStyle = FG;
    ctx.fillText(phone, startX + iconR * 2 + gap, rowY + 16);
    ctx.textAlign = "center";
  }

  return canvas.toBuffer("image/png");
}

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}
