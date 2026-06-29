<script lang="ts" context="module">
	export type Action = {
		key: string;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let title: string;
	export let actions: readonly Action[];

	export let onAction: (key: string) => void;

	let selected = '';
	let open = false;
	let rootEl: HTMLElement | null = null;

	// Close other dropdowns when this one opens
	function closeAllDropdowns(except: HTMLElement | null) {
		const roots = document.querySelectorAll('[data-convert-case-dropdown-root="true"]');
		for (const r of Array.from(roots)) {
			if (except && r === except) continue;
			const detailsEl = r as HTMLElement;
			detailsEl.dispatchEvent(new CustomEvent('convert-case-dropdown-close', { bubbles: false }));
		}
	}


	function toggle(e: MouseEvent) {
		e.stopPropagation();
		closeAllDropdowns(rootEl);
		open = !open;
	}


	function onDocumentClick(e: MouseEvent) {
		if (!open) return;
		const t = e.target as Node | null;
		if (!t) return;
		if (rootEl && rootEl.contains(t)) return;
		open = false;
	}

	onMount(() => {
		document.addEventListener('click', onDocumentClick);
	});

	onDestroy(() => {
		document.removeEventListener('click', onDocumentClick);
	});
</script>

<section class="w-full" bind:this={rootEl}>
	<h4 class="c-text mb-2 text-xs font-medium tracking-wide uppercase opacity-60">{title}</h4>

	<div class="w-full">

		<button
			type="button"
			class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-800 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:focus:border-neutral-500 flex items-center justify-between gap-3"
			aria-haspopup="menu"
			aria-expanded={open}
	onclick={(e) => {
				closeAllDropdowns(rootEl);
				toggle(e);
			}}
			>

			<span class="block truncate">
				{selected
					? actions.find((a) => a.key === selected)?.label ?? 'Select option…'
					: 'Select option…'}
			</span>
			<span class="shrink-0">▾</span>
		</button>

		{#if open}
			<div class="relative w-full">
				<ul
					class="absolute right-0 top-full z-10 mt-2 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
					role="menu"
				>
					{#each actions as action (action.key)}
						<li class="mb-0 mt-1">
							<button
								type="button"
								disabled={action.disabled}
								class="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-900"

								onclick={() => {
									if (action.disabled) return;
									selected = action.key;
									onAction(action.key);
									open = false;
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

