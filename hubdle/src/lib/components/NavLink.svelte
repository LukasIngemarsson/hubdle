<script lang="ts">
	import { page } from '$app/stores';

	let { href, label }: { href: string; label: string } = $props();
</script>

<a {href} class="btn btn-ghost btn-sm {$page.url.pathname.startsWith(href) ? 'btn-active' : ''}">
	{label}
</a>
