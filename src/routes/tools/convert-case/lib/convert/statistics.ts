export type TextStats = {
	characters: number;
	charactersWithoutSpaces: number;
	words: number;
	lines: number;
	paragraphs: number;
	sentences: number;
	readingTimeMinutes: number;
	byteSize: number;
};

function countWords(input: string): number {
	const trimmed = input.trim();
	if (!trimmed) return 0;
	// Unicode word-ish sequences.
	const matches = trimmed.match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu);
	return matches ? matches.length : 0;
}

function countSentences(input: string): number {
	// Count . ! ? that look like sentence enders.
	const matches = input.match(/[.!?]+(?=\s|$)/g);
	return matches ? matches.length : 0;
}

export function getTextStats(input: string): TextStats {
	const characters = input.length;
	const charactersWithoutSpaces = input.replace(/\s/g, '').length;
	const words = countWords(input);
	const lines = input.length === 0 ? 0 : input.split(/\r?\n/).length;
	const paragraphs = input.trim().length === 0 ? 0 : input.split(/\n\s*\n/g).length;
	const sentences = countSentences(input);
	const readingTimeMinutes = words === 0 ? 0 : words / 200; // 200 wpm
	const byteSize = new Blob([input]).size;

	return {
		characters,
		charactersWithoutSpaces,
		words,
		lines,
		paragraphs,
		sentences,
		readingTimeMinutes,
		byteSize
	};
}
