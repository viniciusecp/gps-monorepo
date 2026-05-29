import { request } from "./api";

interface ReverseGeocodeResponse {
  display_name: string;
}

async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResponse> {
  return request(
    `/api/geocode/reverse?lat=${lat}&lon=${lon}`,
  ) as Promise<ReverseGeocodeResponse>;
}

export { reverseGeocode };
export type { ReverseGeocodeResponse };
