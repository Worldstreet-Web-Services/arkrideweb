/**
 * A curated set of Lagos pickup and drop-off points.
 *
 * WHY THIS EXISTS INSTEAD OF A SEARCH BOX
 *
 * The booking API takes `{address, lat, lng}` and validates the coordinates —
 * it does not geocode. There is no geocoding service configured anywhere in
 * this stack and no key for one, so a free-text address box would have nothing
 * to turn "12 Allen Avenue" into, and the request would fail validation.
 *
 * A fixed list of real, correctly-geolocated places is the honest version of
 * what can be built today: everything in it books successfully. Browser
 * geolocation covers "where I actually am" for pickup.
 *
 * This should be replaced by a places autocomplete (Google Places, Mapbox
 * Search) the moment there is a key for one. The `Place` shape is already what
 * such an API returns, so the swap is at this file and nowhere else.
 */

export interface Place {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const LAGOS_PLACES: Place[] = [
  { id: "mmia", name: "Murtala Muhammed Airport (International)", area: "Ikeja", lat: 6.5774, lng: 3.3212 },
  { id: "mma2", name: "MMA2 Domestic Terminal", area: "Ikeja", lat: 6.5828, lng: 3.3277 },
  { id: "allen", name: "Allen Avenue", area: "Ikeja", lat: 6.6018, lng: 3.3515 },
  { id: "ikeja-city-mall", name: "Ikeja City Mall", area: "Ikeja", lat: 6.6135, lng: 3.3579 },
  { id: "computer-village", name: "Computer Village", area: "Ikeja", lat: 6.5960, lng: 3.3419 },
  { id: "berger", name: "Berger Bus Stop", area: "Ojodu", lat: 6.6470, lng: 3.3670 },
  { id: "ojota", name: "Ojota Bus Stop", area: "Ojota", lat: 6.5833, lng: 3.3833 },
  { id: "yaba", name: "Yaba Market", area: "Yaba", lat: 6.5095, lng: 3.3711 },
  { id: "unilag", name: "University of Lagos", area: "Akoka", lat: 6.5158, lng: 3.3966 },
  { id: "surulere", name: "National Stadium, Surulere", area: "Surulere", lat: 6.4969, lng: 3.3611 },
  { id: "cms", name: "CMS Bus Stop", area: "Lagos Island", lat: 6.4494, lng: 3.3903 },
  { id: "marina", name: "Marina", area: "Lagos Island", lat: 6.4526, lng: 3.3944 },
  { id: "obalende", name: "Obalende", area: "Lagos Island", lat: 6.4498, lng: 3.4064 },
  { id: "ikoyi", name: "Awolowo Road, Ikoyi", area: "Ikoyi", lat: 6.4487, lng: 3.4247 },
  { id: "vi-lekki-toll", name: "Lekki Toll Gate", area: "Lekki", lat: 6.4409, lng: 3.4740 },
  { id: "vi-adeola", name: "Adeola Odeku, Victoria Island", area: "Victoria Island", lat: 6.4281, lng: 3.4219 },
  { id: "landmark", name: "Landmark Beach", area: "Victoria Island", lat: 6.4271, lng: 3.4553 },
  { id: "lekki-phase1", name: "Lekki Phase 1", area: "Lekki", lat: 6.4478, lng: 3.4723 },
  { id: "ajah", name: "Ajah Bus Stop", area: "Ajah", lat: 6.4667, lng: 3.5667 },
  { id: "sangotedo", name: "Sangotedo", area: "Ajah", lat: 6.4658, lng: 3.5896 },
  { id: "festac", name: "Festac Town", area: "Amuwo-Odofin", lat: 6.4667, lng: 3.2833 },
  { id: "apapa", name: "Apapa Wharf", area: "Apapa", lat: 6.4433, lng: 3.3611 },
  { id: "mushin", name: "Mushin Market", area: "Mushin", lat: 6.5278, lng: 3.3494 },
  { id: "oshodi", name: "Oshodi Transport Interchange", area: "Oshodi", lat: 6.5555, lng: 3.3376 },
  { id: "agege", name: "Agege Pen Cinema", area: "Agege", lat: 6.6231, lng: 3.3213 },
  { id: "ikorodu", name: "Ikorodu Roundabout", area: "Ikorodu", lat: 6.6194, lng: 3.5105 },
];

/** Case-insensitive match on the place name or its area. */
export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return LAGOS_PLACES.slice(0, limit);

  return LAGOS_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q),
  ).slice(0, limit);
}

export function placeLabel(place: Place): string {
  return `${place.name}, ${place.area}`;
}
