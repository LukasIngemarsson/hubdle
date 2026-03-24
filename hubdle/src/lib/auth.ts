import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export function generateUsername(email: string | undefined, userId: string): string {
	return email?.split('@')[0] ?? `user-${userId.slice(0, 8)}`;
}

export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
	const username = generateUsername(user.email, user.id);
	await supabase
		.from('profiles')
		.upsert({ id: user.id, username }, { onConflict: 'id', ignoreDuplicates: true });
}
