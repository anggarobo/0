const http = async <T, E = Error>(baseUrl: string, requestInit?: RequestInit) => {
	let result: Http<T, E>;
	let httpreq: RequestInit = {};

	if (requestInit) {
		httpreq = {
			...requestInit
		};
	}

	try {
		const response = await fetch(baseUrl, httpreq);
		if (response.ok) {
			const json = await response.json();
			result = {
				data: json,
				message: response.statusText,
				status: response.status
			};
		} else {
			result = {
				message: response.statusText,
				status: response.status,
				error: new Error(response.statusText)
			};
		}
	} catch (error) {
		result = {
			error: error as Error,
			message: (error as Error).message,
			status: 500
		};
	}

	return result;
};

export default http;
