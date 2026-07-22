export async function parseApiJson(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}).`);
    }

    if (!contentType.includes('application/json')) {
        throw new Error('API returned non-JSON response. Check server /api routing and API base URL.');
    }

    return JSON.parse(raw);
}
