<script lang="ts">
	import { parseURL, toQueryParamsJSON } from '$lib/utils/url-parser';
	import type { ParseResult } from '$lib/utils/url-parser';

	let input = $state('');
	let result = $state<ParseResult>({ parsed: null, error: null });
	let copied = $state<string | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function parse() {
		result = parseURL(input);
	}

	function clear() {
		input = '';
		result = { parsed: null, error: null };
	}

	function onInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => parse(), 300);
	}

	async function copyText(text: string, key: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			setTimeout(() => (copied = null), 1500);
		} catch {
			// clipboard not available
		}
	}

	function copyParsedResult() {
		if (!result.parsed) return;
		const { parsed } = result;
		const text = [
			`Protocol:   ${parsed.protocol}`,
			`Hostname:   ${parsed.hostname}`,
			`Port:       ${parsed.port || '(default)'}`,
			`Origin:     ${parsed.origin}`,
			`Pathname:   ${parsed.pathname}`,
			`Query:      ${parsed.search || '(none)'}`,
			`Fragment:   ${parsed.hash || '(none)'}`
		].join('\n');
		copyText(text, 'result');
	}

	function copyQueryJSON() {
		if (!result.parsed) return;
		copyText(toQueryParamsJSON(result.parsed.queryParams), 'json');
	}

	const fields = $derived(
		result.parsed
			? [
					{ label: 'Protocol', value: result.parsed.protocol },
					{ label: 'Hostname', value: result.parsed.hostname },
					{ label: 'Port', value: result.parsed.port || '(default)' },
					{ label: 'Origin', value: result.parsed.origin },
					{ label: 'Pathname', value: result.parsed.pathname },
					{ label: 'Query String', value: result.parsed.search || '(none)' },
					{ label: 'Fragment', value: result.parsed.hash || '(none)' }
				]
			: []
	);
</script>

<svelte:head>
	<title>URL Parser Tool – Parse URLs and Query Parameters</title>
	<meta
		name="description"
		content="Parse URLs into protocol, hostname, path, query string, fragment, and query parameters instantly."
	/>
	<meta property="og:title" content="URL Parser Tool – Parse URLs and Query Parameters" />
	<meta
		property="og:description"
		content="Parse URLs into protocol, hostname, path, query string, fragment, and query parameters instantly."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<h3 class="page-title">URL Parser</h3>
<p class="c-text mt-2 text-sm">Parse a URL into its components and extract query parameters.</p>

<section class="mt-8 space-y-4">
	<!-- Input -->
	<div>
		<label class="c-text mb-2 block text-sm font-medium" for="url-input">URL</label>
		<textarea
			id="url-input"
			bind:value={input}
			oninput={onInput}
			placeholder="https://example.com/path?foo=bar&baz=qux#section"
			rows={3}
			spellcheck={false}
			autocomplete="off"
			aria-label="Enter a URL to parse"
			aria-describedby={result.error ? 'url-error' : undefined}
			aria-invalid={result.error ? 'true' : undefined}
			class="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder-neutral-600 dark:focus:border-neutral-500"
		></textarea>

		{#if result.error}
			<p id="url-error" role="alert" class="mt-1 text-sm text-red-500 dark:text-red-400">
				{result.error}
			</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="flex flex-wrap gap-2">
		<button
			onclick={parse}
			class="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
		>
			Parse
		</button>
		<button
			onclick={clear}
			class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
		>
			Clear
		</button>

		{#if result.parsed}
			<button
				onclick={copyParsedResult}
				class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
				aria-label="Copy parsed result to clipboard"
			>
				{copied === 'result' ? 'Copied!' : 'Copy Result'}
			</button>

			{#if result.parsed.queryParams.length > 0}
				<button
					onclick={copyQueryJSON}
					class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
					aria-label="Copy query parameters as JSON"
				>
					{copied === 'json' ? 'Copied!' : 'Copy Params as JSON'}
				</button>
			{/if}
		{/if}
	</div>
</section>

<!-- Results -->
{#if result.parsed}
	{@const parsed = result.parsed}

	<section class="mt-8 space-y-6" aria-label="Parsed URL components">
		<!-- URL Components -->
		<div>
			<h4 class="c-text mb-3 text-sm font-medium tracking-wide uppercase opacity-60">Components</h4>
			<dl class="divide-y divide-neutral-100 dark:divide-neutral-800">
				{#each fields as field (field.label)}
					<div class="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
						<dt class="w-32 shrink-0 text-sm font-medium text-neutral-500 dark:text-neutral-400">
							{field.label}
						</dt>
						<dd class="min-w-0 font-mono text-sm break-all text-neutral-800 dark:text-neutral-200">
							{field.value}
						</dd>
					</div>
				{/each}
			</dl>
		</div>

		<!-- Query Parameters -->
		{#if parsed.queryParams.length > 0}
			<div>
				<h4 class="c-text mb-3 text-sm font-medium tracking-wide uppercase opacity-60">
					Query Parameters ({parsed.queryParams.length})
				</h4>
				<div class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
					<table class="w-full text-sm" aria-label="Query parameters">
						<thead>
							<tr class="bg-neutral-50 dark:bg-neutral-900">
								<th
									scope="col"
									class="px-4 py-2 text-left font-medium text-neutral-500 dark:text-neutral-400"
									>#</th
								>
								<th
									scope="col"
									class="px-4 py-2 text-left font-medium text-neutral-500 dark:text-neutral-400"
									>Key</th
								>
								<th
									scope="col"
									class="px-4 py-2 text-left font-medium text-neutral-500 dark:text-neutral-400"
									>Value</th
								>
								<th
									scope="col"
									class="px-4 py-2 text-left font-medium text-neutral-500 dark:text-neutral-400"
									>Decoded Key</th
								>
								<th
									scope="col"
									class="px-4 py-2 text-left font-medium text-neutral-500 dark:text-neutral-400"
									>Decoded Value</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
							{#each parsed.queryParams as param, i (i)}
								<tr class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
									<td class="px-4 py-2 text-neutral-400 dark:text-neutral-600">{i + 1}</td>
									<td class="px-4 py-2 font-mono text-neutral-800 dark:text-neutral-200">
										{#if param.key === ''}
											<span class="italic opacity-50">(empty)</span>
										{:else}
											{param.key}
										{/if}
									</td>
									<td class="px-4 py-2 font-mono text-neutral-800 dark:text-neutral-200">
										{#if param.value === ''}
											<span class="text-neutral-400 italic dark:text-neutral-600">(empty)</span>
										{:else}
											{param.value}
										{/if}
									</td>
									<td class="px-4 py-2 font-mono text-neutral-600 dark:text-neutral-400"
										>{param.decoded.key}</td
									>
									<td class="px-4 py-2 font-mono text-neutral-600 dark:text-neutral-400">
										{#if param.decoded.value === ''}
											<span class="text-neutral-400 italic dark:text-neutral-600">(empty)</span>
										{:else}
											{param.decoded.value}
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<p class="text-sm text-neutral-400 dark:text-neutral-600">No query parameters found.</p>
		{/if}
	</section>
{/if}
