import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ user: User | null }>;
		}
		interface PageData {
			user: User | null;
		}
	}
}

export {};
