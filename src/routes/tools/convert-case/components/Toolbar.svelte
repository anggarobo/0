<script lang="ts">
	import type { CaseKey, UtilityKey } from '../lib/types';
	import ActionGroup from './ActionGroup.svelte';
	import type { Action } from './ActionGroup.svelte';

	export let onConvert: (key: CaseKey | UtilityKey) => void;

	const basic: Action[] = [
		{ key: 'upper', label: 'UPPER' },
		{ key: 'lower', label: 'lower' },
		{ key: 'sentence', label: 'Sentence' },
		{ key: 'title', label: 'Title' },
		{ key: 'capitalize', label: 'Capitalize' },
		{ key: 'invert', label: 'Invert' },
		{ key: 'toggle', label: 'Toggle' },
		{ key: 'alternating', label: 'Alternating' },
		{ key: 'random', label: 'Random' }
	];

	const programming: Action[] = [
		{ key: 'camel', label: 'camelCase' },
		{ key: 'pascal', label: 'PascalCase' },
		{ key: 'snake', label: 'snake_case' },
		{ key: 'screaming_snake', label: 'SCREAMING_SNAKE_CASE' },
		{ key: 'kebab', label: 'kebab-case' },
		{ key: 'train', label: 'Train-Case' },
		{ key: 'dot', label: 'dot.case' },
		{ key: 'path', label: 'path/case' },
		{ key: 'constant', label: 'CONSTANT_CASE' }
	] as Action[];

	const utilities: Action[] = [
		{ key: 'reverse_text', label: 'Reverse Text' },
		{ key: 'reverse_words', label: 'Reverse Words' },
		{ key: 'reverse_lines', label: 'Reverse Lines' },
		{ key: 'sort_lines_az', label: 'Sort Lines A-Z' },
		{ key: 'sort_lines_za', label: 'Sort Lines Z-A' },
		{ key: 'remove_duplicate_lines', label: 'Remove Duplicate Lines' },
		{ key: 'remove_empty_lines', label: 'Remove Empty Lines' },
		{ key: 'trim_each_line', label: 'Trim Each Line' },
		{ key: 'url_encode', label: 'URL Encode' },
		{ key: 'url_decode', label: 'URL Decode' },
		{ key: 'html_encode', label: 'HTML Encode' },
		{ key: 'html_decode', label: 'HTML Decode' },
		{ key: 'base64_encode', label: 'Base64 Encode' },
		{ key: 'base64_decode', label: 'Base64 Decode' }
	];
</script>

<div class="space-y-4 flex gap-3">
	<ActionGroup title="Basic" actions={basic} onAction={(k: string) => onConvert(k as CaseKey)} />
	<ActionGroup
		title="Programming"
		actions={programming}
		onAction={(k: string) => onConvert(k as CaseKey)}
	/>
	<ActionGroup
		title="Utilities"
		actions={utilities}
		onAction={(k: string) => onConvert(k as UtilityKey)}
	/>
</div>
