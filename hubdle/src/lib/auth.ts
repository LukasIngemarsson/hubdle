import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export function generateUsername(user: User): string {
	const email = user.email || user.user_metadata?.email;
	return email?.split('@')[0] ?? `user-${user.id.slice(0, 8)}`;
}

export function getOAuthAvatarUrl(user: User): string | null {
	return user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;
}

export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
	const username = generateUsername(user);
	const avatarUrl = getOAuthAvatarUrl(user);

	await supabase
		.from('profiles')
		.upsert(
			{ id: user.id, username, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) },
			{ onConflict: 'id', ignoreDuplicates: true }
		);
}
