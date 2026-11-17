/**
 * Utilitas warna & tema dinamis untuk menjaga kontras WCAG AA (>= 4.5:1)
 * meskipun warna primer/aksen diubah dari panel admin Supabase.
 */

function parseHex(hex: string, fallback: [number, number, number]): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return fallback;
}

function toHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
  );
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  weightB: number
): [number, number, number] {
  const w = Math.max(0, Math.min(1, weightB));
  return [
    a[0] * (1 - w) + b[0] * w,
    a[1] * (1 - w) + b[1] * w,
    a[2] * (1 - w) + b[2] * w,
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(lumA: number, lumB: number): number {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface PsbTheme {
  primary: string;
  primaryDark: string;
  primaryMid: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentLight: string;
  accentTextOnLight: string;
  onAccent: string;
}

export function buildPsbTheme(config: Record<string, string>): PsbTheme {
  const rawPrimary = config.warna_primer || "#0f4c1e";
  const rawAccent = config.warna_aksen || "#c8a84b";

  const primaryRgb = parseHex(rawPrimary, [15, 76, 30]);
  const accentRgb = parseHex(rawAccent, [200, 168, 75]);

  const primaryDark = toHex(mixRgb(primaryRgb, [5, 16, 8], 0.45));
  const primaryMid = toHex(mixRgb(primaryRgb, [255, 255, 255], 0.12));
  const primarySoft = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`;
  const onPrimary = relativeLuminance(primaryRgb) > 0.35 ? "#111827" : "#ffffff";

  // Pastikan teks aksen di latar putih/ivory (#faf8f4) memiliki rasio kontras >= 4.5:1
  const lightCanvasLum = relativeLuminance([250, 248, 244]);
  let accentTextRgb = accentRgb;
  for (let step = 0; step <= 10; step++) {
    const candidate = mixRgb(accentRgb, [28, 20, 4], step * 0.08);
    if (contrastRatio(relativeLuminance(candidate), lightCanvasLum) >= 4.8) {
      accentTextRgb = candidate;
      break;
    }
    accentTextRgb = candidate;
  }

  const accentLight = toHex(mixRgb(accentRgb, [255, 246, 214], 0.35));
  const onAccent = relativeLuminance(accentRgb) > 0.32 ? "#0e2914" : "#ffffff";

  return {
    primary: toHex(primaryRgb),
    primaryDark,
    primaryMid,
    primarySoft,
    onPrimary,
    accent: toHex(accentRgb),
    accentLight,
    accentTextOnLight: toHex(accentTextRgb),
    onAccent,
  };
}

export function formatPhoneDisplay(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62") && digits.length >= 10) {
    const rest = digits.slice(2);
    return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`.replace(/-$/, "");
  }
  if (digits.startsWith("0") && digits.length >= 9) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`.replace(/-$/, "");
  }
  return raw;
}
