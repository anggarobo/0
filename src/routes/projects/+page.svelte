<!-- <script lang="ts">
    export let data: { projects: { name: string; description: string; technologies: string[] }[] };
</script> -->


<h3 class='font-medium font-dmserif italic'>Projects</h3>
<section class="mt-8">
    
    <!-- {#if data.projects.length > 0 }
        <dl class="grid grid-cols-1 gap-y-4 ">
            {#each data.projects as project (project.name)}
                <div class="border-gray-200 pt-2">
                    <dt class="font-medium text-gray-700">
                        <a data-sveltekit-preload-data="tap" href={`/projects/${project.name.toLowerCase()}`}>
                            {project.name}
                        </a>
                    </dt>
                    <dd class="mt-2 text-sm text-gray-500">{project.technologies.join(', ')}</dd>
                </div>
            {/each}
        </dl>
    {:else}
        <p>Something went wrong.</p>
    {/if} -->
</section>