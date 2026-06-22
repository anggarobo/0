<script lang="ts">
	import JsonNode from './JsonNode.svelte';
	import { appendArrayIndex, appendObjectKey, getNodeType } from '$lib/utils/json-formatter';
	import type { SearchMatch } from '$lib/utils/json-formatter';

	interface Props {
		value: unknown;
		nodeKey?: string | null;
		path?: string;
		depth?: number;
		expandedPaths?: ReadonlySet<string>;
		onToggle?: (path: string) => void;
		searchMatches?: SearchMatch[];
		searchQuery?: string;
		activeMatchPath?: string | null;
	}

	let {
		value,
		nodeKey = null,
		path = '(root)',
		depth = 0,
		expandedPaths = new Set<string>(['(root)']),
		onToggle = () => undefined,
		searchMatches = [],
		searchQuery = '',
		activeMatchPath = null
	}: Props = $props();

	const type = $derived(getNodeType(value));
	const isExpandable = $derived(type === 'object' || type === 'array');

	const entries = $derived.by(() => {
		if (type === 'array')
			return (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown]);
		if (type === 'object') return Object.entries(value as Record<string, unknown>);
		return [];
	});

	const childCount = $derived(entries.length);
	const exactMatch = $derived(searchMatches.find((match) => match.path === path) ?? null);
	const hasDescendantMatch = $derived(
		searchMatches.some((match) => isDescendantPath(match.path, path))
	);
	const isActiveMatch = $derived(activeMatchPath === path);
	const expanded = $derived(
		isExpandable && (expandedPaths.has(path) || (searchQuery.trim() !== '' && hasDescendantMatch))
	);

	interface TextPart {
		text: string;
		highlight: boolean;
	}

	function childPath(k: string): string {
		if (type === 'array') return appendArrayIndex(path, Number(k));
		return appendObjectKey(path, k);
	}

	function isDescendantPath(candidate: string, parent: string): boolean {
		if (candidate === parent) return false;
		if (parent === '(root)') return candidate !== '(root)';
		return candidate.startsWith(`${parent}.`) || candidate.startsWith(`${parent}[`);
	}

	function splitHighlight(text: string): TextPart[] {
		const query = searchQuery.trim();
		if (!query) return [{ text, highlight: false }];

		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const parts: TextPart[] = [];
		let offset = 0;

		while (offset < text.length) {
			const index = lowerText.indexOf(lowerQuery, offset);
			if (index === -1) {
				parts.push({ text: text.slice(offset), highlight: false });
				break;
			}
			if (index > offset) {
				parts.push({ text: text.slice(offset, index), highlight: false });
			}
			parts.push({ text: text.slice(index, index + query.length), highlight: true });
			offset = index + query.length;
		}

		return parts.length ? parts : [{ text, highlight: false }];
	}

	function displayValue(v: unknown): string {
		if (v === null) return 'null';
		return String(v);
	}

	const typeColors: Record<string, string> = {
		string: 'text-green-600 dark:text-green-400',
		number: 'text-blue-600 dark:text-blue-400',
		boolean: 'text-purple-600 dark:text-purple-400',
		null: 'text-neutral-400 dark:text-neutral-500'
	};
</script>

<div
	class="min-w-max font-mono text-sm leading-6"
	role="treeitem"
	aria-expanded={isExpandable ? expanded : undefined}
	aria-selected={isActiveMatch}
>
	{#if isExpandable}
		<button
			type="button"
			onclick={() => onToggle(path)}
			aria-label={expanded ? 'Collapse node' : 'Expand node'}
			class="flex min-w-full items-start gap-1 rounded-sm text-left text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 {isActiveMatch
				? 'bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-950 dark:ring-amber-700'
				: ''}"
		>
			<span
				class="flex h-6 w-5 shrink-0 items-center justify-center text-xs opacity-60 select-none"
			>
				{expanded ? '▾' : '▸'}
			</span>
			<span class="min-w-0 break-all">
				{#if nodeKey !== null}
					<span class="text-neutral-500 dark:text-neutral-400">
						"{#each splitHighlight(nodeKey) as part, index (`key-${path}-${index}`)}{#if exactMatch?.keyMatch && part.highlight}<mark
									class="rounded bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800"
									>{part.text}</mark
								>{:else}{part.text}{/if}{/each}":
					</span>
				{/if}
				<span class="text-neutral-500 dark:text-neutral-400">{type === 'array' ? '[' : '{'}</span>
				{#if !expanded}
					<span class="text-xs text-neutral-400 dark:text-neutral-600">
						{childCount}
						{type === 'array'
							? childCount === 1
								? 'item'
								: 'items'
							: childCount === 1
								? 'key'
								: 'keys'}
					</span>
					<span class="text-neutral-500 dark:text-neutral-400">{type === 'array' ? ']' : '}'}</span>
				{/if}
			</span>
		</button>

		{#if expanded}
			<div class="ml-5 border-l border-neutral-200 pl-3 dark:border-neutral-800" role="group">
				{#each entries as [k, v] (childPath(k))}
					<JsonNode
						value={v}
						nodeKey={type === 'object' ? k : null}
						path={childPath(k)}
						depth={depth + 1}
						{expandedPaths}
						{onToggle}
						{searchMatches}
						{searchQuery}
						{activeMatchPath}
					/>
				{/each}
			</div>
			<div class="ml-5 pl-3 text-neutral-500 dark:text-neutral-400">
				{type === 'array' ? ']' : '}'}
			</div>
		{/if}
	{:else}
		{@const colorClass = typeColors[type] ?? ''}
		<div
			class="flex min-w-full items-start gap-1 rounded-sm {isActiveMatch
				? 'bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-950 dark:ring-amber-700'
				: ''}"
		>
			<span class="h-6 w-5 shrink-0"></span>
			<span class="min-w-0 break-all">
				{#if nodeKey !== null}
					<span class="text-neutral-500 dark:text-neutral-400">
						"{#each splitHighlight(nodeKey) as part, index (`key-${path}-${index}`)}{#if exactMatch?.keyMatch && part.highlight}<mark
									class="rounded bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800"
									>{part.text}</mark
								>{:else}{part.text}{/if}{/each}":
					</span>
				{/if}
				<span class={colorClass}>
					{#if type === 'string'}"{/if}{#each splitHighlight(displayValue(value)) as part, index (`value-${path}-${index}`)}{#if exactMatch?.valueMatch && part.highlight}<mark
								class="rounded bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800"
								>{part.text}</mark
							>{:else}{part.text}{/if}{/each}{#if type === 'string'}"{/if}
				</span>
			</span>
		</div>
	{/if}
</div>
