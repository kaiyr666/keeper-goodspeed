# Keeper: asset disposal workflow for hotels

Hotels regularly retire furniture, linen, electronics and kitchen equipment. Today that is handled over WhatsApp, email and spreadsheets. Nobody has one list of what is available, approvals happen in chat threads, and finance cannot see what was recovered or what went to landfill.

Keeper replaces that with one system. Staff log items from their phone, managers approve them, every step is recorded, and the general manager (GM) sees the value recovered and the CO₂ avoided.

## What the first version had to prove

The first question is not whether the system can be built, but whether hotels will use it:

- **Upload** has to be fast enough (under two minutes) that housekeeping or F&B staff do it from their phone on the floor.
- **Approval** has to be light enough that managers do not go back to WhatsApp.
- **The dashboard** has to show the GM and finance something they would not otherwise see.

So this version covers upload, the dashboard, the asset trail and notifications. Governance features (the full approval pipeline, the cross-property admin panel, ESG reporting) come once usage is proven. Marketplace, payments and AI are out of scope.

## What is built

| Area | What it does |
| --- | --- |
| Mobile upload | Five steps: category and type, condition (A to D), location and quantity, photos, review. Photos come straight from the phone camera or gallery, up to 20 per item, HEIC accepted. They are compressed on the phone (900 px, JPEG 72%) before upload, with a progress bar. The draft is saved in the browser and offered for resume for 48 hours. |
| Approval | Department approval, then GM sign-off. A status can only change from a valid previous status. Rejecting needs a reason of at least 10 characters. Each status change and its audit record are written in one database transaction. |
| Asset trail | Every submission gets a reference (KPR-…), plus a record for each individual unit. A timeline shows every event, who did it, when and any comment. The page can be printed or saved as PDF from the browser. |
| Notifications | Emails (Resend) on submission (to the GM), on department approval (to the GM for sign-off), and on approval or rejection (to the person who submitted, with the reason). |
| GM dashboard | Tiles for live inventory, estimated recovery value, value recovered this month and CO₂ diverted. A chart by category, recent submissions and the queue of items waiting for approval. |
| Accounts | Email and password login. Two roles, department user and GM, each tied to a property and a department. |

## What is skipped, and why

| Skipped | Why |
| --- | --- |
| CSV bulk upload | The adoption risk is staff logging items one at a time on the floor. Bulk upload helps back-office clear-outs and can follow. |
| Separate department-head role | Both approval stages exist; in the demo the GM can act on both. Adding the role is a permissions change, not a new flow. |
| Full 11-stage pipeline | This version uses 7 statuses (Draft, Pending approval, Pending GM sign-off, Approved, Rejected, Listed, Completed). The later stages depend on how items leave the hotel (resale, donation, recycling), which is not decided yet. |
| Keeper admin panel, cross-property view, offer management | These prove governance, the second phase. They need real usage data first. |
| In-app messaging and WhatsApp hand-off | Email covers the moments that need action. Messaging would add a channel before we know which one people actually use. |
| Live CO₂ and weight calculation | The dashboard reads demo data. Weight-per-item and CO₂ factor tables are in `lib/constants.ts` with placeholder values, to be checked against a recognised hospitality source before anything is reported externally. |
| Excel export, CSR role, ESG reports | Second phase. |

## Tech

Next.js 14 (App Router, TypeScript), Tailwind, PostgreSQL with Prisma, NextAuth, Zod, Recharts. Photos go to Vercel Blob (local disk in development). Email through Resend. Deployed on Railway, with database migrations run on start. Built with Claude Code.

## Run locally

```bash
npm install
# set the environment variables below in .env
npx prisma migrate dev
npm run seed
npm run dev
```

Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `BLOB_READ_WRITE_TOKEN` (without it, photos are saved to `public/uploads`).

Demo logins after seeding (password `keeper123`):

- GM: `james.wilson@grandhotel.com`
- Department user: `sarah.chen@grandhotel.com`
