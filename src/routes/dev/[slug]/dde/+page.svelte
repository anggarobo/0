<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const rows = writable<SheetRow[]>([]);

	async function loadData() {
		const res = await fetch('/api/sheets');
		const { data } = await res.json();
		rows.set(data);
	}

	onMount(loadData);
</script>

<h3 class="page-title">Detailed Development Enhancement</h3>
<section class="mt-8">
	<dl class="grid grid-cols-1 gap-y-4">
		{#each $rows as r}
			<div class="pt-2">
				<dt class="font-medium">
					<a href={`/dev/dataon/dde/${r.ticket}?row=${r.id}`}>{r.task_name}</a>
				</dt>
				<dd class="mt-2 text-sm">{r.ticket}</dd>
			</div>
		{/each}
	</dl>
</section>
