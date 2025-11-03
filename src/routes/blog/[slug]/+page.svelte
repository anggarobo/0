<script lang="ts">
    import { marked } from 'marked';
    let { params, data } = $props();

    let body_html = marked(data.article?.body_markdown)
</script>

{#if Boolean(data?.article)}
    <h3 class='page-title'>{data?.article?.title}</h3>
    <section class="mt-8">
        <article class="markdown-content" >
            {@html body_html}
        </article>
    </section>
{:else}
    <p class="text-heading">Ups, Something went wrong</p>
{/if }
