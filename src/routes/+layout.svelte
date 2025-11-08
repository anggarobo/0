<script lang="ts">
	// import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/a374151x32.svg';
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const isDevCo = $state(page.url.pathname.includes('/dev/dataon'));
	const menu = $derived.by(() => {
		if (!isDevCo) {
			return [
				{ label: 'Blog', path: '/blog' },
				{ label: 'Experience', path: '/experience' },
				{ label: 'Projects', path: '/projects' }
			];
		}
		return [{ label: 'DDE', path: '/dev/dataon/dde' }];
	});
	const toRootDev = () => {
		window.location.href = 'dev/dataon';
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- {@render children?.()} -->
<div id="__app">
	<div
		class="mx-4 mt-8 mb-40 flex max-w-4xl flex-col antialiased md:mt-20 md:flex-row lg:mx-auto lg:mt-32"
	>
		<!-- <Aside /> -->
		<aside class="font-dmserif italic md:mx-0 md:w-[150px] md:shrink-0 md:px-0">
			<div class="lg:sticky lg:top-38">
				<div
					class="mt-0 mb-2 ml-0 flex flex-col items-start space-y-10 md:mt-6 md:mb-8 md:ml-10 md:flex-row"
				>
					{#if !isDevCo}
						<a aria-current={page.url.pathname === '/'} class="group" href="/">
							<!-- Logo -->
							<img
								alt="angga"
								class="opacity-85 group-hover:opacity-100 dark:brightness-500"
								src={logo}
							/>
						</a>
					{:else}
						<button class="cursor-pointer" onclick={toRootDev}>
							<img
								alt="angga"
								class="opacity-85 group-hover:opacity-100 dark:brightness-500"
								src={logo}
							/>
						</button>
					{/if}
				</div>

				<nav
					class="fade relative flex scroll-pr-6 flex-row items-start overflow-scroll pb-0 md:relative md:flex-col md:overflow-auto md:px-0"
				>
					<div
						class={`mt-2 mb-2 flex flex-row items-end gap-4 space-x-0 md:mt-0 md:flex-col md:gap-0 ${isDevCo ? 'pr-10 md:pl-10' : 'pr-10'}`}
					>
						{#each menu as item (item.path)}
							<a
								aria-current={page.url.pathname.slice(0, item.path.length) === item.path}
								class="c-text c-text-hover py-[5px] font-medium transition-all"
								href={item.path}
							>
								{item.label}
							</a>
						{/each}
						<!-- <a
							aria-current={page.url.pathname.slice(0, 5) === '/blog'}
							class="c-text c-text-hover py-[5px] font-medium transition-all"
							href="/blog"
						>
							Blog
						</a>
						<a
							aria-current={page.url.pathname.slice(0, 11) === '/experience'}
							class="c-text c-text-hover py-[5px] font-medium transition-all"
							href="/experience"
						>
							Experience
						</a>
						<a
							aria-current={page.url.pathname.slice(0, 9) === '/projects'}
							class="c-text c-text-hover py-[5px] font-medium transition-all"
							href="/projects"
						>
							Projects
						</a> -->
					</div>
				</nav>
			</div>
		</aside>
		<main class="box-border py-12 md:py-4 lg:min-w-[560px]">
			{@render children?.()}
		</main>
	</div>
</div>
