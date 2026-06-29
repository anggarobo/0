import {
	toCamelCase,
	toPascalCase,
	toSnakeCase,
	toKebabCase,
	toScreamingSnakeCase
} from './programming';

export function toIdentifier(
	input: string,
	kind: 'camel' | 'pascal' | 'snake' | 'kebab' | 'screaming_snake'
): string {
	switch (kind) {
		case 'camel':
			return toCamelCase(input);
		case 'pascal':
			return toPascalCase(input);
		case 'snake':
			return toSnakeCase(input);
		case 'kebab':
			return toKebabCase(input);
		case 'screaming_snake':
			return toScreamingSnakeCase(input);
	}
}
