import { fail, redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: groups } = await locals.supabase
		.from('group_members')
		.select('group_id, groups(id, name, invite_code, created_at)')
		.eq('user_id', user.id);

	return { groups: groups?.map((gm) => gm.groups) ?? [] };
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
			if (error.code === '23505') return fail(409, { error: 'You are already in this group.' });
			return fail(500, { error: 'Failed to join group.' });
		}

		redirect(303, `/groups/${group.id}`);
	}
};
