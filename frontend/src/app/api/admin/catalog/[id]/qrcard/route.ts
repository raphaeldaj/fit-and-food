import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

function wrapName(name: string): [string, string | null] {
  if (name.length <= 20) return [name, null];
  const mid = Math.floor(name.length / 2);
  let splitIndex = name.lastIndexOf(" ", mid);
  if (splitIndex === -1) splitIndex = name.indexOf(" ", mid);
  if (splitIndex === -1) return [name, null];
  return [name.slice(0, splitIndex), name.slice(splitIndex + 1)];
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function generateQrDataUri(url: string): Promise<string> {
  const svgString = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    color: { dark: "#111B3A", light: "#FFFFFF" },
  });
  const base64 = Buffer.from(svgString, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const meal = await db.mealItem.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Plat introuvable." }, { status: 404 });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const targetUrl = `${appUrl}/plat/${meal.id}`;
  const qrDataUri = await generateQrDataUri(targetUrl);

  const [line1, line2] = wrapName(meal.name);
  const nameY = line2 ? 258 : 264;
  const subtitleY = line2 ? 300 : 288;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111B3A" />
      <stop offset="1" stop-color="#FF6A13" />
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="238" height="358" rx="24" fill="url(#bg)" stroke="#FFFFFF" stroke-opacity="0.3" />

  <rect x="10" y="10" width="220" height="340" rx="18" fill="#FFFFFF" fill-opacity="0.14" stroke="#FFFFFF" stroke-opacity="0.25" />

  <text x="120" y="36" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="14" fill="#FFFFFF" letter-spacing="1">FIT &amp; FOOD</text>
  <circle cx="163" cy="32" r="2.5" fill="#FF6A13" />

  <rect x="30" y="54" width="180" height="180" rx="14" fill="#FFFFFF" />
  <image href="${qrDataUri}" x="44" y="68" width="152" height="152" />

  <text x="120" y="${nameY}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">${escapeXml(line1)}</text>
  ${line2 ? `<text x="120" y="280" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">${escapeXml(line2)}</text>` : ""}

  <text x="120" y="${subtitleY}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#FFFFFF" fill-opacity="0.75">Scanne pour voir les détails</text>

  <text x="120" y="335" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#FFFFFF" fill-opacity="0.5">Dakar, Sénégal</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="qr-${meal.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg"`,
    },
  });
}