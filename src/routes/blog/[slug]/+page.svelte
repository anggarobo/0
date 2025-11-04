<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	let { data } = $props();

	let body_html = $derived.by(() => {
		let body_html = '';
		if (data.data?.body_markdown) {
			const md = marked(data.data.body_markdown);
			body_html = DOMPurify.sanitize(md as string);
		}
		return body_html;
	});
</script>

{#if data.status === 200}
	<h3 class="page-title">{data?.data?.title}</h3>
	<p class="markdown-content mt-2">
		{#each data?.data?.tags as tag (tag)}
			<code>#{tag}</code>&nbsp;
		{/each}
	</p>
	<section class="mt-6">
		<article class="markdown-content">
			{#if body_html}
				{@html body_html}
			{/if}
		</article>
	</section>
{:else}
	<p class="c-text">Ups, Something went wrong</p>
{/if}
