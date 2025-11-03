<script lang="ts">
    export let data: { listing: any[] }
    console.log(data)
</script>

<h3 class='page-title'>Blog</h3>
<section class="mt-8">
    {#if data.listing.length > 0 }
        <dl class="grid grid-cols-1 gap-y-4 ">
            {#each data.listing as article (article.id)}
                <div class="border-gray-200 pt-2">
                    <dt class="font-medium text-gray-700">
                        <a data-sveltekit-preload-data="tap" href={article.url}>
                            {article.title}
                        </a>
                    </dt>
                    <dd class="mt-2 text-sm text-gray-500">{article.description}</dd>
                </div>
            {/each}
        </dl>
    {:else}
        <p>Something went wrong.</p>
    {/if}
</section>