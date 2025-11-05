<script lang="ts">
	import { page } from '$app/state';
</script>

<h3 class="page-title">Error</h3>
<section class="mt-8">
	<h6>
		{page.status} – {page?.error?.message ?? 'Something went wrong'}
	</h6>

	<!-- {#if page?.error?.message?.includes('authentication')}
		<p class="mt-4">Coba login ulang untuk memperbarui izin Google Drive / Docs.</p>
		<a href="/auth/login" class="text-blue-600 underline">Login ulang</a>
	{/if} -->
</section>
