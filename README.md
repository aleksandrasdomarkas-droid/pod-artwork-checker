# POD Artwork Checker

An embedded Shopify Admin app for checking print-on-demand artwork before production. It uses Shopify's current React Router app architecture, authenticated server actions, Prisma/PostgreSQL persistence, and `sharp` image inspection.

## What is included

- Authenticated embedded App Home and upload flow
- PNG, JPEG, WebP and TIFF validation with a 25 MB default limit
- Pixel dimensions, alpha/transparency, file format, 300 DPI print-size calculation, score and actionable warnings
- Private development-only file storage, database records and usage events
- App-uninstalled and mandatory privacy webhooks; invalid webhook signatures are rejected by Shopify's webhook authentication
- Docker build and PostgreSQL service, plus unit tests

## Local setup

1. Install Node.js 20.10+ and Shopify CLI, then copy `.env.example` to `.env` and fill in Shopify credentials.
2. Start PostgreSQL: `docker compose up -d`.
3. Install dependencies: `npm install`.
4. Generate the client and create the schema: `npm run prisma:generate` then `npm run prisma:migrate -- --name init`.
5. Start the development tunnel: `shopify app dev`.

The CLI creates/links the development app and updates development URLs. Do not commit `.env`.

## Tests and release checks

Run `npm run typecheck`, `npm test`, and `npm run build`. Test webhook handling using Shopify CLI or a development store. Verify an uninstall deletes data, upload each supported format, reject oversized/malformed files, and confirm the App Home works inside Shopify Admin.

## Deploy to Render

The checked-in `render.yaml` creates one Docker web service, a managed PostgreSQL database, and a 1 GB persistent disk for private uploaded artwork. This is deliberately a single-instance setup: local file storage is safe while the service has one instance, but use private object storage before scaling to multiple instances.

1. Create a private GitHub repository and push this folder to it. Do not upload `.env`, `uploads/`, or `prisma/dev.sqlite`.
2. In Render, choose **New → Blueprint** and select the repository. Render reads `render.yaml` and shows the web service and PostgreSQL database before it creates anything.
3. In the service's Environment page, provide the three secret values: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, and `SHOPIFY_APP_URL`. For the first deployment, set `SHOPIFY_APP_URL` to the generated `https://…onrender.com` address. Render keeps secret environment variables outside the Git repository.
4. Wait for the deployment to complete, then open the generated Render URL. The first start runs the committed PostgreSQL migration automatically.
5. In Shopify Partner Dashboard, update the app's application URL and redirect URL to the working Render URL, release a new app version, and reinstall/approve the app in the development store.
6. Add `app.sakramod.co.uk` as a custom domain in Render. Add the DNS record Render provides in the DNS provider for `sakramod.co.uk`, wait for verification, then repeat step 5 with `https://app.sakramod.co.uk` and `https://app.sakramod.co.uk/auth/callback`.

Render Web Services host public dynamic apps and support custom domains. Render documents how to add service environment variables and secrets in its dashboard. [Web Services](https://render.com/docs/web-services) · [Environment Variables](https://render.com/docs/configure-environment-variables)

Before public App Store submission, also finish the app icon, support/contact details, privacy policy, data-deletion policy, billing configuration, monitoring, backups, and a security review.

## Deliberate MVP boundaries

The score is a transparent rules-based estimate, not a print guarantee. It does not perform AI super-resolution, background removal, CMYK simulation, vector conversion, colour separation, or line-thickness OCR. Those features require dedicated processing workers and should be usage-metered before release.
