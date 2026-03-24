import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { user } = await locals.safeGetSession();
	return { user, cookies: cookies.getAll() };
};
