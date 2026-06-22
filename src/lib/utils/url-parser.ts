// src/lib/utils/url-parser.ts

export interface ParsedURL {
	href: string;
	protocol: string;
	hostname: string;
	port: string;
	origin: string;
	pathname: string;
	search: string;
	hash: string;
	queryParams: QueryParam[];
}

export interface QueryParam {
	key: string;
	value: string;
	decoded: { key: string; value: string };
}

export interface ParseResult {
	parsed: ParsedURL | null;
	error: string | null;
}

export function parseURL(input: string): ParseResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { parsed: null, error: null };
	}

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return {
			parsed: null,
			error: 'Invalid URL. Make sure it includes a protocol (e.g. https://).'
		};
	}

	const queryParams: QueryParam[] = [];
	// URLSearchParams preserves order and handles repeated keys
	url.searchParams.forEach((value, key) => {
		queryParams.push({
			key,
			value,
			decoded: {
				key: safeDecodeURIComponent(key),
				value: safeDecodeURIComponent(value)
			}
		});
	});

	return {
		parsed: {
			href: url.href,
			protocol: url.protocol.replace(':', ''),
			hostname: url.hostname,
			port: url.port,
			origin: url.origin,
			pathname: url.pathname,
			search: url.search,
			hash: url.hash.replace('#', ''),
			queryParams
		},
		error: null
	};
}

function safeDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function toQueryParamsJSON(params: QueryParam[]): string {
	const obj: Record<string, string | string[]> = {};
	for (const { decoded } of params) {
		const existing = obj[decoded.key];
		if (existing === undefined) {
			obj[decoded.key] = decoded.value;
		} else if (Array.isArray(existing)) {
			existing.push(decoded.value);
		} else {
			obj[decoded.key] = [existing, decoded.value];
		}
	}
	return JSON.stringify(obj, null, 2);
}
