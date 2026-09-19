# Assembly - School life. All here.

A school events command centre built for the BTUI ’26 Web Development challenge. Assembly brings students, teachers and parents together around a single programme: discover events, read announcements, explore dates and reserve a place.

**Live application:** [Assembly](https://assembly-events.mahiru-sclevents.workers.dev)

**Public repository:** [Assembly-eventplanner](https://github.com/MahiruLokug/Assembly-eventplanner)

**Organiser workspace:** [Organiser sign-in](https://assembly-events.mahiru-sclevents.workers.dev/organiser) (approved organisers only)

## Purpose and objectives

- Replace scattered event notices with a clear, searchable programme.
- Make dates, venues, audiences and availability easy to understand.
- Provide durable online registration with capacity enforcement and downloadable admission references.
- Give authorised organisers one place to publish events and announcements and validate admission.

This is an independent competition demonstration, not an official Nalanda College service. Seeded events, dates and notices are fictional examples. Tickets are free demo admissions and are not valid for real events. No payment processing or email delivery is claimed.

## Features

- Responsive, keyboard-accessible event discovery and category/search filtering.
- Shareable event details (`/?event=EVENT_ID`) with date, time, venue and live capacity.
- Monthly calendar with previous/next navigation and calendar-file exports.
- Live countdown to the featured exhibition.
- Persistent SQLite-backed registration, unique email per event, atomic capacity guard.
- Downloadable ticket reference; retrieve or cancel a booking using the reference and email.
- Organiser event creation/editing/cancellation and announcements.
- Single-use admission check-in, with event matching and cancellation checks.
- Verified organiser sign-in through Cloudflare Access and a server-side email allowlist.
- Honest empty, failure, closed-event and fully-booked states.

## Technologies

TypeScript, React 19, Vinext (Next.js-compatible routing on Vite), Cloudflare Workers, Cloudflare D1/SQLite, Drizzle schema migrations, Tailwind CSS, Radix/Shadcn UI primitives and Lucide icons. The application uses prepared SQL statements and keeps database operations on the server.

## Run locally

Requires Node.js 22.13 or newer and npm. This application includes a server and database; it cannot run on static-only hosting.

1. Open the extracted project directory and install dependencies:
   ```sh
   npm ci
   ```
2. Initialise the local database:
   ```sh
   npm run db:local
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open the address printed in your terminal. The first event request inserts the example programme without overwriting organiser edits.

Public browsing, registrations and ticket lookup run locally. Organiser access remains locked until a valid Cloudflare Access identity is provided. There is no local authentication bypass. Authentication tests use temporary signing keys in an isolated test process.

To preview the production build, run `npm run build`, then `npm start`. The local D1 database is stored in `.wrangler/state`. To change the schema, edit `db/schema.ts`, run `npm run db:generate`, inspect the migration and apply it with the relevant database command.

## Host on your Cloudflare account

1. Sign in using `npx wrangler login`.
2. Create the production database:
   ```sh
   npx wrangler d1 create assembly-events
   ```
3. Copy the returned database ID into `wrangler.jsonc`, replacing the placeholder `database_id`. Keep the binding name `DB`. You may change the Worker name as well.
4. Apply migrations to the production database:
   ```sh
   npm run db:remote
   ```
5. Build and deploy:
   ```sh
   npm run build
   npm run deploy
   ```
6. Use the `workers.dev` address printed after deployment. This project is hosted at https://assembly-events.mahiru-sclevents.workers.dev. A custom domain is optional.
7. Configure organiser access as described below, then rebuild and deploy the updated configuration.
8. Add your live URL to this README and test browsing, registration, ticket lookup and organiser check-in before submitting.

Database IDs identify a binding; they are not credentials. Never commit account tokens, private keys, `.env` or `.dev.vars` files. Database content from any previously hosted version is not included in this source package. A new database starts with the fictional example programme.

## Organiser sign-in

In Cloudflare Zero Trust, create a self-hosted Access application for your `workers.dev` hostname. Protect both `/organiser` (including its subpaths) and `/api/organiser` (including its subpaths) in the same application so they share an application audience. Keep the public site and other public API paths outside this Access application.

Add an Allow policy for `mahirumanthila@gmail.com`, or the organiser emails you choose. For email login, add One-time PIN under Zero Trust > Integrations > Identity providers, then select it in the application authentication settings. Copy the application's Audience (AUD) Tag, then set these values in `wrangler.jsonc`:

- `ACCESS_TEAM_DOMAIN`: your team origin, `https://restless-frost-3994.cloudflareaccess.com` for this deployment.
- `ACCESS_AUD`: `deb05e668b75079de4558d88cb52c8d4fcb3a25f63ebb077f2d1c0b87b8bce2a` for this deployment.
- `ADMIN_EMAILS`: comma-separated approved organiser email addresses.

If deploying to a different account, use that account's team domain, application audience and organiser email list. These identifiers are not passwords.

Rebuild and deploy after changing configuration. Visiting `/organiser` on your `workers.dev` hostname will show the Access login screen before the organiser workspace. Sign out uses the Access logout endpoint. Keep the Access policy and the application's email allowlist aligned.

Every protected request verifies the token signature, issuer, audience, expiry and required identity claims, then checks the email allowlist. Requests without valid credentials remain denied even through an alternate Worker URL. The application trusts neither a plain email header nor an unsigned cookie. Missing authentication configuration fails closed.

See [Cloudflare's token validation guide](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) for the identity protocol.

## Code structure

- `app/assembly.tsx`: visitor experience, calendar and ticket flows.
- `app/globals.css`: visual system and responsive layouts.
- `app/api/`: event, registration, ticket and protected organiser endpoints.
- `app/organiser/`: organiser sign-in gate and workspace.
- `lib/events.ts`: shared types, example programme and date formatting.
- `lib/server.ts`: database access, seed and authorisation helpers.
- `lib/auth.ts`, `lib/access.ts`: organiser identity and signed token validation.
- `db/schema.ts`, `drizzle/`: database schema and migrations.
- `tests/`: focused storage and capacity regression checks.

## Data and security decisions

All event times are Sri Lanka time (UTC+05:30). Names and emails are stored for ticket administration. Ticket UUIDs act as high-entropy booking references and must be kept private. No browser storage holds authoritative bookings. SQL parameters prevent injection; capacity is checked in the same SQL statement that reserves the place. Cancelled and checked-in tickets cannot be used for admission. Both confirmed and checked-in tickets consume capacity. Every organiser mutation checks the server-side allowlist and rejects cross-origin browser requests.

Public event registration does not include email verification or confirmation emails. Organiser sign-in uses Cloudflare Access, which delivers login PINs. This demonstration does not implement payment processing, abuse throttling or production data-retention automation. Before real school use, add those controls as appropriate and approve the actual programme and privacy policy with the school.

## Verification

- `npm run typecheck`: check TypeScript.
- `npm run test:auth`: verify valid credentials and rejection of invalid, expired or unauthorised credentials.
- `python3 tests/capacity.py`: isolated SQLite concurrency and capacity regression checks.
- `python3 tests/api.py`: public booking flow checks while the local development server runs on port 3000. Uses fictional local records.
- `npm run build`: compile the production Worker and browser assets.

## Competition handoff

Use the public repository link and live application link in the official submission form. Test both while signed out. Review and understand the implementation before submitting, and follow the competition's originality and assistance rules. Only the first submission is evaluated; do not submit until your final review is complete.
