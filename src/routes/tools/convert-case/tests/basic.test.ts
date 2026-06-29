import { describe, expect, it } from 'vitest';
import {
	toUppercase,
	toLowercase,
	toSentenceCase,
	toTitleCase,
	toCapitalizeEachWord,
	toInvertCase,
	toToggleCase,
	toAlternatingCase
} from '../lib/convert/basic';

describe('Convert Case - Basic', () => {
	it('upper/lower', () => {
		expect(toUppercase('Abc')).toBe('ABC');
		expect(toLowercase('AbC')).toBe('abc');
	});

	it('title/capitalize', () => {
		expect(toTitleCase('hello world')).toBe('Hello World');
		expect(toCapitalizeEachWord('hello   world')).toBe('Hello World');
	});

	it('sentence case', () => {
		expect(toSentenceCase('hello. world! how ARE you?')).toBe('Hello. World! How are you?');
	});

	it('invert', () => {
		expect(toInvertCase('aB1c')).toBe('Ab1C');
	});

	it('toggle', () => {
		expect(toToggleCase('hello')).toBe('HELLO');
		expect(toToggleCase('HELLO')).toBe('hello');
	});

	it('alternating', () => {
		expect(toAlternatingCase('abcd')).toBe('AbCd');
	});

	it('unicode + emoji', () => {
		expect(toUppercase('grüße 😊')).toContain('GRÜS');
	});

	it('empty string', () => {
		expect(toUppercase('')).toBe('');
	});
});
