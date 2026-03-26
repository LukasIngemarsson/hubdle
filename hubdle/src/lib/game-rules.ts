export type GameRules = {
	minScore: number;
	maxScore: number;
	scoreLabel: string;
	hint: string;
};

export const GAME_RULES: Record<string, GameRules> = {
	wordle: {
		minScore: 1,
		maxScore: 7,
		scoreLabel: 'Guesses (1–6, or 7 for X)',
		hint: 'Number of guesses to solve. Enter 7 if you failed (X/6).'
	},
	bandle: {
		minScore: 1,
		maxScore: 7,
		scoreLabel: 'Guesses (1–6, or 7 for X)',
		hint: 'Number of guesses to solve. Enter 7 if you failed (X/6).'
	},
	connections: {
		minScore: 0,
		maxScore: 4,
		scoreLabel: 'Mistakes (0–4)',
		hint: 'Number of incorrect guesses before solving.'
	},
	contexto: {
		minScore: 1,
		maxScore: 500,
		scoreLabel: 'Guesses (1–500)',
		hint: 'Total number of guesses to find the secret word.'
	},
	scrandle: {
		minScore: 0,
		maxScore: 10,
		scoreLabel: 'Correct guesses (0–10)',
		hint: 'Number of rounds where you picked the more popular food.'
	},
	timeguessr: {
		minScore: 0,
		maxScore: 50000,
		scoreLabel: 'Points (0–50,000)',
		hint: 'Total points across 5 rounds (up to 10,000 per round).'
	}
};

export function validateScore(gameId: string, score: number): string | null {
	const rules = GAME_RULES[gameId];
	if (!rules) return null;
	if (!Number.isInteger(score)) return 'Score must be a whole number.';
	if (score < rules.minScore || score > rules.maxScore) {
		return `Score for this game must be between ${rules.minScore} and ${rules.maxScore}.`;
	}
	return null;
}
