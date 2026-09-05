# Arkride Web

The Arkride web app: the marketing site, rider booking, the driver console,
the driver verification portal, and the operations review dashboard — one
Next.js 16 application talking to the Arkride NestJS API.

```
/                     marketing site, live network stats
/login /register      rider sign-in and sign-up (password or Privy)
/driver-login
/driver-register      driver sign-up: account + first vehicle in one step
/app                  rider: book, track, cancel, rate, trip history, account
/driver               driver: online toggle, ride pool, trip lifecycle, earnings
/verify               driver KYC document portal (9 steps)
/admin                operations: driver verification review
```

---

## Running it

You need the API up first. See `arkride-backend/README.md`; in short, Postgres
on **5433** and Redis on **6380** (not the default ports — a Homebrew Postgres
on 5432 wins over Docker for `localhost` and you will silently talk to the
wrong database), then the API on 4010.

```bash
npm install
cp .env.example .env.local     # then edit
npm run dev                    # http://localhost:3000
```

### Environment

| Variable | Required | What it is |
|---|---|---|
| `ARKRIDE_API_URL` | yes | API base, e.g. `http://localhost:4010`. **Not** `NEXT_PUBLIC_` — only Server Components, Server Actions and Route Handlers call the API, so the internal host never reaches the browser bundle. |
| `NEXT_PUBLIC_PRIVY_APP_ID` | no | Privy app id. Public by design: the SDK runs in the browser. Omit it and Privy sign-in disappears cleanly; password sign-in is unaffected. |

There is deliberately **no Privy app secret here**. This app never verifies a
Privy token itself — it hands the token to the API, which verifies it against
Privy's public key. The secret belongs only to the backend.

### Checks

```bash
npm run build                       # typecheck + build
npx eslint src                      # lint
node scripts/dev/check-contrast.mjs # WCAG AA contrast across the token set
```

---

## How it fits together

### Sessions live in httpOnly cookies

Forms post to Server Actions. The action calls the API, and the session comes
back as cookies the browser cannot read.

The obvious alternative — `localStorage` — is readable by any script on the
page, so a single XSS anywhere hands an attacker a live session. The reference
frontend we studied does exactly that, and it is the most common way a
ride-hailing account gets taken over.

The API authenticates with `Authorization: Bearer` and has no cookie support of
its own, so the cookie is *our* storage and the header is attached server-side
on the way out. `src/lib/api/client.ts` is `server-only`; importing it from a
client component is a build error rather than a silent token leak.

**Refresh is single-caller, never automatic.** The backend rotates the refresh
token on every use and revokes the whole family if a spent token is presented
again. Two parallel refreshes are indistinguishable from theft, so there is no
retry-on-401 inside `apiFetch` — a page with four Server Components would fire
four refreshes and sign the user out of everything.

### Authorisation is the backend's, not ours

`src/proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`) only asks "is
there a session cookie?" and redirects anonymous visitors to the right sign-in
page. It is a bouncer, not the lock: it has no signing secret, and a role claim
read from an unverified token is worth nothing.

The real check is in the layouts. `/admin` is strictest — `requireAdmin()`
calls an endpoint the API restricts to admins and treats the answer as the
verdict, so a forged cookie fails even though this app never verifies a
signature. Rider and driver guards read the role claim to route people
sensibly; every byte of data behind them comes from an endpoint the API
authorises independently.

### The API returns numeric strings

Postgres `numeric` columns arrive as strings — `"21.71"`, `"1819.70"`,
`ratingAverage: "0.00"`. `node-postgres` does that on purpose, because a float
cannot hold every decimal exactly. Calling `.toFixed()` on them throws.

Every response is normalised at the boundary (`normalizeRide`,
`normalizeDriver`), including objects nested inside others. Components never
see a numeric string. Also note the settled fare is `finalFare`, not `fare`,
and it is null until the ride completes.

### Design tokens

One system, defined in `src/app/globals.css` and consumed everywhere. Brand
amber is `#f3ba3f` with **black** text on it — white on this amber is 1.76:1
and fails contrast badly.

Tailwind's standard type-scale names keep their standard meanings. The mobile
app's smaller scale lives under names Tailwind does not define. An earlier
version redefined `text-sm` to 12px and `text-3xl` to 22px globally, silently
shrinking every portal screen written against the defaults.

---

## Known constraints

These are **API gaps, not design choices**. Each one is the reason a piece of
UI looks simpler than you might expect.

| Area | Constraint |
|---|---|
| **Document upload** | The API has no file upload at all — no multipart handling, no storage SDK, no document columns. The 9-step KYC portal collects 18 documents and can only hold them on the device. |
| **KYC coverage** | 3 of 9 steps have a backend (personal details, licence numbers, vehicle). Identity, address, guarantor, documents and review-submission have no endpoint or column. |
| **Locations** | The API validates coordinates and does not geocode, and there is no geocoding key. Pickup and drop-off come from a curated Lagos set plus browser geolocation. Swap `src/lib/places/lagos.ts` for a places autocomplete when there is a key; the `Place` shape already matches. |
| **Live updates** | Trip and pool state poll (12s / 15s). The Socket.IO gateway exists but wants the raw token in its handshake, and the token is in an httpOnly cookie on purpose. The fix is a short-lived socket-ticket endpoint on the backend. |
| **Rider money** | `/wallet/*` is driver-only and 403s for a rider token. Riders get `/ledger/me`, a statement — no top-up, no cards, no cashback endpoint. |
| **Profiles** | No profile editing: the API has no users controller, so there is no `GET /users/me` and no `PATCH`. Sign-in is the only source of a name, so it is cached in a cookie and will go stale. |
| **Rejection reasons** | `PATCH /drivers/:id/verification-status` accepts a `reason` and its controller discards it. Rejected drivers are never told why. Sent anyway, so it starts working when the controller is fixed. |
| **Rate limits** | 120 requests/minute across everything, and 5/minute on login. Poll intervals are chosen against that budget, not for snappiness. |

---

## How this codebase was reviewed

Work here ran as a loop of adversarial roles rather than a single build pass:
a **builder**, an **adversarial auditor** attacking what the builder shipped, a
**fixer**, a **design researcher**, and a **judge** grading the result. The
loop repeated until the judge stopped finding blockers.

This is documented because it is not ceremony — **every serious defect below
was found by a role attacking the previous role's output, and none were found
by the person who wrote the code.** If you extend this codebase, the useful
lesson is that "it builds and the tests pass" caught none of them.

**What the auditor found that the builder had shipped:**

- `/admin` had **no authentication whatsoever**. `getCurrentReviewer()` returned
  a hardcoded name and approve/reject were client-side `onClick` handlers. The
  code comments pointed at a `middleware.ts` that was never written — and
  which, on Next 16, would not have run under that name anyway.
- Identity documents were written to `localStorage`. Measured on a realistic
  full submission: **5.57 MB per copy against a ~5 MB quota, written twice.**
  Both writes caught `QuotaExceededError` into an empty block while the UI said
  "Your progress is saved automatically" and "Encrypted & private". A driver
  could photograph nine documents, close the tab, and find an empty form.
- Not one of ~40 inputs in the KYC flow was associated with its label. A screen
  reader announced the field asking for a NIN number as "edit, blank".
- Upload validation was a `file.type` check — the browser's guess from the
  filename. Renaming `payload.svg` to `payload.pdf` passed.
- A `JSON.parse` failure in the review queue **reseeded six fictional
  applicants over the real queue.**

**What only running the app found — the DTOs were no help:**

- Numeric columns arrive as strings; `.toFixed()` 500'd the trip page and the
  driver dashboard.
- `PATCH /rides/:id/accept` needs a body. `vehicleId` is declared optional but
  carries `@IsUUID` with no `@IsOptional`, so omitting it is a 400.
- `POST /ratings` needs `rateeId` and `rateeType`; a ride has two parties and
  the API cannot infer which is being rated.
- The **CSP in this repo blocked Privy's own API**, so the sign-in button sat
  on "Loading…" forever with only `Failed to fetch` in the console. A
  misconfigured CSP disables features silently — nothing surfaces to the user.

**What the judge caught after the fixer declared done:**

- The OTP generator produced 6 digits while the DTOs still validated 4 —
  password reset was dead code.
- `pnpm` was not present in the production image, so migrations could not run.
- A test suite that did not compile, hidden by grepping only for `Tests:` in
  the output.

The end-to-end check that matters: register a rider and a driver, approve the
driver, go online, book, accept, arrive, start, complete, rate. On the last
run the driver's balance settled at **₦1,729 on a ₦1,820 fare — exactly the
95% the marketing page claims.**
