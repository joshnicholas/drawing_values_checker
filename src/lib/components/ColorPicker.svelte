<script lang="ts">
let { 
    value = $bindable('#000000'),
    label = "Colour",
    presets = []
}: {
    value?: string; label?: string; presets?: string[]
} = $props();

let text = $state(value);

function handleTextInput() {
    const candidate = text.startsWith('#') ? text : `#${text}`;
    if (/^#[0-9a-fA-F]{6}$/.test(candidate)) value = candidate.toLowerCase();
}

$effect(() => {
    if (value !== text) text = value;
});

</script>

<span class='colour-picker'>
    <input type="color" bind:value class="swatch" aria-label="{label} swatch" />
    <input
    type = "text"
    bind:value={text}
    oninput={handleTextInput}
    class="hex-input"
    aria-label="{label} hex code"
    placeholder="#000000"
    maxlength = "7" 
    />

	{#if presets.length}
        <span class='presets' role='group' aria-label="label presents">
            {#each presets as preset}
                <button
                    type='button'
                    class='preset'
                    style:backround={preset}
                    aria-label = "Set {label} to {preset}"
                    onclick={() => (value = preset)}
                ></button>
            {/each}
        </span>
    {/if}
</span>

<style>
    .colour-picker {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    .swatch {
		-webkit-appearance: none;
		appearance: none;
		width: 1.6rem;
		height: 1.6rem;
		padding: 0;
		border: 1px solid var(--border, #c7c7c7);
		background: none;
		cursor: pointer;
    }
	.swatch::-webkit-color-swatch-wrapper { padding: 0; }
	.swatch::-webkit-color-swatch { border: none; }
	.swatch::-moz-color-swatch { border: none; }
	.hex-input {
		width: 5.5rem;
		padding: 0.2rem 0.4rem;
		border: 1px solid var(--border, #c7c7c7);
		background: var(--bg, #fff);
		color: var(--text, #1c1b1a);
		font: inherit;
		font-size: 0.85rem;
	}
	.presets {
		display: inline-flex;
		gap: 0.25rem;
	}
	.preset {
		width: 1.1rem;
		height: 1.1rem;
		padding: 0;
		border: 1px solid var(--border, #c7c7c7);
		cursor: pointer;
	}
	.preset[aria-pressed='true'] {
		border: 2px solid var(--text, #1c1b1a);
	}
</style>