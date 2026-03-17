import { GiphyFetch } from '@giphy/js-fetch-api';

const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

if (!apiKey) {
    console.warn("Giphy API Key is missing");
}

export const gf = new GiphyFetch(apiKey || "placeholder");
