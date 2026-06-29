import { describe, expect, it } from 'vitest';
import { getTextStats } from '../lib/convert/statistics';

describe('Convert Case - Statistics', () => {
	it('basic stats', () => {
		const stats = getTextStats('Hello world.\nSecond line');
		expect(stats.words).toBe(4);
		expect(stats.lines).toBe(2);
		expect(stats.sentences).toBe(1);
	});

	it('whitespace only', () => {
		const stats = getTextStats('   \n  ');
		expect(stats.words).toBe(0);
	});

	it('empty', () => {
		const stats = getTextStats('');
		expect(stats.characters).toBe(0);
	});
});
