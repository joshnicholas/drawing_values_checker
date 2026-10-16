<script lang="ts">
import type { Snippet } from "svelte";

let {
    hasImage = false,
    onFileSelected,
    children
} : {
    hasImage?: boolean;
    onFileSelected: (file: File) => void;
    children?: Snippet
} = $props();

let fileInput: HTMLInputElement;

function handleChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onFileSelected(file);
}

</script>

<button type="button" class="image-slot" onclick={() => fileInput.click()}>
	{#if hasImage}
		{@render children?.()}
	{:else}
		<span class="placeholder">
			<span class="placeholder-icon" aria-hidden="true">＋</span>
			<span>Tap to upload a photo</span>
		</span>
	{/if}
</button>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	capture="environment"
	onchange={handleChange}
	hidden
/>

<style>
	.image-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 4 / 5;
		padding: 0;
		border: 1px solid var(--border, #c7c7c7);
		background: var(--code-bg, #f0ede8);
		cursor: pointer;
		overflow: hidden;
	}
	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-dim, #6b6560);
		font-size: 0.9rem;
	}
	.placeholder-icon {
		font-size: 1.75rem;
		line-height: 1;
	}
	:global(.image-slot canvas) {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
	}
</style>