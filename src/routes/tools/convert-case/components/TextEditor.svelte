<script lang="ts">
	const { value, onInput, clear } = $props<{
		value: string;
		onInput: (value: string) => void;
		clear: () => void;
	}>();

	function handleInput(e: Event) {
		const next = (e.currentTarget as HTMLTextAreaElement).value;
		onInput(next);
	}
</script>

<label class="c-text mb-2 block text-sm font-medium" for="convert-case-input">Text</label>
<div class="relative">
	<button
		type="button"
		onclick={clear}
		aria-label="Copy converted text"
		class="absolute top-2 right-2 rounded-lg border border-neutral-300 px-1.5 pt-1 pb-0.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		hidden={!value}
	>
		✗
	</button>
	<textarea
		id="convert-case-input"
		{value}
		oninput={handleInput}
		placeholder="Type or paste text to convert…"
		rows={4}
		spellcheck={false}
		autocomplete="off"
		aria-label="Convert case text editor"
		class="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:placeholder-neutral-600 dark:focus:border-neutral-500"
	></textarea>
</div>
