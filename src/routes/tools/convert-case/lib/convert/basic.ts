function splitWords(input: string): string[] {
	// Keep it deterministic & fast. Normalize common separators to spaces.
	// This is shared by most conversions.
	const normalized = input
		.replace(/[\u2019’]/g, "'")
		.replace(/[_\-./\\\s]+/g, ' ')
		.trim();
	if (!normalized) return [];
	// Split on spaces but keep punctuation-attached words as part of token;
	// casing conversions mostly operate on letters.
	return normalized.split(/\s+/g);
}

function isLetter(ch: string): boolean {
	return ch.toLowerCase() !== ch.toUpperCase();
}

export function toUppercase(input: string): string {
	return input.toUpperCase();
}

export function toLowercase(input: string): string {
	return input.toLowerCase();
}

export function toInvertCase(input: string): string {
	let out = '';
	for (const ch of input) {
		if (!isLetter(ch)) {
			out += ch;
			continue;
		}
		const lower = ch.toLowerCase();
		const upper = ch.toUpperCase();
		out += ch === lower ? upper : lower;
	}
	return out;
}

export function toToggleCase(input: string): string {
	// Toggle based on first cased character: if first letter is lower => make all letters upper, else lower.
	let firstCase: 'upper' | 'lower' | null = null;
	for (const ch of input) {
		if (!isLetter(ch)) continue;
		firstCase = ch === ch.toLowerCase() ? 'upper' : 'lower';
		break;
	}
	if (!firstCase) return input;
	return firstCase === 'upper' ? input.toUpperCase() : input.toLowerCase();
}

function capitalizeWord(word: string): string {
	if (!word) return word;
	const lower = word.toLowerCase();
	// Uppercase first letter only.
	return lower.replace(/(^[\p{L}])/u, (m) => m.toUpperCase());
}

export function toCapitalizeEachWord(input: string): string {
	const words = splitWords(input);
	if (words.length === 0) return input;
	// Reconstruct using single spaces to keep predictable output.
	return words.map((w) => capitalizeWord(w)).join(' ');
}

export function toTitleCase(input: string): string {
	// Similar to Capitalize Each Word.
	return toCapitalizeEachWord(input);
}

export function toSentenceCase(input: string): string {
	// Sentence boundaries: . ! ? plus line starts.
	// We'll lowercase everything then uppercase first letter after boundary.
	const lowered = input.toLowerCase();
	let out = '';
	let shouldCap = true;
	for (let i = 0; i < lowered.length; i++) {
		const ch = lowered[i];
		if (shouldCap && isLetter(ch)) {
			out += ch.toUpperCase();
			shouldCap = false;
			continue;
		}
		out += ch;
		if (ch === '.' || ch === '!' || ch === '?') {
			// cap first letter after boundary, skipping spaces.
			shouldCap = true;
		}
	}
	// Also ensure line starts after newline.
	out = out.replace(/(^|\n)(\s*)([\p{L}])/u, (_m, p1, p2, p3) => {
		return `${p1}${p2}${String(p3).toUpperCase()}`;
	});
	return out;
}

export function toAlternatingCase(input: string): string {
	let upperNext: boolean | null = null;
	let out = '';
	for (const ch of input) {
		if (!isLetter(ch)) {
			out += ch;
			continue;
		}
		if (upperNext === null) {
			// Start by uppercasing first letter.
			upperNext = true;
		}
		out += upperNext ? ch.toUpperCase() : ch.toLowerCase();
		upperNext = !upperNext;
	}
	return out;
}

export function toRandomCase(input: string): string {
	let out = '';
	for (const ch of input) {
		if (!isLetter(ch)) {
			out += ch;
			continue;
		}
		out += Math.random() < 0.5 ? ch.toUpperCase() : ch.toLowerCase();
	}
	return out;
}

export function toToggleRandom(input: string): string {
	return input;
}
