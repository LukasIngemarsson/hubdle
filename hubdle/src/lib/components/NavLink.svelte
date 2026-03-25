<script lang="ts">
	import { page } from '$app/stores';

	let { href, label, badge = 0 }: { href: string; label: string; badge?: number } = $props();

	let isActive = $derived($page.url.pathname.startsWith(href));
</script>

<a
	{href}
	class="nav-link relative px-1 py-0.5 text-sm transition-colors hover:opacity-100 {isActive ? 'font-semibold opacity-100' : 'opacity-70'}"
>
	{label}{#if badge > 0}<span class="badge badge-primary badge-xs ml-1">{badge}</span>{/if}
	<span
		class="absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-current opacity-50 transition-all duration-300 ease-out {isActive ? 'w-[88%]' : 'w-0'}"
	></span>
</a>

<style>
	.nav-link:hover span {
		width: 88%;
	}
</style>
