# Visitor analytics

This project uses React + Vite, so the integration imports Analytics from
`@vercel/analytics/react` in `src/main.jsx`, once inside the router.

1. Open the existing Vercel project → Analytics → Enable.
2. Redeploy this source on Vercel. Its VERCEL=1 build flag enables the component.
3. Visit the deployment and navigate to another page, then inspect Analytics.

Page views use pathname only. Chat text, nicknames and microphone recordings are
not sent as custom events. Query strings and hashes are removed by beforeSend.

The ChatGPT Sites preview/publication is a different host; Vercel collection
routes are not available there. No tracking script is mounted on that host.
`VITE_VERCEL_ANALYTICS=1` can explicitly enable the integration for a Vercel build
whose environment does not expose VERCEL. Do not enable it on unsupported hosts.
