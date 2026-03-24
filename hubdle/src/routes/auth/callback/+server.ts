import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (user) {
		const username = user.email?.split('@')[0] ?? `user-${user.id.slice(0, 8)}`;
		await locals.supabase.from('profiles').upsert(
			{ id: user.id, username },
			{ onConflict: 'id' }
		);
	}

	redirect(303, '/');
};
