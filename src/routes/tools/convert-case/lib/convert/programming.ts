function splitToWords(input: string): string[] {
	// Break on transitions (camel/Pascal), separators, and whitespace.
	const normalized = input
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_\-./\\]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!normalized) return [];
	return normalized.split(' ');
}

function lower(word: string): string {
	return word.toLowerCase();
}

function capitalize(word: string): string {
	if (!word) return word;
	const l = word.toLowerCase();
	// uppercase first letter only
	return l.replace(/(^[\p{L}])/u, (m) => m.toUpperCase());
}

export function toCamelCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	const [first, ...rest] = words;
	return lower(first) + rest.map(capitalize).join('');
}

export function toPascalCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return words.map(capitalize).join('');
}

function joinSnake(words: string[], upper: boolean): string {
	return words.map((w) => (upper ? w.toUpperCase() : w.toLowerCase())).join('_');
}

function joinKebab(words: string[], upper: boolean): string {
	return words.map((w) => (upper ? w.toUpperCase() : w.toLowerCase())).join('-');
}

export function toSnakeCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return joinSnake(words, false);
}

export function toScreamingSnakeCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return joinSnake(words, true);
}

export function toKebabCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return joinKebab(words, false);
}

export function toTrainCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return words.map(capitalize).join('-');
}

export function toDotCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return words.map((w) => w.toLowerCase()).join('.');
}

export function toPathCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return words.map((w) => w.toLowerCase()).join('/');
}

export function toConstantCase(input: string): string {
	const words = splitToWords(input);
	if (words.length === 0) return input;
	return joinSnake(words, true);
}
