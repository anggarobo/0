<script lang="ts">
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { params } = $props();
	const task = writable<SheetRow>(undefined);
	const row = page.url.searchParams.get('row');

	async function download() {
		const payload: SheetRow = {
			content: $task.content,
			meta: $task.meta,
			id: $task.id,
			task_name: $task.task_name,
			ticket: $task.ticket
		};
		try {
			const response = await fetch('/api/sheets/download', {
				body: JSON.stringify(payload),
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${$task.ticket}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
		}
	}

	async function loadData() {
		const res = await fetch(`/api/sheets?ticket=${params.ticket}&row=${row}`);
		const { data } = await res.json();
		task.set(data[0]);
	}

	onMount(loadData);
</script>

{#if Boolean($task)}
	<h3 class="page-title">{$task.task_name}</h3>
	<p class="c-text mt-1 text-neutral-500">{$task.ticket}</p>

	<div class="relative mt-6 grid grid-cols-1 gap-2 md:grid-cols-2">
		<button
			title="Download"
			class="absolute top-0 right-0 cursor-pointer text-neutral-600 hover:text-indigo-600 dark:text-neutral-400"
			onclick={download}
		>
			<span class="material-symbols-rounded"> archive </span>
		</button>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> snippet_folder </span>
			<p>
				{$task.meta?.project}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> date_range </span>
			<p>
				{$task.meta?.date}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> calendar_clock </span>
			<p>
				{$task.meta?.budget_days}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> deployed_code </span>
			<p>
				{$task.meta?.release_date || '-'} / {$task.meta?.target_release}
			</p>
		</div>
	</div>
	<section class="mt-8">
		<div class="mt-4">
			<p class="c-text text-xl font-semibold">Description</p>
			<div class="c-text">{@html $task.content.description.brief}</div>
			<div class="c-text mt-4">{@html $task.content.description.detail}</div>
		</div>
		<div class="mt-4">
			<p class="c-text text-xl font-semibold">Process Flow</p>
			<div class="c-text">{@html $task.content.description.brief}</div>
		</div>
	</section>
{:else}
	<p class="text-gray-500">Loading...</p>
{/if}
