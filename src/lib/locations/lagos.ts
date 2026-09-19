/**
 * The 20 Local Government Areas of Lagos State, for the waitlist's "Where in
 * Lagos are you?" dropdown.
 *
 * A constant rather than an API call: the list is official and stable, the
 * waitlist is a public marketing form that should not depend on the backend to
 * render, and the API stores whatever string it is sent. Anyone outside this
 * list picks "Other" and types their own, so the API never validates
 * membership.
 */
export const LAGOS_LGAS = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaiye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere",
] as const;
