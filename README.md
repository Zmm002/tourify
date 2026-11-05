# Tourify

Tourify is a theme park with many rides and play areas. This Next.js website introduces the park and its attractions; visitors place ticket orders through the Tourify app. The admin workspace manages attractions and records ticket bookings.

## Run locally

Requirements: Node.js 24 or a supported Node.js LTS release, npm, and PostgreSQL (local or Docker).

1. Copy `.env.example` to `.env` and set a local database password plus a unique `BETTER_AUTH_SECRET`. Keep `.env` private.
2. Start PostgreSQL. With Docker Compose, run `docker compose up -d db`.
3. Install dependencies with `npm install`.
4. Apply database migrations with `npm run db:deploy`.
5. Start the site with `npm run dev` and visit `http://localhost:3000`.

To create a development migration, use `npm run db:migrate`. To regenerate Prisma Client, use `npm run db:generate`.

## Pages

- `/` — public Tourify introduction, ride catalogue, visitor information, and sample reviews.
- `/login` and `/signup` — admin sign-in and account creation.
- `/dashboard` — booking and revenue overview.
- `/bookings` — review and manage ticket bookings.
- `/destinations` — admin ride catalogue (shown as **Wahana** in the interface).
- `/customers` — customer directory derived from bookings.
- `/reports` — booking analytics and CSV export.
- `/settings` and `/profile` — admin preferences and profile settings.

The public website is informational. Ticket ordering is described as an app flow; there is no public checkout on the website.

## Data and security

- PostgreSQL stores accounts, sessions, bookings, and admin-managed rides.
- Booking and customer data is scoped to the admin account that created it.
- The server calculates ticket totals from the ride catalogue.
- Better Auth handles passwords and sessions; changes validate input and verify request origin.
- Runtime credentials are read from environment variables. `.env` is excluded from Git; only the placeholder `.env.example` belongs in the repository.

For a deployment, configure HTTPS, production database credentials, a unique auth secret, and database backups before accepting real users.

## Previous static site

The earlier static Tourify site is archived in `legacy-tourify/`.
