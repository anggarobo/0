<script lang="ts">
	import Toolbar from './components/Toolbar.svelte';
	import TextEditor from './components/TextEditor.svelte';
	import Statistics from './components/Statistics.svelte';
	import type { CaseKey, UtilityKey } from './lib/types';
	import { convertByCaseKey, convertByUtilityKey, getTextStats } from './lib';

	let input = $state('');
	let output = $state('');
	let copied = $state<string | null>(null);

	const stats = $derived.by(() => {
		return getTextStats(output);
	});

	function setInput(next: string) {
		input = next;
		output = next;
	}

	function clear() {
		setInput('');
	}

	function downloadTxt() {
		const text = output ?? '';
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'converted.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	let fileInput: HTMLInputElement;

	function triggerUpload() {
		fileInput.click();
	}

	function onFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			setInput((ev.target?.result as string) ?? '');
		};
		reader.readAsText(file);
		(e.target as HTMLInputElement).value = '';
	}

	async function copyOutput() {
		try {
			await navigator.clipboard.writeText(output);
			copied = 'output';
			setTimeout(() => (copied = null), 1500);
		} catch {
			// ignore
		}
	}

	async function copyInput() {
		try {
			await navigator.clipboard.writeText(input);
			copied = 'input';
			setTimeout(() => (copied = null), 1500);
		} catch {
			// ignore
		}
	}

	function onConvert(key: CaseKey | UtilityKey) {
		if (
			key.startsWith('reverse_') ||
			key.startsWith('sort_') ||
			key.startsWith('remove_') ||
			key.startsWith('trim_') ||
			key.startsWith('url_') ||
			key.startsWith('html_') ||
			key.startsWith('base64_')
		) {
			output = convertByUtilityKey(input, key as UtilityKey);
			return;
		}
		output = convertByCaseKey(input, key as CaseKey);
	}
</script>

<svelte:head>
	<title>Convert Case Tool – Transform Text Casing</title>
	<meta
		name="description"
		content="Convert text between multiple casing styles and utilities instantly."
	/>
</svelte:head>

<h3 class="page-title">Convert Case</h3>
<p class="c-text mt-2 text-sm">
	Transform text into common casing styles and useful text utilities.
</p>

<section class="mt-6 space-y-4">
	<!-- Actions row -->
	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			onclick={copyOutput}
			aria-label="Copy converted text"
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		>
			{copied === 'output' ? 'Copied!' : 'Copy'}
		</button>

		<button
			type="button"
			onclick={copyInput}
			aria-label="Copy input text"
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		>
			{copied === 'input' ? 'Copied!' : 'Paste'}
		</button>

		<button
			type="button"
			onclick={clear}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		>
			Clear
		</button>

		<button
			type="button"
			onclick={triggerUpload}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			aria-label="Upload a .txt file"
		>
			Upload .txt
		</button>

		<input
			bind:this={fileInput}
			type="file"
			accept=".txt,text/plain"
			class="hidden"
			onchange={onFileChange}
			aria-hidden="true"
		/>

		<button
			type="button"
			onclick={downloadTxt}
			aria-label="Download converted text as .txt"
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		>
			Download .txt
		</button>
	</div>

	<!-- Toolbar -->
	<Toolbar {onConvert} />

	<TextEditor value={input} onInput={setInput} />

	<label class="c-text mb-2 block text-sm font-medium" for="convert-case-output"
				>Result</label
			>
			<textarea
				id="convert-case-output"
				bind:value={output}
				rows={6}
				spellcheck={false}
				autocomplete="off"
				aria-label="Converted text output"
				readonly
				class="w-full resize-y rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
			></textarea>

	<Statistics {stats} />
</section>
