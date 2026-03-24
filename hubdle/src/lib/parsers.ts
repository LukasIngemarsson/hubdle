type ParseResult = {
	gameId: string;
	score: number;
	gameDate: string;
} | null;

export function parseShareText(text: string): ParseResult {
	return parseWordle(text) ?? parseBandle(text);
}

function parseWordle(text: string): ParseResult {
	// "Wordle 1,234 3/6" or "Wordle 1,234 X/6"
	const match = text.match(/Wordle\s+([\d,]+)\s+([X\d])\/6/);
	if (!match) return null;

	const puzzleNumber = parseInt(match[1].replace(/,/g, ''), 10);
	const raw = match[2];
	const score = raw === 'X' ? 7 : parseInt(raw, 10);

	// Wordle #0 was 2021-06-19. Each puzzle number is one day after.
	const epoch = new Date('2021-06-19');
	epoch.setDate(epoch.getDate() + puzzleNumber);
	const gameDate = epoch.toISOString().slice(0, 10);

	return { gameId: 'wordle', score, gameDate };
}

function parseBandle(text: string): ParseResult {
	// "Bandle #123 1/6" or "Bandle #123 x/6"
	const match = text.match(/Bandle\s+#(\d+)\s+([x\d])\/6/i);
	if (!match) return null;

	const puzzleNumber = parseInt(match[1], 10);
	const raw = match[2].toLowerCase();
	const score = raw === 'x' ? 7 : parseInt(raw, 10);

	// Bandle #1 was 2023-09-12
	const epoch = new Date('2023-09-11');
	epoch.setDate(epoch.getDate() + puzzleNumber);
	const gameDate = epoch.toISOString().slice(0, 10);

	return { gameId: 'bandle', score, gameDate };
}
