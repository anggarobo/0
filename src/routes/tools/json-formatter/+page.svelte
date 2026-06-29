<script lang="ts">
	import JsonNode from '$lib/components/JsonNode.svelte';
	import {
		buildArrayTable,
		collectDefaultExpandedPaths,
		collectExpandablePaths,
		formatJSON,
		minifyJSON,
		parseJSON,
		searchJSON,
		stringifyJSON
	} from '$lib/utils/json-formatter';
	import { SvelteSet } from 'svelte/reactivity';
	import type { IndentOption, ParseError, SearchMatch } from '$lib/utils/json-formatter';

	type ViewMode = 'tree' | 'table';
	const MAX_TABLE_ROWS = 10000;

	// --- state ---
	let input = $state('');
	let indent = $state<IndentOption>(2);
	let autoFormat = $state(true);
	let error = $state<ParseError | null>(null);
	let parsedValue = $state<unknown>(null);
	let isParsed = $state(false);
	let copied = $state<string | null>(null);
	let searchQuery = $state('');
	let searchMatches = $state<SearchMatch[]>([]);
	let activeMatchIndex = $state(0);
	let viewMode = $state<ViewMode>('tree');
	let expandedPaths = $state<ReadonlySet<string>>(new Set(['(root)']));
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let fileInput: HTMLInputElement;

	// --- derived ---
	// Always recompute formatted output from current input + indent setting
	const formattedOutput = $derived.by(() => {
		if (!isParsed || !input.trim()) return '';
		return stringifyJSON(parsedValue, indent);
	});

	const stats = $derived.by(() => {
		if (!isParsed || parsedValue === null) return null;
		const keys = countKeys(parsedValue);
		const depth = getDepth(parsedValue);
		return { keys, depth, size: new Blob([input]).size };
	});

	const isArrayRoot = $derived(Array.isArray(parsedValue));
	const tableData = $derived.by(() => buildArrayTable(parsedValue, MAX_TABLE_ROWS));

	const activeMatchPath = $derived(searchMatches[activeMatchIndex]?.path ?? null);

	$effect(() => {
		if (viewMode === 'table' && !isArrayRoot) viewMode = 'tree';
	});

	$effect(() => {
		if (autoFormat && isParsed && input.trim() && formattedOutput && input !== formattedOutput) {
			input = formattedOutput;
		}
	});

	// --- core logic ---
	function process(syncInput = autoFormat) {
		if (!input.trim()) {
			reset();
			return;
		}
		const { value, error: err } = parseJSON(input);
		if (err) {
			error = err;
			parsedValue = null;
			isParsed = false;
			searchMatches = [];
			activeMatchIndex = 0;
		} else {
			error = null;
			parsedValue = value;
			isParsed = true;
			expandedPaths = new Set(collectDefaultExpandedPaths(value, 0));
			updateSearchMatches(value);
			if (syncInput) {
				const normalizedOutput = stringifyJSON(value, indent);
				if (input !== normalizedOutput) input = normalizedOutput;
			}
		}
	}

	function reset() {
		error = null;
		parsedValue = null;
		isParsed = false;
		searchMatches = [];
		activeMatchIndex = 0;
		expandedPaths = new Set(['(root)']);
	}

	function onInput() {
		// Always debounce-process regardless of autoFormat so tree stays live
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(process, 300);
	}

	function beautify() {
		if (!input.trim()) return;
		const { output, error: err } = formatJSON(input, indent);
		if (err) {
			error = err;
			return;
		}
		if (output !== null) input = output;
		process(true);
	}

	function minify() {
		if (!input.trim()) return;
		const { output, error: err } = minifyJSON(input);
		if (err) {
			error = err;
			return;
		}
		if (output !== null) input = output;
		process(false);
	}

	function clear() {
		input = '';
		searchQuery = '';
		reset();
	}

	function onSearch() {
		updateSearchMatches(parsedValue);
	}

	function updateSearchMatches(value: unknown) {
		searchMatches = isParsed && searchQuery.trim() ? searchJSON(value, searchQuery) : [];
		activeMatchIndex = 0;
	}

	function expandAll() {
		expandedPaths = new Set(collectExpandablePaths(parsedValue));
	}

	function collapseAll() {
		expandedPaths = new Set<string>();
	}

	function toggleExpandedPath(path: string) {
		const next = new SvelteSet(expandedPaths);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		expandedPaths = next;
	}

	function nextMatch() {
		if (searchMatches.length === 0) return;
		activeMatchIndex = (activeMatchIndex + 1) % searchMatches.length;
		viewMode = 'tree';
	}

	function previousMatch() {
		if (searchMatches.length === 0) return;
		activeMatchIndex = (activeMatchIndex - 1 + searchMatches.length) % searchMatches.length;
		viewMode = 'tree';
	}

	function selectMatch(index: number) {
		activeMatchIndex = index;
		viewMode = 'tree';
	}

	// --- clipboard ---
	async function copyText(text: string, key: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			setTimeout(() => (copied = null), 1500);
		} catch {
			/* not available */
		}
	}

	// --- file ---
	function downloadJSON() {
		if (!formattedOutput) return;
		const blob = new Blob([formattedOutput], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'formatted.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function triggerUpload() {
		fileInput.click();
	}

	function onFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			input = (ev.target?.result as string) ?? '';
			process();
		};
		reader.readAsText(file);
		// reset so same file can be re-uploaded
		(e.target as HTMLInputElement).value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				input = (ev.target?.result as string) ?? '';
				process();
			};
			reader.readAsText(file);
			return;
		}
		const text = e.dataTransfer?.getData('text/plain');
		if (text) {
			input = text;
			process();
		}
	}

	// --- helpers ---
	function countKeys(v: unknown): number {
		if (v === null || typeof v !== 'object') return 0;
		let count = 0;
		const stack: unknown[] = [v];

		while (stack.length > 0) {
			const current = stack.pop();
			if (current === null || typeof current !== 'object') continue;

			const values = Array.isArray(current)
				? current
				: Object.values(current as Record<string, unknown>);

			for (const val of values) {
				count++;
				if (val !== null && typeof val === 'object') stack.push(val);
			}
		}

		return count;
	}

	function getDepth(v: unknown): number {
		if (v === null || typeof v !== 'object') return 0;
		let maxDepth = 0;
		const stack: Array<{ value: unknown; depth: number }> = [{ value: v, depth: 0 }];

		while (stack.length > 0) {
			const item = stack.pop();
			if (!item || item.value === null || typeof item.value !== 'object') continue;

			const children = Array.isArray(item.value)
				? item.value
				: Object.values(item.value as Record<string, unknown>);

			if (children.length === 0) {
				maxDepth = Math.max(maxDepth, item.depth);
				continue;
			}

			for (const child of children) {
				const childDepth = item.depth + 1;
				maxDepth = Math.max(maxDepth, childDepth);
				if (child !== null && typeof child === 'object') {
					stack.push({ value: child, depth: childDepth });
				}
			}
		}

		return maxDepth;
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
</script>

<svelte:head>
	<title>JSON Formatter & Validator – Format, Validate and View JSON Online</title>
	<meta
		name="description"
		content="Format, validate, beautify, minify, and inspect JSON data instantly with a powerful JSON Formatter and Viewer."
	/>
	<meta
		property="og:title"
		content="JSON Formatter & Validator – Format, Validate and View JSON Online"
	/>
	<meta
		property="og:description"
		content="Format, validate, beautify, minify, and inspect JSON data instantly with a powerful JSON Formatter and Viewer."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<h3 class="page-title">JSON Formatter</h3>
<p class="c-text mt-2 text-sm">Format, validate, beautify, minify, and inspect JSON data.</p>

<!-- Toolbar -->
<section class="mt-6 space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		<!-- Primary actions -->
		<button
			onclick={beautify}
			class="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
		>
			Beautify
		</button>
		<button
			onclick={minify}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			>Minify</button
		>
		<button
			onclick={clear}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			>Clear</button
		>
		<button
			onclick={triggerUpload}
			aria-label="Upload JSON file"
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			>Upload</button
		>
		{#if isParsed && formattedOutput}
			<button
				onclick={() => copyText(formattedOutput, 'formatted')}
				aria-label="Copy formatted JSON"
				class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			>
				{copied === 'formatted' ? 'Copied!' : 'Copy'}
			</button>
			<button
				onclick={() => {
					const r = minifyJSON(input);
					if (r.output) copyText(r.output, 'minified');
				}}
				aria-label="Copy minified JSON"
				class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
			>
				{copied === 'minified' ? 'Copied!' : 'Copy Minified'}
			</button>
			<button
				onclick={downloadJSON}
				aria-label="Download JSON file"
				class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
				>Download</button
			>
		{/if}
		<input
			bind:this={fileInput}
			type="file"
			accept=".json,application/json,text/plain"
			onchange={onFileChange}
			class="hidden"
			aria-hidden="true"
		/>
	</div>

	<!-- Options row -->
	<div class="flex flex-wrap items-center gap-4 text-sm">
		<fieldset class="flex items-center gap-2">
			<legend class="mr-1 text-neutral-500 dark:text-neutral-400">Indent:</legend>
			{#each [2, 4, 'tab'] as IndentOption[] as opt (opt)}
				<label
					class="flex cursor-pointer items-center gap-1 text-neutral-700 dark:text-neutral-300"
				>
					<input
						type="radio"
						name="indent"
						value={opt}
						bind:group={indent}
						class="accent-neutral-700 dark:accent-neutral-300"
					/>
					{opt === 'tab' ? 'Tab' : `${opt} spaces`}
				</label>
			{/each}
		</fieldset>
		<label class="flex cursor-pointer items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
			<input
				type="checkbox"
				bind:checked={autoFormat}
				class="accent-neutral-700 dark:accent-neutral-300"
			/>
			Auto-format
		</label>
	</div>
</section>

<!-- Editor -->
<section class="mt-4">
	<label class="c-text mb-2 block text-sm font-medium" for="json-input">JSON Input</label>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div ondragover={(e) => e.preventDefault()} ondrop={onDrop} class="relative">
		<textarea
			id="json-input"
			bind:value={input}
			oninput={onInput}
			placeholder={'{\n  "paste": "your JSON here"\n}'}
			rows={14}
			spellcheck={false}
			autocomplete="off"
			aria-label="JSON input editor"
			aria-describedby={error ? 'json-error' : undefined}
			aria-invalid={error ? 'true' : undefined}
			class="w-full resize-y rounded-lg border bg-white px-3 py-3 font-mono text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none dark:bg-neutral-950 dark:text-neutral-200 dark:placeholder-neutral-700 {error
				? 'border-red-400 dark:border-red-600'
				: isParsed
					? 'border-green-400 dark:border-green-700'
					: 'border-neutral-300 dark:border-neutral-700'}"
		></textarea>
		{#if !autoFormat}
			<button
				onclick={() => process(false)}
				class="absolute right-3 bottom-3 rounded bg-neutral-800 px-3 py-1 text-xs text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900"
			>
				Validate &amp; Parse
			</button>
		{/if}
	</div>

	<!-- Error -->
	{#if error}
		<p id="json-error" role="alert" class="mt-1.5 text-sm text-red-500 dark:text-red-400">
			{error.message}
			{#if error.line !== null}
				<span class="ml-1 text-xs opacity-70"
					>(line {error.line}{error.column !== null ? `, col ${error.column}` : ''})</span
				>
			{/if}
		</p>
	{:else if isParsed}
		<p class="mt-1.5 text-sm text-green-600 dark:text-green-400" role="status" aria-live="polite">
			✓ Valid JSON
		</p>
	{/if}
</section>

<!-- Stats -->
{#if stats}
	<div class="mt-3 flex flex-wrap gap-4 text-xs text-neutral-400 dark:text-neutral-600">
		<span>{stats.keys} total {stats.keys === 1 ? 'key' : 'keys'}</span>
		<span>depth: {stats.depth}</span>
		<span>{formatBytes(stats.size)}</span>
	</div>
{/if}

<!-- Search -->
{#if isParsed}
	<section class="mt-6">
		<div class="flex items-center gap-2">
			<label class="sr-only" for="json-search">Search keys and values</label>
			<input
				id="json-search"
				type="search"
				bind:value={searchQuery}
				oninput={onSearch}
				placeholder="Search keys and values…"
				class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:placeholder-neutral-600 dark:focus:border-neutral-500"
			/>
			{#if searchQuery}
				<span class="shrink-0 text-xs text-neutral-400 dark:text-neutral-600">
					{searchMatches.length > 0 ? activeMatchIndex + 1 : 0}/{searchMatches.length}
					{searchMatches.length === 1 ? 'match' : 'matches'}
				</span>
				<button
					type="button"
					onclick={previousMatch}
					disabled={searchMatches.length === 0}
					class="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
				>
					Prev
				</button>
				<button
					type="button"
					onclick={nextMatch}
					disabled={searchMatches.length === 0}
					class="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
				>
					Next
				</button>
			{/if}
		</div>

		<!-- Search results list -->
		{#if searchMatches.length > 0}
			<ul
				class="mt-2 max-h-40 space-y-0 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800"
				role="list"
				aria-label="Search results"
			>
				{#each searchMatches as match, index (match.path)}
					<li class="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
						<button
							type="button"
							onclick={() => selectMatch(index)}
							class="flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-xs {index ===
							activeMatchIndex
								? 'bg-amber-50 dark:bg-amber-950/60'
								: 'hover:bg-neutral-50 dark:hover:bg-neutral-900'}"
						>
							<span class="min-w-0 flex-1 truncate text-neutral-500 dark:text-neutral-400"
								>{match.path}</span
							>
							{#if match.keyMatch}
								<span
									class="rounded bg-yellow-100 px-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
									>key</span
								>
							{/if}
							{#if match.valueMatch}
								<span
									class="rounded bg-blue-100 px-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>value</span
								>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{:else if searchQuery}
			<p class="mt-2 text-xs text-neutral-400 dark:text-neutral-600">No matches found.</p>
		{/if}
	</section>

	<!-- Parsed data view -->
	<section class="mt-6" aria-label="JSON data view">
		<div class="mb-2 flex items-center justify-between">
			<div class="inline-flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
				<button
					type="button"
					onclick={() => (viewMode = 'tree')}
					aria-pressed={viewMode === 'tree'}
					class="rounded-md px-3 py-1.5 text-xs font-medium {viewMode === 'tree'
						? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
						: 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'}"
				>
					Tree View
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'table')}
					aria-pressed={viewMode === 'table'}
					disabled={!isArrayRoot}
					class="rounded-md px-3 py-1.5 text-xs font-medium {viewMode === 'table'
						? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
						: 'text-neutral-500 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:text-neutral-100'}"
				>
					Table View
				</button>
			</div>
			{#if viewMode === 'tree'}
				<div class="flex gap-2">
					<button
						type="button"
						onclick={expandAll}
						class="text-xs text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
					>
						Expand all
					</button>
					<button
						type="button"
						onclick={collapseAll}
						class="text-xs text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
					>
						Collapse all
					</button>
				</div>
			{/if}
		</div>

		{#if viewMode === 'tree'}
			<div
				class="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950"
				role="tree"
				aria-label="JSON structure"
			>
				<JsonNode
					value={parsedValue}
					depth={0}
					path="(root)"
					{expandedPaths}
					onToggle={toggleExpandedPath}
					{searchMatches}
					{searchQuery}
					{activeMatchPath}
				/>
			</div>
		{:else if tableData}
			<div
				class="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
			>
				<div class="max-h-128 overflow-auto">
					<table class="min-w-full table-fixed text-left font-mono text-xs">
						<thead
							class="sticky top-0 bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
						>
							<tr>
								<th class="w-16 px-3 py-2 font-medium">#</th>
								{#each tableData.columns as column (column.key)}
									<th class="min-w-40 px-3 py-2 font-medium">{column.label}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each tableData.rows as row (row.index)}
								<tr class="border-t border-neutral-100 dark:border-neutral-800">
									<td class="px-3 py-2 text-neutral-400 dark:text-neutral-600">{row.index}</td>
									{#each tableData.columns as column (column.key)}
										<td class="px-3 py-2 break-all text-neutral-800 dark:text-neutral-100">
											{row.cells[column.key]}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if tableData.rows.length === 0}
					<p
						class="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-600"
					>
						Empty array.
					</p>
				{/if}
				{#if tableData.truncated}
					<p
						class="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-600"
					>
						Showing first {MAX_TABLE_ROWS.toLocaleString()} of {tableData.totalRows.toLocaleString()}
						rows.
					</p>
				{/if}
			</div>
		{/if}
	</section>
{/if}
