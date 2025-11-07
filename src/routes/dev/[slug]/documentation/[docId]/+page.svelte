<script lang="ts">
	let { data } = $props();
	import { onMount } from 'svelte';

	let taskName = $derived.by(() => {
		let task = '';
		if (data.data?.meta?.name?.includes('|')) {
			const titleParts = data.data.meta.name.split('|');
			task = titleParts[1].replace('.docx', '').replace('[GO]', '');
		} else {
			task = data.data.meta.name || '';
		}
		return task;
	});

	const downloadLink = data?.data?.meta?.webViewLink?.split('edit?')[0] + 'export?format=pdf';

	let container: HTMLDivElement;
	let div: HTMLHeadElement;

	onMount(() => {
		if (container) container.innerHTML = data.data.html;
		if (div)
			div.classList.value =
				'page-title text-4xl font-medium text-neutral-700 dark:text-neutral-300';
	});
</script>

<div bind:this={div}>{taskName}</div>
<section
	class="relative mt-8 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 dark:bg-neutral-100"
>
	<div class="docs-container" bind:this={container}></div>
	<div class="text-right">
		<a
			aria-label="download-link"
			class="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-neutral-200 bg-gray-100/90 text-indigo-700 hover:text-indigo-600"
			href={downloadLink}
			download={true}
			title="Download"
		>
			📥
		</a>
	</div>
</section>

<style>
	.docs-container {
		all: initial; /* Reset semua style Svelte */
		font-family: Arial, sans-serif;
		line-height: 1.5;
		color: #000;
	}

	.docs-container * {
		all: revert; /* Revert ke default browser */
	}

	.docs-container h1,
	.docs-container h2 {
		font-weight: bold;
	}

	.docs-container table {
		border-collapse: collapse;
		width: 100%;
	}
</style>
