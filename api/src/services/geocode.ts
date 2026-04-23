import { HTTPException } from "hono/http-exception";

const GEOCODE_API_URL =
    "https://maps.googleapis.com/maps/api/geocode/json";

export type LatLng = {
    lat: number;
    lng: number;
};

export async function geocodeAddress(address: string): Promise<LatLng> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY is not set");
    }

    const url = `${GEOCODE_API_URL}?address=${encodeURIComponent(
        address,
    )}&key=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new HTTPException(502, {
            message: `Geocoding failed: ${res.status}`,
        });
    }

    const data = (await res.json()) as {
        results?: Array<{
            geometry: {
                location: { lat: number; lng: number };
            };
        }>;
        status: string;
    };

    if (data.status !== "OK" || !data.results?.length) {
        throw new HTTPException(400, {
            message: `Invalid address: ${address}`,
        });
    }

    return data.results[0].geometry.location;
}