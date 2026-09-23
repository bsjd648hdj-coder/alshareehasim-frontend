export interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
  // Extended fields
  formattedAddress?: string;
  placeId?: string;
  street?: string;
  buildingNumber?: string;
  additionalNumber?: string;
  plusCode?: string;
}

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

async function reverseGeocodeGoogle(lat: number, lng: number): Promise<Omit<AddressData, "latitude" | "longitude"> | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ar&key=${KEY}`
    );
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) return null;
    const components: { long_name: string; types: string[] }[] = data.results[0].address_components;
    const get = (...types: string[]) => components.find(c => types.some(t => c.types.includes(t)))?.long_name ?? "";
    const city = get("locality", "administrative_area_level_2");
    const state = get("administrative_area_level_1");
    if (!city && !state && !data.results[0].formatted_address) return null;
    return {
      address: data.results[0].formatted_address ?? "",
      formattedAddress: data.results[0].formatted_address ?? "",
      country: get("country"),
      city,
      state,
      district: get("sublocality", "sublocality_level_1", "neighborhood"),
      postalCode: get("postal_code"),
      street: get("route"),
      buildingNumber: get("street_number"),
    };
  } catch {
    return null;
  }
}

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<Omit<AddressData, "latitude" | "longitude"> | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
      { headers: { "User-Agent": "sahlnaha-app" } }
    );
    const data = await res.json();
    if (!data?.address) return null;
    const a = data.address;
    return {
      address: data.display_name ?? "",
      country: a.country ?? "",
      city: a.city || a.town || a.village || a.county || "",
      state: a.state || a.region || "",
      district: a.suburb || a.neighbourhood || a.quarter || "",
      postalCode: a.postcode ?? "",
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<Omit<AddressData, "latitude" | "longitude"> | null> {
  const google = await reverseGeocodeGoogle(lat, lng);
  if (google) return google;
  return reverseGeocodeNominatim(lat, lng);
}

export async function searchAddress(query: string): Promise<{ display_name: string; lat: string; lon: string }[]> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ar&region=SA&key=${KEY}`
    );
    const data = await res.json();
    if (data.status !== "OK") return [];
    return data.results.slice(0, 5).map((r: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }) => ({
      display_name: r.formatted_address,
      lat: String(r.geometry.location.lat),
      lon: String(r.geometry.location.lng),
    }));
  } catch {
    return [];
  }
}
