function splitLines(input: string): string[] {
	return input.length === 0 ? [] : input.split(/\r?\n/);
}

export function reverseText(input: string): string {
	return input.split('').reverse().join('');
}

export function reverseWords(input: string): string {
	const parts = input.match(/\S+/g);
	if (!parts) return input;
	const reversed = parts.reverse().join(' ');
	return input.replace(/\S+/g, () => reversed);
}

export function reverseLines(input: string): string {
	const lines = splitLines(input);
	return lines.slice().reverse().join('\n');
}

export function sortLinesAZ(input: string): string {
	const lines = splitLines(input);
	return lines
		.slice()
		.sort((a, b) => a.localeCompare(b))
		.join('\n');
}

export function sortLinesZA(input: string): string {
	const lines = splitLines(input);
	return lines
		.slice()
		.sort((a, b) => b.localeCompare(a))
		.join('\n');
}

export function removeDuplicateLines(input: string): string {
	const lines = splitLines(input);
	const seen = new Set<string>();
	const out: string[] = [];
	for (const line of lines) {
		if (seen.has(line)) continue;
		seen.add(line);
		out.push(line);
	}
	return out.join('\n');
}

export function removeEmptyLines(input: string): string {
	const lines = splitLines(input);
	return lines.filter((l) => l.trim().length > 0).join('\n');
}

export function trimEachLine(input: string): string {
	const lines = splitLines(input);
	return lines.map((l) => l.trim()).join('\n');
}

export function urlEncode(input: string): string {
	return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
	try {
		return decodeURIComponent(input);
	} catch {
		return input;
	}
}

export function htmlEncode(input: string): string {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '<')
		.replaceAll('>', '>')
		.replaceAll('"', '"')
		.replaceAll("'", '&#39;');
}

export function htmlDecode(input: string): string {
	const el = document.createElement('textarea');
	el.innerHTML = input;
	return el.value;
}

export function base64Encode(input: string): string {
	// Handle unicode
	const utf8 = new TextEncoder().encode(input);
	let bin = '';
	for (const b of utf8) bin += String.fromCharCode(b);
	return btoa(bin);
}

export function base64Decode(input: string): string {
	try {
		const bin = atob(input);
		const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	} catch {
		return input;
	}
}
