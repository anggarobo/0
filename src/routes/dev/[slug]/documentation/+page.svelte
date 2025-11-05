<script lang="ts">
	let { params, data } = $props();
	const company = params.slug[0].toUpperCase() + params.slug.slice(1)
</script>

<h3 class="page-title">{company}'s Documentation</h3>
<section class="mt-8">
	<!-- {#if !data?.data}
		<p>
			Login <a href="/api/auth/login" class="text-blue-600 underline">Google</a>
		</p>
	{/if} -->
	{#each data?.data as doc (doc.id)}
		<div class="border-gray-200 mb-4">
			<dt class="font-medium">
				<a
					class="hover:text-neutral-800 dark:hover:text-neutral-200"
					href={`documentation/${doc.id}`}
				>
					{doc.name?.split('|')?.[1]?.replace('[GO]', '')?.replace('.docx', '') || doc.name?.replace('.docx', '')}
				</a>
			</dt>
			{#if Boolean(doc.name?.split('|')?.[1]) }
				<dd class="text-sm">{doc.name?.split('|')?.[0]}</dd>
			{/if}
		</div>
	{/each}
</section>
