<script lang="ts">
	import { page } from '$app/stores';

	let { href, label }: { href: string; label: string } = $props();
</script>

<a {href} class="btn btn-sm {$page.url.pathname.startsWith(href) ? 'btn-neutral' : 'btn-ghost'}">
	{label}
</a>
