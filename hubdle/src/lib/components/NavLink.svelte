<script lang="ts">
	import { page } from '$app/stores';

	let { href, label }: { href: string; label: string } = $props();

	let isActive = $derived($page.url.pathname.startsWith(href));
</script>

<a
	{href}
	class="nav-link relative px-1 py-0.5 text-sm transition-colors hover:opacity-100 {isActive ? 'font-semibold opacity-100' : 'opacity-70'}"
>
	{label}
	<span
		class="absolute bottom-0 left-0 h-px bg-current opacity-60 transition-all duration-300 ease-out {isActive ? 'w-full' : 'w-0 group-hover:w-full'}"
	></span>
</a>

<style>
	.nav-link:hover span {
		width: 100%;
	}
</style>
