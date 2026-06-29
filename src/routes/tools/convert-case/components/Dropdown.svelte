<script lang="ts" context="module">
	export type Action = {
		key: string;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let title: string;
	export let actions: readonly Action[];
	export let onAction: (key: string) => void;

	let selected = '';
	let open = false;
	let rootEl: HTMLElement | null = null;

	const CLOSE_EVENT = 'convert-case-dropdown-close-all';

	function closeOthers() {
		if (!browser) return;

		window.dispatchEvent(
			new CustomEvent(CLOSE_EVENT, {
				detail: rootEl
			})
		);
	}

	function onCloseAll(event: Event) {
		const custom = event as CustomEvent<HTMLElement | null>;

		// Ignore the event sent by ourselves.
		if (custom.detail === rootEl) return;

		open = false;
	}

	function onDocumentClick(event: MouseEvent) {
		if (!open) return;

		const target = event.target as Node | null;

		if (target && rootEl?.contains(target)) return;

		open = false;
	}

	onMount(() => {
		if (!browser) return;

		document.addEventListener('click', onDocumentClick);
		window.addEventListener(CLOSE_EVENT, onCloseAll);

		return () => {
			document.removeEventListener('click', onDocumentClick);
			window.removeEventListener(CLOSE_EVENT, onCloseAll);
		};
	});
</script>

<section class="w-full" bind:this={rootEl}>
	<h4 class="c-text mb-2 text-xs font-medium tracking-wide uppercase opacity-60">
		{title}
	</h4>

	<div class="w-full">
		<button
			type="button"
			class="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-800 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:focus:border-neutral-500"
			aria-haspopup="menu"
			aria-expanded={open}
			on:click|stopPropagation={() => {
				if (!open) {
					closeOthers();
				}

				open = !open;
			}}
		>
			<span class="block truncate">
				{selected
					? (actions.find((a) => a.key === selected)?.label ?? 'Select option…')
					: 'Select option…'}
			</span>

			<span class="shrink-0">▾</span>
		</button>

		{#if open}
			<div class="relative w-full">
				<ul
					class="absolute top-full right-0 z-10 mt-2 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
					role="menu"
				>
					{#each actions as action (action.key)}
						<li class="mt-1 mb-0">
							<button
								type="button"
								disabled={action.disabled}
								class="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
								on:click={() => {
									if (action.disabled) return;

									selected = action.key;
									open = false;
									onAction(action.key);
								}}
							>
								<span class="truncate">{action.label}</span>

								{#if selected === action.key}
									<span class="shrink-0 text-lg opacity-60">✓</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</section>
