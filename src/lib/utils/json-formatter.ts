// src/lib/utils/json-formatter.ts

export type IndentOption = 2 | 4 | 'tab';
export type JsonValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface FormatResult {
	output: string | null;
	error: ParseError | null;
}

export interface ParseResult {
	value: unknown;
	error: ParseError | null;
	decodedLevels: number;
}

export interface ParseError {
	message: string;
	line: number | null;
	column: number | null;
}

export interface JsonNode {
	type: JsonValueType;
	value: unknown;
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

const MAX_ENCODED_JSON_DEPTH = 3;

export function parseJSON(input: string): ParseResult {
	const trimmed = input.trim();
	if (!trimmed) return { value: null, error: null, decodedLevels: 0 };

	try {
		const parsed: unknown = JSON.parse(trimmed);
		const { value, decodedLevels } = normalizeEncodedJSON(parsed);
		return { value, error: null, decodedLevels };
	} catch (e) {
		return { value: null, error: extractError(e, trimmed), decodedLevels: 0 };
	}
}

function normalizeEncodedJSON(value: unknown): { value: unknown; decodedLevels: number } {
	let current = value;
	let decodedLevels = 0;

	while (decodedLevels < MAX_ENCODED_JSON_DEPTH && typeof current === 'string') {
		const candidate = current.trim();
		if (!looksLikeStructuredJSON(candidate)) break;

		try {
			current = JSON.parse(candidate) as unknown;
			decodedLevels += 1;
		} catch {
			break;
		}
	}

	return { value: current, decodedLevels };
}

function looksLikeStructuredJSON(value: string): boolean {
	if (value.length < 2) return false;
	const first = value[0];
	const last = value[value.length - 1];
	return (first === '{' && last === '}') || (first === '[' && last === ']');
}

function extractError(e: unknown, source: string): ParseError {
	const raw = e instanceof Error ? e.message : String(e);

	const lineColMatch = raw.match(/at line (\d+) column (\d+)/i);
	if (lineColMatch) {
		return {
			message: raw,
			line: parseInt(lineColMatch[1], 10),
			column: parseInt(lineColMatch[2], 10)
		};
	}

	const posMatch = raw.match(/at position (\d+)/i);
	if (posMatch) {
		const pos = parseInt(posMatch[1], 10);
		const before = source.slice(0, pos);
		const line = (before.match(/\n/g) ?? []).length + 1;
		const lastNl = before.lastIndexOf('\n');
		const column = pos - (lastNl === -1 ? 0 : lastNl);
		return { message: raw, line, column };
	}

	return { message: raw, line: null, column: null };
}

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

export function formatJSON(input: string, indent: IndentOption): FormatResult {
	const { value, error } = parseJSON(input);
	if (error) return { output: null, error };
	if (value === null && input.trim() === '') return { output: '', error: null };
	return { output: stringifyJSON(value, indent), error: null };
}

export function minifyJSON(input: string): FormatResult {
	const { value, error } = parseJSON(input);
	if (error) return { output: null, error };
	if (value === null && input.trim() === '') return { output: '', error: null };
	return { output: JSON.stringify(value), error: null };
}

export function stringifyJSON(value: unknown, indent: IndentOption): string {
	const indentStr = indent === 'tab' ? '\t' : ' '.repeat(indent);
	return JSON.stringify(value, null, indentStr);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchMatch {
	path: string;
	keyMatch: boolean;
	valueMatch: boolean;
}

export function searchJSON(value: unknown, query: string): SearchMatch[] {
	const q = normalizeSearchQuery(query);
	if (!q) return [];
	const matches: SearchMatch[] = [];
	const stack: Array<{ value: unknown; path: string; keyName: string | null }> = [
		{ value, path: '', keyName: null }
	];

	while (stack.length > 0) {
		const item = stack.pop();
		if (!item) break;

		const currentPath = item.path || '(root)';
		const keyMatch = item.keyName !== null && item.keyName.toLowerCase().includes(q);
		const valueMatch =
			isSearchableValue(item.value) && formatSearchValue(item.value).toLowerCase().includes(q);

		if (keyMatch || valueMatch) {
			matches.push({ path: currentPath, keyMatch, valueMatch });
		}

		if (Array.isArray(item.value)) {
			for (let index = item.value.length - 1; index >= 0; index -= 1) {
				stack.push({
					value: item.value[index],
					path: appendArrayIndex(item.path, index),
					keyName: null
				});
			}
			continue;
		}

		if (item.value !== null && typeof item.value === 'object') {
			const entries = Object.entries(item.value as Record<string, unknown>);
			for (let index = entries.length - 1; index >= 0; index -= 1) {
				const [key, child] = entries[index];
				stack.push({
					value: child,
					path: appendObjectKey(item.path, key),
					keyName: key
				});
			}
		}
	}

	return matches;
}

export function normalizeSearchQuery(query: string): string {
	return query.trim().toLowerCase();
}

function isSearchableValue(value: unknown): boolean {
	return value === null || typeof value !== 'object';
}

function formatSearchValue(value: unknown): string {
	return value === null ? 'null' : String(value);
}

// ---------------------------------------------------------------------------
// Array table
// ---------------------------------------------------------------------------

export interface JsonTableColumn {
	key: string;
	label: string;
}

export interface JsonTableRow {
	index: number;
	cells: Record<string, string>;
}

export interface JsonTableData {
	columns: JsonTableColumn[];
	rows: JsonTableRow[];
	totalRows: number;
	truncated: boolean;
}

export function buildArrayTable(value: unknown, maxRows = 10000): JsonTableData | null {
	if (!Array.isArray(value)) return null;

	const visibleItems = value.slice(0, maxRows);
	const objectKeys = new Set<string>();
	let hasNonObjectRows = false;

	for (const item of visibleItems) {
		if (isRecord(item)) {
			for (const key of Object.keys(item)) objectKeys.add(key);
		} else {
			hasNonObjectRows = true;
		}
	}

	const columns: JsonTableColumn[] = Array.from(objectKeys).map((key) => ({ key, label: key }));
	if (columns.length === 0 || hasNonObjectRows) {
		columns.unshift({ key: 'value', label: 'value' });
	}

	const rows = visibleItems.map((item, index) => ({
		index,
		cells: buildTableCells(item, columns, hasNonObjectRows)
	}));

	return {
		columns,
		rows,
		totalRows: value.length,
		truncated: value.length > maxRows
	};
}

function buildTableCells(
	item: unknown,
	columns: JsonTableColumn[],
	includeRawValue: boolean
): Record<string, string> {
	const cells: Record<string, string> = {};

	for (const column of columns) cells[column.key] = '';

	if (isRecord(item)) {
		for (const [key, value] of Object.entries(item)) {
			if (key in cells) cells[key] = formatTableCell(value);
		}
		if (includeRawValue) cells.value = formatTableCell(item);
		return cells;
	}

	cells.value = formatTableCell(item);
	return cells;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function formatTableCell(value: unknown): string {
	if (value === null) return 'null';
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

export function appendObjectKey(path: string, key: string): string {
	return path && path !== '(root)' ? `${path}.${key}` : key;
}

export function appendArrayIndex(path: string, index: number): string {
	return path && path !== '(root)' ? `${path}[${index}]` : `[${index}]`;
}

export function collectExpandablePaths(value: unknown): string[] {
	const paths: string[] = [];
	const stack: Array<{ value: unknown; path: string }> = [{ value, path: '(root)' }];

	while (stack.length > 0) {
		const item = stack.pop();
		if (!item) break;
		if (!isExpandableValue(item.value)) continue;

		paths.push(item.path);

		if (Array.isArray(item.value)) {
			for (let index = item.value.length - 1; index >= 0; index -= 1) {
				stack.push({ value: item.value[index], path: appendArrayIndex(item.path, index) });
			}
			continue;
		}

		const entries = Object.entries(item.value as Record<string, unknown>);
		for (let index = entries.length - 1; index >= 0; index -= 1) {
			const [key, child] = entries[index];
			stack.push({ value: child, path: appendObjectKey(item.path, key) });
		}
	}

	return paths;
}

export function collectDefaultExpandedPaths(value: unknown, maxDepth = 0): string[] {
	const paths: string[] = [];
	const stack: Array<{ value: unknown; path: string; depth: number }> = [
		{ value, path: '(root)', depth: 0 }
	];

	while (stack.length > 0) {
		const item = stack.pop();
		if (!item) break;
		if (!isExpandableValue(item.value) || item.depth > maxDepth) continue;

		paths.push(item.path);
		if (item.depth === maxDepth) continue;

		if (Array.isArray(item.value)) {
			for (let index = item.value.length - 1; index >= 0; index -= 1) {
				stack.push({
					value: item.value[index],
					path: appendArrayIndex(item.path, index),
					depth: item.depth + 1
				});
			}
			continue;
		}

		const entries = Object.entries(item.value as Record<string, unknown>);
		for (let index = entries.length - 1; index >= 0; index -= 1) {
			const [key, child] = entries[index];
			stack.push({
				value: child,
				path: appendObjectKey(item.path, key),
				depth: item.depth + 1
			});
		}
	}

	return paths;
}

function isExpandableValue(value: unknown): boolean {
	return value !== null && typeof value === 'object';
}

// ---------------------------------------------------------------------------
// Node type helper
// ---------------------------------------------------------------------------

export function getNodeType(value: unknown): JsonValueType {
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'array';
	if (typeof value === 'object') return 'object';
	if (typeof value === 'string') return 'string';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'boolean') return 'boolean';
	return 'null';
}
