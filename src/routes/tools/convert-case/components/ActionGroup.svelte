<script lang="ts" context="module">
	export type Action = {
		key: string;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	export let title: string;
	export let actions: readonly Action[];

	export let onAction: (key: string) => void;
</script>

<section class="w-full">
	<h4 class="c-text mb-2 text-xs font-medium tracking-wide uppercase opacity-60">{title}</h4>
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
		<select
			aria-label={title}
			class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:focus:border-neutral-500"
			onchange={(e) => {
				const value = (e.currentTarget as HTMLSelectElement).value;
				if (value) onAction(value);
			}}
		>
			<option class="rounded-lg" value="" disabled selected>Select option…</option>
			{#each actions as action (action.key)}
				<option class="rounded-lg" value={action.key} disabled={action.disabled}>
					{action.label}
				</option>
			{/each}
		</select>
		<span class="sr-only">Select option and activate</span>
	</div>
</section>
