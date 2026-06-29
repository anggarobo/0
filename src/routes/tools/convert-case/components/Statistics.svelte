<script lang="ts">
	import type { TextStats } from '../lib/convert/statistics';

	export let stats: TextStats | null = null;

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
</script>

{#if stats}
	<section aria-label="Live statistics">
		<div class="flex flex-wrap gap-1 text-xs text-neutral-500 dark:text-neutral-400">
			<span class="rounded bg-neutral-50 pr-2 py-1 dark:bg-neutral-900"
				>{stats.characters} chars</span
			>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900"
				>{stats.charactersWithoutSpaces} no-spaces</span
			>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900">{stats.words} words</span>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900">{stats.lines} lines</span>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900"
				>{stats.paragraphs} paragraphs</span
			>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900"
				>{stats.sentences} sentences</span
			>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900">
				{stats.readingTimeMinutes.toFixed(2)} min read
			</span>
			<span class="rounded bg-neutral-50 px-2 py-1 dark:bg-neutral-900"
				>{formatBytes(stats.byteSize)}</span
			>
		</div>
	</section>
{/if}
