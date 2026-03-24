export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					username: string;
					avatar_url: string | null;
					created_at: string;
				};
				Insert: {
					id: string;
					username: string;
					avatar_url?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					username?: string;
					avatar_url?: string | null;
					created_at?: string;
				};
			};
			groups: {
				Row: {
					id: string;
					name: string;
					invite_code: string;
					created_by: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					invite_code: string;
					created_by: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					invite_code?: string;
					created_by?: string;
					created_at?: string;
				};
			};
			group_members: {
				Row: {
					group_id: string;
					user_id: string;
					joined_at: string;
				};
				Insert: {
					group_id: string;
					user_id: string;
					joined_at?: string;
				};
				Update: {
					group_id?: string;
					user_id?: string;
					joined_at?: string;
				};
			};
			games: {
				Row: {
					id: string;
					name: string;
					url: string;
					score_direction: string;
				};
				Insert: {
					id: string;
					name: string;
					url: string;
					score_direction: string;
				};
				Update: {
					id?: string;
					name?: string;
					url?: string;
					score_direction?: string;
				};
			};
			submissions: {
				Row: {
					id: string;
					user_id: string;
					group_id: string;
					game_id: string;
					score: number;
					raw_text: string;
					game_date: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					group_id: string;
					game_id: string;
					score: number;
					raw_text: string;
					game_date: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					group_id?: string;
					game_id?: string;
					score?: number;
					raw_text?: string;
					game_date?: string;
					created_at?: string;
				};
			};
		};
	};
};
