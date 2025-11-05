import { env } from '$env/dynamic/private';
import http from '$lib/utils/http';
import { error } from '@sveltejs/kit';

export async function load() {
	const response = await http<ArticleDevto[], Error>('https://dev.to/api/articles/me', {
		headers: {
			'api-key': env.DEVTO_APIKEY
		}
	});

	if (response.error) {
		return error(response.status, response);
	}

	return response;
}
