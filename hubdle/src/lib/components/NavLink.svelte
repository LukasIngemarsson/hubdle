<script lang="ts">
	import { page } from '$app/stores';

	let { href, label }: { href: string; label: string } = $props();
</script>

<a {href} class="btn btn-ghost btn-sm {$page.url.pathname.startsWith(href) ? 'font-semibold underline underline-offset-4 decoration-2' : ''}">
	{label}
</a>
