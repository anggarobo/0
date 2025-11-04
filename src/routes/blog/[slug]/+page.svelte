<script lang="ts">
    import { marked } from 'marked';
    let { data } = $props();

    let body_html = marked(data.article?.body_markdown)
    console.log(data.article)
</script>

{#if Boolean(data?.article)}
    <h3 class='page-title'>{data?.article?.title}</h3>
    <p class="markdown-content mt-2">
        {#each data?.article?.tags as tag }
            <code>#{tag}</code>&nbsp;
        {/each}
    </p>
    <section class="mt-6">
        <article class="markdown-content" >
            {@html body_html}
        </article>
    </section>
{:else}
    <p class="c-text">Ups, Something went wrong</p>
{/if }
