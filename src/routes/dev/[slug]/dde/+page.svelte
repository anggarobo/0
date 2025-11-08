<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let loading = $state(false);
	const rows = writable<DDE[]>([]);

	async function loadData() {
		loading = true;
		// const res = await fetch('/api/sheets');
		const res = await fetch('/api/dde');
		const { data } = await res.json();
		if (data) {
			rows.set(data);
			loading = false;
		}
	}

	onMount(loadData);
</script>

<h3 class="page-title">Detailed Development Enhancement</h3>
<section class="mt-8">
	<dl class="grid grid-cols-1 gap-y-4">
		{#if loading}
			<p class="text-gray-500">Fetching...</p>
		{:else}
			{#each $rows as r}
				<div class="pt-2">
					<dt class="font-medium">
						<a href={`/dev/dataon/dde/${r.ticket}?row=${r.id}`}>{r.task_name}</a>
					</dt>
					<dd class="mt-2 text-sm">{r.ticket}</dd>
				</div>
			{/each}
		{/if}
	</dl>
</section>
