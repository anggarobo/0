import { env } from '$env/dynamic/private';

export async function load() {
    try {
        const response = await fetch("https://dev.to/api/articles/me", {
            headers : {
                "api-key": env.DEVTO_APIKEY as string
            }
        })

        const blogList = await response.json()
        return { listing: blogList }
    } catch (error) {
        console.error(`an error ocurred: ${error}`)
    }
}