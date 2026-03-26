<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ScoreHeatmap from './ScoreHeatmap.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import MembersSection from './MembersSection.svelte';
	import GroupActions from './GroupActions.svelte';
	import CopyBadge from '$lib/components/CopyBadge.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const Tab = { Scores: 'scores', Members: 'members' } as const;
	type Tab = (typeof Tab)[keyof typeof Tab];

	let activeTab = $state<Tab>(Tab.Scores);

	let channel: ReturnType<typeof data.supabase.channel>;

	onMount(() => {
		channel = data.supabase
			.channel(`group-members-${data.group.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'group_members',
					filter: `group_id=eq.${data.group.id}`
				},
				() => invalidateAll()
			)
			.subscribe();
	});

	onDestroy(() => {
		if (channel) data.supabase.removeChannel(channel);
	});

	let isOwner = $derived(data.userId === data.group.created_by);
	let otherMembers = $derived(data.members.filter((m) => m.user_id !== data.userId));
	let isOnlyMember = $derived(otherMembers.length === 0);

	function unsubscribeRealtime() {
		if (channel) {
			data.supabase.removeChannel(channel);
		}
	}
</script>

<svelte:head>
	<title>{data.group.name} - Hubdle</title>
</svelte:head>

<PageContainer>
	<div>
		<a href="/groups" class="link text-sm opacity-70">&larr; All Groups</a>
		<div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold">{data.group.name}</h1>
			<div class="flex items-center gap-2">
				<span class="text-xs opacity-50">Invite code</span>
				<CopyBadge text={data.group.invite_code} size="lg" />
			</div>
		</div>
	</div>

	<div class="mt-6 flex gap-1 border-b border-base-300">
		<button
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === Tab.Scores
				? 'border-b-2 border-primary text-primary'
				: 'opacity-60 hover:opacity-100'}"
			onclick={() => (activeTab = Tab.Scores)}
		>
			Scores
		</button>
		<button
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === Tab.Members
				? 'border-b-2 border-primary text-primary'
				: 'opacity-60 hover:opacity-100'}"
			onclick={() => (activeTab = Tab.Members)}
		>
			Members
			<span class="badge badge-sm ml-1">{data.members.length}</span>
		</button>
	</div>

	{#if activeTab === Tab.Scores}
		<ScoreHeatmap games={data.games} submissions={data.submissions} members={data.allMembers} />
		<Leaderboard games={data.games} submissions={data.submissions} members={data.allMembers} />
	{:else if activeTab === Tab.Members}
		<MembersSection
			members={data.members}
			invitableFriends={data.invitableFriends}
			friendshipStatusMap={data.friendshipStatusMap}
			userId={data.userId}
			ownerId={data.group.created_by}
		/>
		<GroupActions
			{isOwner}
			{isOnlyMember}
			{otherMembers}
			onUnsubscribeRealtime={unsubscribeRealtime}
		/>
	{/if}
</PageContainer>
