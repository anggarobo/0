<script lang="ts">
	const { value, onInput } = $props<{
		value: string;
		onInput: (value: string) => void;
	}>();

	function handleInput(e: Event) {
		const next = (e.currentTarget as HTMLTextAreaElement).value;
		onInput(next);
	}
</script>

<label class="c-text mb-2 block text-sm font-medium" for="convert-case-input">Text</label>
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
