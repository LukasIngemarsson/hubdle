<script lang="ts">
	let {
		id,
		title,
		message,
		triggerLabel,
		triggerClass = 'btn-ghost',
		confirmLabel = 'Confirm',
		confirmClass = 'btn-error',
		onConfirm
	}: {
		id: string;
		title: string;
		message: string;
		triggerLabel: string;
		triggerClass?: string;
		confirmLabel?: string;
		confirmClass?: string;
		onConfirm: () => void;
	} = $props();

	let loading = $state(false);

	function open() {
		(document.getElementById(id) as HTMLDialogElement)?.showModal();
	}

	function close() {
		(document.getElementById(id) as HTMLDialogElement)?.close();
	}

	function handleConfirm() {
		loading = true;
		close();
		onConfirm();
	}
</script>

<button type="button" class="btn {triggerClass}" onclick={open} disabled={loading}>
	{#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
	{triggerLabel}
</button>

<dialog {id} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">{title}</h3>
		<p class="py-4">{message}</p>
		<div class="modal-action">
			<button class="btn btn-ghost" onclick={close}>Cancel</button>
			<button class="btn {confirmClass}" onclick={handleConfirm}>{confirmLabel}</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
