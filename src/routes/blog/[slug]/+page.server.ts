import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const response = await fetch(`https://dev.to/api/articles/angga/${params.slug}`)
        const article = await response.json()
        return { article }
    } catch (err) {
        error(400, (err as Error)?.message)
    }
}