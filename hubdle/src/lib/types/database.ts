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
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						isOneToOne: true;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
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
				Relationships: [
					{
						foreignKeyName: 'groups_created_by_fkey';
						columns: ['created_by'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
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
				Relationships: [
					{
						foreignKeyName: 'group_members_group_id_fkey';
						columns: ['group_id'];
						isOneToOne: false;
						referencedRelation: 'groups';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'group_members_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
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
				Relationships: [];
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
				Relationships: [
					{
						foreignKeyName: 'submissions_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'submissions_group_id_fkey';
						columns: ['group_id'];
						isOneToOne: false;
						referencedRelation: 'groups';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'submissions_game_id_fkey';
						columns: ['game_id'];
						isOneToOne: false;
						referencedRelation: 'games';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
