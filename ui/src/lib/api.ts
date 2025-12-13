// In order to avoid 'any' typing for fetch responses:
// https://stackoverflow.com/questions/41103360/how-to-use-fetch-in-typescript

const BASE_URL = "http://localhost:3000";

export async function api<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}/${path}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || response.statusText);
    }

    return data as T;
}