<script lang="ts">

import { onMount } from "svelte";
import ColorPicker from "#lib/components/ColorPicker.svelte";
import ImageSlot from "#lib/components/ImageSlot.svelte";
import { applyValueGuide } from "#lib/image/valueGuide.ts";

const maxDimension = 1600;
const minLevels = 2
const maxLevels = 10

let hex = $state("#331e00")
let levels = $state(4)

let sourceImageData: ImageData | undefined = $state();
let sourceFile: File | undefined = $state();
let canvas: HTMLCanvasElement | undefined = $state()

async function handleFileSelected(file: File) {
    sourceFile = file;
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale);

    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, width, height);

    sourceImageData = ctx.getImageData(0, 0, width, height);
}

function clampLevels(n: number) {
    return Math.min(maxLevels, Math.max(minLevels, n));
}

onMount(async () => {
    const response = await fetch('/default.jpeg');
    const blob = await response.blob();
    await handleFileSelected(new File([blob], 'default.jpeg', { type: blob.type }));
});

async function handleDownload() {
    if (!sourceFile) return;

    const bitmap = await createImageBitmap(sourceFile);
    const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = offscreen.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);

    const full = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    applyValueGuide(full, { hex, levels });
    ctx.putImageData(full, 0, 0);

    const blob = await offscreen.convertToBlob({ type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `value-guide-${levels}-step.png`;
    link.click();
    // Revoking in the SAME tick as click() can race the browser's own (separate, not fully
    // synchronous) download-start step in some engines — a zero-delay timeout defers the
    // revoke until after that tick has finished, not until click()'s own dispatch returns.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

$effect(() => {
    if (!sourceImageData || !canvas) return;

    const working = new ImageData(
        new Uint8ClampedArray(sourceImageData.data),
        sourceImageData.width,
        sourceImageData.height
    );
    applyValueGuide(working, { hex, levels });

    canvas.width = working.width;
    canvas.height = working.height;
    canvas.getContext('2d')!.putImageData(working, 0, 0);
})


</script>

<main>
	<ImageSlot hasImage={!!sourceImageData} onFileSelected={handleFileSelected}>
		<canvas bind:this={canvas}></canvas>
	</ImageSlot>

	<div class="controls">
		<ColorPicker bind:value={hex} label="Value colour" 
        
        presets={['#134ed8', '#d813a3', '#d84413', '#295135', '#331e00']}
        />
		<div class="actions-row">
			<div class="levels-field">
				<span class="levels-label">Steps</span>
				<div class="stepper">
					<button
						type="button"
						class="stepper-btn"
						disabled={levels <= minLevels}
						aria-label="Fewer steps"
						onclick={() => (levels = clampLevels(levels - 1))}
					>
						−
					</button>
					<span class="levels-value">{levels}</span>
					<button
						type="button"
						class="stepper-btn"
						disabled={levels >= maxLevels}
						aria-label="More steps"
						onclick={() => (levels = clampLevels(levels + 1))}
					>
						+
					</button>
				</div>
			</div>
			<button
				type="button"
				class="download-btn"
				disabled={!sourceImageData}
				onclick={handleDownload}
			>
				Download
			</button>
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
	}
	main {
		max-width: 28rem;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85rem;
		flex-wrap: wrap;
	}
	.actions-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	@media (max-width: 480px) {
		main {
			height: 100dvh;
			box-sizing: border-box;
			overflow: hidden;
		}
		.controls {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
			flex-shrink: 0;
		}
		.actions-row {
			justify-content: space-between;
		}
	}
	.levels-field {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.levels-label {
		color: var(--text-dim, #6b6560);
	}
	.stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.stepper-btn {
		width: 2.25rem;
		height: 2.25rem;
		font-size: 1.25rem;
		line-height: 1;
		border: 1px solid var(--border, #c7c7c7);
		background: var(--bg, #fff);
		color: var(--text, #1c1b1a);
		cursor: pointer;
	}
	.stepper-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.levels-value {
		min-width: 1.5rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.download-btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border, #c7c7c7);
		background: var(--bg, #fff);
		color: var(--text, #1c1b1a);
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.download-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>



