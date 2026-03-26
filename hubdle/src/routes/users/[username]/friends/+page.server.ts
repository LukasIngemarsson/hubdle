import { error, fail, redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('id, username, avatar_url')
		.eq('username', params.username)
		.single();

	if (!profile) error(404, 'User not found');

	const isOwnProfile = user?.id === profile.id;

	// Profile user's accepted friends
	const { data: asRequester } = await locals.supabase
		.from('friendships')
		.select('id, addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)')
		.eq('requester_id', profile.id)
		.eq('status', 'accepted');

	const { data: asAddressee } = await locals.supabase
		.from('friendships')
		.select('id, requester:profiles!friendships_requester_id_fkey(id, username, avatar_url)')
		.eq('addressee_id', profile.id)
		.eq('status', 'accepted');

	const friends: { userId: string; username: string; avatarUrl: string | null }[] = [];
	for (const row of asRequester ?? []) {
		const p = row.addressee as unknown as {
			id: string;
			username: string;
			avatar_url: string | null;
		} | null;
		if (p) friends.push({ userId: p.id, username: p.username, avatarUrl: p.avatar_url });
	}
	for (const row of asAddressee ?? []) {
		const p = row.requester as unknown as {
			id: string;
			username: string;
			avatar_url: string | null;
		} | null;
		if (p) friends.push({ userId: p.id, username: p.username, avatarUrl: p.avatar_url });
	}

	// Determine which of the profile's friends the viewing user is also friends with
	let viewerFriendIds = new Set<string>();
	if (user) {
		viewerFriendIds.add(user.id); // viewer is "friends" with themselves (don't show Add)
		const { data: viewerAsReq } = await locals.supabase
			.from('friendships')
			.select('addressee_id')
			.eq('requester_id', user.id)
			.eq('status', 'accepted');
		const { data: viewerAsAddr } = await locals.supabase
			.from('friendships')
			.select('requester_id')
			.eq('addressee_id', user.id)
			.eq('status', 'accepted');

		for (const r of viewerAsReq ?? []) viewerFriendIds.add(r.addressee_id);
		for (const r of viewerAsAddr ?? []) viewerFriendIds.add(r.requester_id);
	}

	return {
		profile: {
			id: profile.id,
			username: profile.username,
			avatarUrl: profile.avatar_url
		},
		isOwnProfile,
		friends,
		viewerFriendIds: [...viewerFriendIds]
	};
};

export const actions: Actions = {
	sendRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const addresseeId = (formData.get('addressee_id') as string)?.trim();

		if (!addresseeId) return fail(400, { error: 'User ID is required.' });
		if (addresseeId === user.id) return fail(400, { error: 'You cannot add yourself.' });

		await ensureProfile(locals.supabase, user);

		const { error: insertError } = await locals.supabase
			.from('friendships')
			.insert({ requester_id: user.id, addressee_id: addresseeId });

		if (insertError) {
			if (insertError.code === '23505')
				return fail(409, { error: 'Friend request already exists.' });
			return fail(500, { error: `Failed to send request: ${insertError.message}` });
		}

		return { success: true };
	}
};
