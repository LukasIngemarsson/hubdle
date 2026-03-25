import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('username, avatar_url')
		.eq('id', user.id)
		.single();

	return {
		email: user.email || user.user_metadata?.email || '',
		username: profile?.username ?? '',
		avatarUrl: profile?.avatar_url ?? null
	};
};

export const actions: Actions = {
	updateUsername: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const username = (formData.get('username') as string)?.trim();

		if (!username) return fail(400, { error: 'Username cannot be empty.' });
		if (username.length > 30) return fail(400, { error: 'Username must be 30 characters or less.' });

		const { error } = await locals.supabase
			.from('profiles')
			.update({ username })
			.eq('id', user.id);

		if (error) {
			if (error.code === '23505') return fail(409, { error: 'That username is already taken.' });
			return fail(500, { error: `Failed to update username: ${error.message}` });
		}

		return { success: true };
	},

	uploadAvatar: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const file = formData.get('avatar') as File;

		if (!file || file.size === 0) return fail(400, { error: 'No file selected.' });
		if (file.size > 2 * 1024 * 1024) return fail(400, { error: 'File must be under 2 MB.' });
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			return fail(400, { error: 'Only JPEG, PNG, and WebP images are allowed.' });
		}

		const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
		const filePath = `${user.id}/avatar.${ext}`;

		// Remove any existing avatar files for this user
		const { data: existingFiles } = await locals.supabase.storage
			.from('avatars')
			.list(user.id);

		if (existingFiles && existingFiles.length > 0) {
			await locals.supabase.storage
				.from('avatars')
				.remove(existingFiles.map((f) => `${user.id}/${f.name}`));
		}

		const { error: uploadError } = await locals.supabase.storage
			.from('avatars')
			.upload(filePath, file, { upsert: true });

		if (uploadError) return fail(500, { error: `Upload failed: ${uploadError.message}` });

		const { data: urlData } = locals.supabase.storage.from('avatars').getPublicUrl(filePath);

		// Append cache-buster so the browser picks up the new image
		const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

		const { error: updateError } = await locals.supabase
			.from('profiles')
			.update({ avatar_url: avatarUrl })
			.eq('id', user.id);

		if (updateError) return fail(500, { error: `Failed to save avatar: ${updateError.message}` });

		return { success: true, avatarUpdated: true };
	},

	removeAvatar: async ({ locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		// Remove files from storage
		const { data: existingFiles } = await locals.supabase.storage
			.from('avatars')
			.list(user.id);

		if (existingFiles && existingFiles.length > 0) {
			await locals.supabase.storage
				.from('avatars')
				.remove(existingFiles.map((f) => `${user.id}/${f.name}`));
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({ avatar_url: null })
			.eq('id', user.id);

		if (error) return fail(500, { error: `Failed to remove avatar: ${error.message}` });

		return { success: true, avatarUpdated: true };
	}
};
