# Pizza Delivery Application

A web app where customers build their own pizza (base, sauce, cheese, veggies, meat), pay, and track the order, and where an admin manages orders and ingredient stock. It was exported from the Anything app builder: a React Router web app with a Hono API on a Neon (PostgreSQL) database, plus an Expo mobile shell.

## Features
- **Customers:** sign up and sign in, build a custom pizza with a live price, add several pizzas to a cart, check out, and follow order status (Order Received → In the Kitchen → Sent to Delivery → Delivered).
- **Admin:** dashboard, order list with status updates, inventory editor (stock, price, name), and low-stock alerts.
- **Inventory:** stock is reserved and reduced on every order. An order is rejected if any ingredient is sold out.

## Tech
React Router 7 + Vite, Hono API routes in `apps/web/src/app/api`, Auth.js (email and password, argon2), Neon Postgres, Tailwind, Chakra UI. Mobile app: Expo (`apps/mobile`, see *Status* below).

## Setup
You need [Bun](https://bun.sh) and a PostgreSQL database (a free [Neon](https://neon.tech) project works).

```
cd apps/web
bun install --frozen-lockfile        # use Bun: plain npm picks newer versions that break the build
cp .env.example .env                 # set DATABASE_URL and AUTH_SECRET
psql "$DATABASE_URL" -f ../../db/schema.sql
bun run dev                          # http://localhost:4000
```

`db/schema.sql` creates all tables and adds sample ingredients (5 bases, 5 sauces, 5 cheeses, 8 veggies, 5 meats). It is safe to run again.

### Environment (`apps/web/.env`)
| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Neon / Postgres connection string |
| `AUTH_SECRET` | random secret for sessions (`openssl rand -base64 32`) |
| `AUTH_URL` | public URL of the app, e.g. `http://localhost:4000` |

### Making the first admin
Sign up, then open `/admin/promote` and click the button. This works **only while no admin exists**; afterwards it is refused for everyone, so users cannot promote themselves. Further admins have to be set in the database (`UPDATE auth_users SET role = 'admin' WHERE email = '...'`).

## Fixes made to the exported project
- **Privilege escalation closed.** `/api/admin/promote` used to let any signed-in user become admin.
- **Server-side pricing.** The order API used to trust the prices and total sent by the browser. It now reads prices from the database, validates the item IDs, and ignores client-sent prices.
- **Safe stock handling.** Stock is decremented in one real transaction and can never go below zero; if any ingredient is out of stock the whole order is rolled back. (The original ran its "transaction" over the HTTP driver, which cannot do dependent queries.)
- **Windows support.** The API route loader used backslash paths and could not import routes on Windows, so no `/api` route worked there. It now normalises paths.
- **Database schema** added (the export had none), with constraints on status values and non-negative stock.

## Status and known limitations
- **Payment is a demo.** Checkout sends a fake `test_<timestamp>` payment ID and the order is marked paid. No payment gateway is connected, so add one (e.g. Razorpay or Stripe) before taking real orders.
- **Low-stock alerts only log to the server console.** No email is sent.
- **Mobile app is an empty shell.** `apps/mobile` has the Expo project and auth plumbing, but its only screen renders nothing. The web app is the working product.
- **Run in dev mode.** The export only defines `dev` and `typecheck` scripts, and its production build does not work with the custom route loader, so use `bun run dev`.
- Verified: the web app starts, all pages render, API routes register and reject unauthenticated calls. The database SQL (schema, first-admin check, stock check) was tested on an in-memory Postgres. The full order flow against a real Neon database has **not** been run end to end.
