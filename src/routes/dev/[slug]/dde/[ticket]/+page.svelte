<script lang="ts">
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let { params } = $props();
	// const task = writable<SheetRow>(undefined);
	const task = writable<DDE>(undefined);
	const staticData = writable<StaticDataDDE>(undefined);
	const row = page.url.searchParams.get('row');
	let loading = $state({ download: false, task: false, staticData: false });

	// async function download() {
	// 	const payload: SheetRow = {
	// 		content: $task.content,
	// 		meta: $task.meta,
	// 		id: $task.id,
	// 		task_name: $task.task_name,
	// 		ticket: $task.ticket
	// 	};
	// 	try {
	// 		const response = await fetch('/api/sheets/download', {
	// 			body: JSON.stringify(payload),
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' }
	// 		});
	// 		const blob = await response.blob();
	// 		const url = URL.createObjectURL(blob);
	// 		const a = document.createElement('a');
	// 		a.href = url;
	// 		a.download = `${$task.ticket}.pdf`;
	// 		a.click();
	// 		URL.revokeObjectURL(url);
	// 	} catch (err) {
	// 		console.error(err);
	// 	}
	// }

	async function download() {
		const payload: DDE & StaticDataDDE = {
			content: $task.content,
			id: $task.id,
			task_name: $task.task_name,
			ticket: $task.ticket,
			budget_days: $task.budget_days,
			date: $task.date,
			document_no: $task.document_no,
			target_release: $task.target_release,
			release_date: $task.release_date,
			revision_date: $task.revision_date,
			revision_no: $task.revision_no,
			...$staticData
		};
		loading.download = true;
		try {
			const response = await fetch('/api/dde/export', {
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
		} finally {
			loading.download = false;
		}
	}

	async function loadData() {
		loading.task = true;
		try {
			const res = await fetch(`/api/dde?ticket=${params.ticket}&row=${row}`);
			const { data } = await res.json();
			task.set(data[0]);
		} catch (error) {
			console.error(error);
		} finally {
			loading.task = false;
		}
	}

	async function loadStaticData() {
		loading.staticData = true;
		try {
			const res = await fetch(`/api/dde/static?ticket=${params.ticket}&row=${row}`);
			const { data } = await res.json();
			staticData.set(data[0]);
		} catch (error) {
			console.error(error);
		} finally {
			loading.staticData = false;
		}
	}

	onMount(loadStaticData);
	onMount(loadData);
</script>

{#if !loading.task && Boolean($task)}
	<h3 class="page-title">{$task.task_name}</h3>
	<p class="c-text mt-1 text-neutral-500">{$task.ticket}</p>

	<div class="relative mt-6 grid grid-cols-1 gap-2 md:grid-cols-2">
		<button
			title="Download"
			class="absolute top-0 right-0 flex cursor-pointer items-center justify-center text-neutral-600 hover:text-indigo-600 dark:text-neutral-400"
			onclick={download}
		>
			{#if loading.download}
				<svg
					class="size-5 animate-spin text-neutral-600 dark:text-neutral-400"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle><path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path></svg
				>
			{:else}
				<span class="material-symbols-rounded animate-bounce"> arrow_downward </span>
			{/if}
		</button>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> snippet_folder </span>
			<p>
				{$staticData?.project}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> calendar_clock </span>
			<p>
				{$task?.date}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> hourglass_top </span>
			<p>
				{$task?.budget_days}
			</p>
		</div>
		<div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
			<span class="material-symbols-rounded"> rocket_launch </span>
			<p>
				{$task?.release_date || '-'} / {$task?.target_release}
			</p>
		</div>
	</div>
	<section class="mt-8">
		<div class="mt-4">
			<p class="c-text text-xl font-semibold">Description</p>
			<div class="c-text">{@html $task.content.brief_description}</div>
			<div class="c-text mt-4">{@html $task.content.detail_description}</div>
		</div>
		<div class="mt-4">
			<p class="c-text text-xl font-semibold">Process Flow</p>
			<div class="c-text">{@html $task.content.process_flow}</div>
		</div>
	</section>
{:else if loading.task}
	<p class="text-gray-500">Fetching...</p>
{:else}
	<p class="text-gray-500">Something went wrong</p>
{/if}
