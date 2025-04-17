const TAO_API_BASE_URL = "https://api.tao.app";
const headers = {
	"Content-Type": "application/json",
};

// Helper function for API calls
export async function taoApiCall(
	apiKey: string,
	endpoint: string,
	queryParams: Record<string, string> = {},
) {
	const params = new URLSearchParams(queryParams);
	const url = `${TAO_API_BASE_URL}${endpoint}${params.toString() ? "?" + params.toString() : ""}`;

	const response = await fetch(url, {
		headers: { ...headers, "x-api-key": apiKey },
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Invalid or missing API key");
		}
		throw new Error(`API request failed: ${response.statusText}`);
	}

	return response.json();
}
