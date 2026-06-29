import type { CaseKey, UtilityKey } from '../types';
import {
	toUppercase,
	toLowercase,
	toSentenceCase,
	toTitleCase,
	toCapitalizeEachWord,
	toInvertCase,
	toToggleCase,
	toAlternatingCase,
	toRandomCase
} from './basic';

import {
	toCamelCase,
	toPascalCase,
	toSnakeCase,
	toScreamingSnakeCase,
	toKebabCase,
	toTrainCase,
	toDotCase,
	toPathCase,
	toConstantCase
} from './programming';

import {
	reverseText,
	reverseWords,
	reverseLines,
	sortLinesAZ,
	sortLinesZA,
	removeDuplicateLines,
	removeEmptyLines,
	trimEachLine,
	urlEncode,
	urlDecode,
	htmlEncode,
	htmlDecode,
	base64Encode,
	base64Decode
} from './utilities';

export function convertByCaseKey(input: string, key: CaseKey): string {
	switch (key) {
		case 'upper':
			return toUppercase(input);
		case 'lower':
			return toLowercase(input);
		case 'sentence':
			return toSentenceCase(input);
		case 'title':
			return toTitleCase(input);
		case 'capitalize':
			return toCapitalizeEachWord(input);
		case 'invert':
			return toInvertCase(input);
		case 'toggle':
			return toToggleCase(input);
		case 'alternating':
			return toAlternatingCase(input);
		case 'random':
			return toRandomCase(input);

		case 'camel':
			return toCamelCase(input);
		case 'pascal':
			return toPascalCase(input);
		case 'snake':
			return toSnakeCase(input);
		case 'screaming_snake':
			return toScreamingSnakeCase(input);
		case 'kebab':
			return toKebabCase(input);
		case 'train':
			return toTrainCase(input);
		case 'dot':
			return toDotCase(input);
		case 'path':
			return toPathCase(input);
		case 'constant':
			return toConstantCase(input);
	}
}

export function convertByUtilityKey(input: string, key: UtilityKey): string {
	switch (key) {
		case 'reverse_text':
			return reverseText(input);
		case 'reverse_words':
			return reverseWords(input);
		case 'reverse_lines':
			return reverseLines(input);
		case 'sort_lines_az':
			return sortLinesAZ(input);
		case 'sort_lines_za':
			return sortLinesZA(input);
		case 'remove_duplicate_lines':
			return removeDuplicateLines(input);
		case 'remove_empty_lines':
			return removeEmptyLines(input);
		case 'trim_each_line':
			return trimEachLine(input);
		case 'url_encode':
			return urlEncode(input);
		case 'url_decode':
			return urlDecode(input);
		case 'html_encode':
			return htmlEncode(input);
		case 'html_decode':
			return htmlDecode(input);
		case 'base64_encode':
			return base64Encode(input);
		case 'base64_decode':
			return base64Decode(input);
	}
}
