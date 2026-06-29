import { describe, expect, it } from 'vitest';
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
} from '../lib/convert/programming';

describe('Convert Case - Programming', () => {
	it('camel/pascal/snake/kebab', () => {
		expect(toCamelCase('Hello World Example')).toBe('helloWorldExample');
		expect(toPascalCase('Hello World Example')).toBe('HelloWorldExample');
		expect(toSnakeCase('Hello World Example')).toBe('hello_world_example');
		expect(toScreamingSnakeCase('Hello World Example')).toBe('HELLO_WORLD_EXAMPLE');
		expect(toKebabCase('Hello World Example')).toBe('hello-world-example');
	});

	it('train/dot/path/constant', () => {
		expect(toTrainCase('hello world')).toBe('Hello-World');
		expect(toDotCase('hello world')).toBe('hello.world');
		expect(toPathCase('hello world')).toBe('hello/world');
		expect(toConstantCase('hello world')).toBe('HELLO_WORLD');
	});

	it('camel from camel input', () => {
		expect(toCamelCase('helloWorld')).toBe('helloWorld');
	});

	it('empty string', () => {
		expect(toCamelCase('')).toBe('');
	});
});
