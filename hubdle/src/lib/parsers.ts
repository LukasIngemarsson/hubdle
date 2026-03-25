type ParseResult = {
	gameId: string;
	score: number;
	gameDate: string;
} | null;

export function parseShareText(text: string): ParseResult {
	return (
		parseWordle(text) ??
		parseBandle(text) ??
		parseConnections(text) ??
		parseContexto(text) ??
		parseScrandle(text)
	);
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

function parseConnections(text: string): ParseResult {
	// "Connections\nPuzzle #412\n🟨🟨🟨🟨\n..."
	const headerMatch = text.match(/Connections\s+Puzzle\s+#(\d+)/i);
	if (!headerMatch) return null;

	const puzzleNumber = parseInt(headerMatch[1], 10);

	// Count emoji rows — each row is 4 coloured squares
	const emojiRows = text.match(/[🟨🟩🟪🟦]{4}/g) ?? [];
	const totalRows = emojiRows.length;
	if (totalRows < 4) return null;
	const score = totalRows - 4; // mistakes

	// Connections puzzle #1 launched 2023-08-12
	const epoch = new Date('2023-08-11');
	epoch.setDate(epoch.getDate() + puzzleNumber);
	const gameDate = epoch.toISOString().slice(0, 10);

	return { gameId: 'connections', score, gameDate };
}

function parseContexto(text: string): ParseResult {
	// "I solved Contexto #342 in 23 guesses."
	const match = text.match(/Contexto\s+#(\d+)\D+?(\d+)\s+guess/i);
	if (!match) return null;

	const puzzleNumber = parseInt(match[1], 10);
	const score = parseInt(match[2], 10);

	// Contexto #1 launched 2022-09-19
	const epoch = new Date('2022-09-18');
	epoch.setDate(epoch.getDate() + puzzleNumber);
	const gameDate = epoch.toISOString().slice(0, 10);

	return { gameId: 'contexto', score, gameDate };
}

function parseScrandle(text: string): ParseResult {
	// "🟩🟥🟩🟩🟩🟥🟥🟩🟩🟩 7/10 | 2026-03-24 | https://scrandle.com"
	const match = text.match(
		/(\d{1,2})\/10\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*https?:\/\/scrandle\.com/
	);
	if (!match) return null;

	const score = parseInt(match[1], 10);
	const gameDate = match[2];

	return { gameId: 'scrandle', score, gameDate };
}
