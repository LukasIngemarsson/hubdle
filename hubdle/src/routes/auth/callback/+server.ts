import { redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
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
		await ensureProfile(locals.supabase, user);
	}

	const next = url.searchParams.get('next');
	redirect(303, next && next.startsWith('/') ? next : '/');
};
