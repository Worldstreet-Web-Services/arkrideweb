# Deploying the web app to Railway

The API must be deployed first — see `arkride-backend/RAILWAY.md`. This app
renders almost everything on the server, so with no reachable API you get a
site that builds fine and then errors on every page that needs data.

## 1. Create the service

New Project → Deploy from GitHub repo → `ogazboiz/arkrideweb`.

Railway reads `railway.json` and builds from the `Dockerfile`. No further build
configuration is needed.

## 2. Environment variables

| Variable | Value | Notes |
|---|---|---|
| `ARKRIDE_API_URL` | `http://<backend-service>.railway.internal:4010` | See below. |
| `NEXT_PUBLIC_PRIVY_APP_ID` | your Privy app id | Optional. Omit it and Privy sign-in disappears cleanly; password sign-in still works. |

### Use the private network for the API

Every API call is made **server-side** — from Server Components, Server Actions
and Route Handlers — so the browser never contacts the API directly. That means
`ARKRIDE_API_URL` should be the backend's **internal** Railway address, not its
public one:

```
ARKRIDE_API_URL=http://arkride-backend.railway.internal:4010
```

Traffic stays inside Railway's network, never crosses the public internet, and
you are not paying egress to talk to your own backend. It also sidesteps CORS
entirely: a server-to-server request sends no `Origin` header, and the API's
allowlist admits requests without one.

If you use the public URL instead, add this app's domain to the backend's
`CORS_ORIGINS` or browser-side calls will be refused.

### The Privy app id is a build-time variable

`NEXT_PUBLIC_*` variables are compiled into the client bundle by definition, so
it must be present **at build time**, not just at runtime. In Railway, add it as
a service variable before the first deploy — setting it afterwards requires a
rebuild, not just a restart. Also add your Railway domain to the Privy
dashboard's allowed domains, or the SDK refuses to initialise and the sign-in
button reports itself unavailable.

## 3. Domain

Settings → Networking → Generate Domain, or attach a custom one.

## After deploying

Check these, in this order:

1. `/` renders and the network stats show non-zero numbers — that proves the
   app reached the API.
2. `/register` creates an account and lands you on `/app`.
3. `/admin` redirects to `/admin/login` when signed out. If it renders the
   dashboard to an anonymous visitor, stop and open an incident.

## Notes

- **The image runs as a non-root user** and uses Next's standalone output, so
  `node_modules` is not shipped. That matters here: the Privy dependency tree is
  roughly 990 packages.
- **`HOSTNAME=0.0.0.0` is required.** Next binds localhost by default, and
  Railway's healthcheck cannot reach a process bound to localhost. It is set in
  the Dockerfile; do not override it.
- **The CSP in `next.config.ts` allowlists Privy's hosts explicitly.** If you
  add another third-party SDK, add its hosts too — a blocked request surfaces
  nothing to the user, it just silently disables the feature.
