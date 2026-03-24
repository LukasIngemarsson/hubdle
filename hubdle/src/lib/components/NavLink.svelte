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
		class="absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-current opacity-50 transition-all duration-300 ease-out {isActive ? 'w-3/4' : 'w-0'}"
	></span>
</a>

<style>
	.nav-link:hover span {
		width: 75%;
	}
</style>
