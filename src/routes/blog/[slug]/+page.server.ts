import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import http from '$lib/utils/http';

export const load: PageServerLoad = async ({ params }) => {
	const response = await http<ArticleDevto, Error>(
		`https://dev.to/api/articles/angga/${params.slug}`
	);
	if (response.error) {
		return error(response.status, response);
	}

	return response;
};
