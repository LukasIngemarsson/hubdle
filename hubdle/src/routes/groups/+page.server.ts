import { fail, redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: memberships } = await locals.supabase
		.from('group_members')
		.select('group_id, groups(id, name, invite_code, created_at)')
		.eq('user_id', user.id)
		.is('left_at', null);

	const groups = await Promise.all(
		(memberships ?? []).map(async (gm) => {
			const { count } = await locals.supabase
				.from('group_members')
				.select('user_id', { count: 'exact', head: true })
				.eq('group_id', gm.group_id)
				.is('left_at', null);
			return { ...gm.groups, member_count: count ?? 0 };
		})
	);

	const { data: pendingInvites } = await locals.supabase
		.from('group_invites')
		.select('id, group_id, invited_by, created_at, groups(id, name), inviter:profiles!group_invites_invited_by_fkey(username)')
		.eq('invited_user_id', user.id);

	return { groups, pendingInvites: pendingInvites ?? [] };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name?.trim()) return fail(400, { error: 'Group name is required.' });

		await ensureProfile(locals.supabase, user);

		const inviteCode = crypto.randomUUID().slice(0, 8);

		const { data: group, error: groupError } = await locals.supabase
			.from('groups')
			.insert({ name: name.trim(), invite_code: inviteCode, created_by: user.id })
			.select('id')
			.single();

		if (groupError || !group) return fail(500, { error: `Failed to create group: ${groupError?.message}` });

		const { error: memberError } = await locals.supabase
			.from('group_members')
			.insert({ group_id: group.id, user_id: user.id });

		if (memberError) return fail(500, { error: 'Failed to join group.' });

		redirect(303, `/groups/${group.id}`);
	},

	acceptInvite: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const inviteId = (formData.get('invite_id') as string)?.trim();
		if (!inviteId) return fail(400, { error: 'Invite ID is required.' });

		const { data: invite } = await locals.supabase
			.from('group_invites')
			.select('group_id')
			.eq('id', inviteId)
			.eq('invited_user_id', user.id)
			.single();

		if (!invite) return fail(404, { error: 'Invite not found.' });

		await ensureProfile(locals.supabase, user);

		// Join the group (or rejoin if soft-deleted)
		const { error: insertError } = await locals.supabase
			.from('group_members')
			.insert({ group_id: invite.group_id, user_id: user.id });

		if (insertError) {
			if (insertError.code === '23505') {
				const { error: updateError } = await locals.supabase
					.from('group_members')
					.update({ left_at: null, joined_at: new Date().toISOString() })
					.eq('group_id', invite.group_id)
					.eq('user_id', user.id)
					.not('left_at', 'is', null)
					.select();

				if (updateError) return fail(500, { error: 'Failed to join group.' });
			} else {
				return fail(500, { error: 'Failed to join group.' });
			}
		}

		// Delete the invite
		await locals.supabase
			.from('group_invites')
			.delete()
			.eq('id', inviteId);

		return { success: true };
	},

	declineInvite: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const inviteId = (formData.get('invite_id') as string)?.trim();
		if (!inviteId) return fail(400, { error: 'Invite ID is required.' });

		const { error: deleteError } = await locals.supabase
			.from('group_invites')
			.delete()
			.eq('id', inviteId)
			.eq('invited_user_id', user.id);

		if (deleteError) return fail(500, { error: 'Failed to decline invite.' });

		return { success: true };
	},

	join: async ({ request, locals }) => {
		const { data: { user } } = await locals.supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const code = (formData.get('code') as string)?.trim();

		if (!code) return fail(400, { error: 'Invite code is required.' });

		await ensureProfile(locals.supabase, user);

		const { data: group } = await locals.supabase
			.from('groups')
			.select('id')
			.eq('invite_code', code)
			.single();

		if (!group) return fail(404, { error: 'Invalid invite code.' });

		const { error } = await locals.supabase
			.from('group_members')
			.insert({ group_id: group.id, user_id: user.id });

		if (error) {
			if (error.code === '23505') {
				// Row exists — either active member or soft-deleted (rejoin)
				const { data: updated, error: updateError } = await locals.supabase
					.from('group_members')
					.update({ left_at: null, joined_at: new Date().toISOString() })
					.eq('group_id', group.id)
					.eq('user_id', user.id)
					.not('left_at', 'is', null)
					.select();

				if (updateError) return fail(500, { error: 'Failed to join group.' });
				if (!updated || updated.length === 0) {
					return fail(409, { error: 'You are already in this group.' });
				}
			} else {
				return fail(500, { error: 'Failed to join group.' });
			}
		}

		redirect(303, `/groups/${group.id}`);
	}
};
