<script lang="ts">
	type ActionOption = {
		key: string;
		label: string;
		disabled?: boolean;
	};

	export let title: string;
	export let options: readonly ActionOption[];
	export let placeholder: string | undefined;
	export let onSelect: (key: string) => void;

	let selected: string = '';

	function commit() {
		if (!selected) return;
		onSelect(selected);
		selected = '';
	}
</script>

<section class="w-full">
	<h4 class="c-text mb-2 text-xs font-medium tracking-wide uppercase opacity-60">{title}</h4>
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
		<select
			bind:value={selected}
			aria-label={title}
			class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:focus:border-neutral-500"
		>
			<option value="" disabled selected>
				{placeholder ?? 'Select option…'}
			</option>
			{#each options as opt (opt.key)}
				<option value={opt.key} disabled={opt.disabled}>
					{opt.label}
				</option>
			{/each}
		</select>
		<button
			type="button"
			class="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
			onclick={commit}
			disabled={!selected}
		>
			Apply
		</button>
	</div>
</section>
