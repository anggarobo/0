<script lang="ts">
	export let data: { data: ArticleDevto[]; message: string; status: number; error: Error };
</script>

<h3 class="page-title">Blog</h3>
<section class="mt-8">
	{#if data.status === 200}
		<dl class="grid grid-cols-1 gap-y-4">
			{#each data.data as article (article.id)}
				<div class="border-gray-200 pt-2">
					<dt class="font-medium">
						<a
							class="hover:text-neutral-800 dark:hover:text-neutral-200"
							href={`/blog/${article.slug}`}
						>
							{article.title}
						</a>
					</dt>
					<dd class="mt-2 text-sm">{article.description}</dd>
				</div>
			{/each}
		</dl>
	{:else}
		<p>Something went wrong.</p>
	{/if}
</section>
