<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/a374151x32.svg';
	import "../app.css"

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- {@render children?.()} -->
<div id="__app">
	<div class='antialiased max-w-4xl mb-40 flex flex-col md:flex-row mx-4 mt-8 md:mt-20 lg:mt-32 lg:mx-auto'>
		<!-- <Aside /> -->
		 <aside class='md:w-[150px] md:flex-shrink-0 md:mx-0 md:px-0 font-dmserif italic'>
			<div class="lg:sticky lg:top-[9.5rem]">
				<div class="ml-0 md:ml-[40px] mb-2 md:mb-8 space-y-10 flex flex-col md:flex-row items-start mt-0 md:mt-6">
					<a data-sveltekit-preload-data="tap" class="group" href="/">
						<!-- Logo -->
						 <img alt="angga" 
						 class="opacity-85 group-hover:opacity-100 dark:brightness-500" src={logo} />
					</a>
				</div>

				<nav class="flex flex-row md:flex-col items-start relative overflow-scroll md:px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative">
                    <div class="flex flex-row md:flex-col gap-4 md:gap-0 space-x-0 pr-10 mb-2 mt-2 md:mt-0 items-end">
						<a class="transition-all text-detailing hover:text-neutral-800 dark:hover:text-neutral-200 py-[5px] font-medium" data-sveltekit-preload-data="tap" href="/blog">
							Blog
						</a>
						<a class="transition-all text-detailing hover:text-neutral-800 dark:hover:text-neutral-200 py-[5px] font-medium" data-sveltekit-preload-data="tap" href="/experience">
							Experience
						</a>
						<a class="transition-all text-detailing hover:text-neutral-800 dark:hover:text-neutral-200 py-[5px] font-medium" data-sveltekit-preload-data="tap" href="/projects">
							Projects
						</a>
					</div>
				</nav>

			</div>
		 </aside>
		<main class="py-12 md:py-4 lg:min-w-[560px]">
			{@render children?.()}
		</main>
	</div>
</div>
