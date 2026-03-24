<script lang="ts">
	let { type, message }: { type: 'error' | 'success'; message: string } = $props();
</script>

<div class="alert {type === 'error' ? 'alert-error' : 'alert-success'} mt-3">
	<span>{message}</span>
</div>
