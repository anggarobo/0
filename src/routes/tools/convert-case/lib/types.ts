export type CaseKey =
	| 'upper'
	| 'lower'
	| 'sentence'
	| 'title'
	| 'capitalize'
	| 'invert'
	| 'toggle'
	| 'alternating'
	| 'random'
	| 'camel'
	| 'pascal'
	| 'snake'
	| 'screaming_snake'
	| 'kebab'
	| 'train'
	| 'dot'
	| 'path'
	| 'constant';

export type UtilityKey =
	| 'reverse_text'
	| 'reverse_words'
	| 'reverse_lines'
	| 'sort_lines_az'
	| 'sort_lines_za'
	| 'remove_duplicate_lines'
	| 'remove_empty_lines'
	| 'trim_each_line'
	| 'url_encode'
	| 'url_decode'
	| 'html_encode'
	| 'html_decode'
	| 'base64_encode'
	| 'base64_decode';

export type ConvertResult = {
	input: string;
	output: string;
};
