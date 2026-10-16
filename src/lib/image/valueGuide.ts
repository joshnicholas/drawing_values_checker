import type { ValueGuideOptions } from "#lib/types.ts";

export function hexToRgb(hex: string): [r: number, g: number, b: number] {
    const clean = hex.replace("#", '');
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join('')
        : clean;
    const int = parseInt(full, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

// One colour per "value" step, darkest (the chosen hex) to lightest (white).
export function buildPalette(hex: string, levels: number): [number, number, number][] {
	const [r, g, b] = hexToRgb(hex);
	const palette: [number, number, number][] = [];
	for (let i = 0; i < levels; i++) {
		const t = levels === 1 ? 0 : i / (levels - 1); // 0 → hex itself, 1 → white
		palette.push([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
	}
	return palette;
}

// Standard relative-luminance weights (perceived brightness), applied straight to the
// 0-255 sRGB channel values — good enough for a stylised tonal effect, not colour-managed.
function luminance(r: number, g: number, b: number): number {
	return 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..255
}

// Mutates `imageData` in place: every pixel's RGB is replaced by its palette band's colour.
export function applyValueGuide(imageData: ImageData, { hex, levels }: ValueGuideOptions) {
	const palette = buildPalette(hex, levels);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const lum = luminance(data[i], data[i + 1], data[i + 2]);
		// 256, not 255: makes lum === 255 land in the last bucket instead of overflowing past it.
		const bucket = Math.min(levels - 1, Math.floor((lum / 256) * levels));
		const [r, g, b] = palette[bucket];
		data[i] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		// data[i + 3] (alpha) is left untouched.
	}
}