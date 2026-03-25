import { fail, redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	// Friends where current user is requester
	const { data: asRequester } = await locals.supabase
		.from('friendships')
		.select(
			'id, status, created_at, addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)'
		)
		.eq('requester_id', user.id);

	// Friends where current user is addressee
	const { data: asAddressee } = await locals.supabase
		.from('friendships')
		.select(
			'id, status, created_at, requester:profiles!friendships_requester_id_fkey(id, username, avatar_url)'
		)
		.eq('addressee_id', user.id);

	const friends: {
		friendshipId: string;
		userId: string;
		username: string;
		avatarUrl: string | null;
	}[] = [];
	const outgoingRequests: typeof friends = [];
	const incomingRequests: {
		friendshipId: string;
		userId: string;
		username: string;
		avatarUrl: string | null;
	}[] = [];

	for (const row of asRequester ?? []) {
		const profile = row.addressee as unknown as {
			id: string;
			username: string;
			avatar_url: string | null;
		} | null;
		if (!profile) continue;
		const entry = {
			friendshipId: row.id,
			userId: profile.id,
			username: profile.username,
			avatarUrl: profile.avatar_url
		};
		if (row.status === 'accepted') friends.push(entry);
		else outgoingRequests.push(entry);
	}

	for (const row of asAddressee ?? []) {
		const profile = row.requester as unknown as {
			id: string;
			username: string;
			avatar_url: string | null;
		} | null;
		if (!profile) continue;
		const entry = {
			friendshipId: row.id,
			userId: profile.id,
			username: profile.username,
			avatarUrl: profile.avatar_url
		};
		if (row.status === 'accepted') friends.push(entry);
		else incomingRequests.push(entry);
	}

	return { friends, incomingRequests, outgoingRequests, userId: user.id };
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
	},

	acceptRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const friendshipId = (formData.get('friendship_id') as string)?.trim();

		if (!friendshipId) return fail(400, { error: 'Friendship ID is required.' });

		const { error: updateError } = await locals.supabase
			.from('friendships')
			.update({ status: 'accepted', updated_at: new Date().toISOString() })
			.eq('id', friendshipId)
			.eq('addressee_id', user.id)
			.eq('status', 'pending');

		if (updateError)
			return fail(500, { error: `Failed to accept request: ${updateError.message}` });

		return { success: true };
	},

	declineRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const friendshipId = (formData.get('friendship_id') as string)?.trim();

		if (!friendshipId) return fail(400, { error: 'Friendship ID is required.' });

		const { error: deleteError } = await locals.supabase
			.from('friendships')
			.delete()
			.eq('id', friendshipId);

		if (deleteError)
			return fail(500, { error: `Failed to decline request: ${deleteError.message}` });

		return { success: true };
	},

	removeFriend: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const friendshipId = (formData.get('friendship_id') as string)?.trim();

		if (!friendshipId) return fail(400, { error: 'Friendship ID is required.' });

		const { error: deleteError } = await locals.supabase
			.from('friendships')
			.delete()
			.eq('id', friendshipId);

		if (deleteError) return fail(500, { error: `Failed to remove friend: ${deleteError.message}` });

		return { success: true };
	}
};
