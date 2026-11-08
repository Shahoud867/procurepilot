# ProcurePilot

A working, private restaurant procurement demonstration: React + TypeScript, a Hono API, SQLite locally / Cloudflare D1 when hosted, and a real mixed-integer allocation engine. No paid AI API, external supplier integration, or production subscription is required for local development.

## Run locally

Requires **Node.js 24.2+** (the local adapter uses `node:sqlite`), npm, and `tar` on Linux/macOS/WSL. The build bundles assets for offline demonstration after installation. The exact dependencies are in package-lock.json.

```sh
npm ci
npm run check
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. The local server applies new SQL migrations once, stores records in `.local/procurepilot.db`, and uses a clearly separated local demo identity. It binds to loopback by default. Never expose the local adapter as an authenticated production service: local identity headers are deliberately only for development/testing.

The hosted Worker never enables that local identity. It requires the Sites-provided authenticated user ID. Sites controls private access and sign-in. Each identity gets three independent synthetic restaurant workspaces.

## Five-minute demonstration

1. Overview: inspect stock risks and the three-day buying window.
2. Inventory: record a count or download/import the stock CSV template.
3. Forecast: inspect model selection, historical observations and forecast error.
4. Suppliers: compare approved-grade offers, whole packs, capacity and delivery.
5. Generate purchase plan. Expand each of the five agent traces.
6. Adjust quantities if desired. Revisions receive a new ID and run all checks.
7. Approve with a reason; export the synthetic purchase request.
8. Record a full simulated receipt, optionally changing the invoice-price factor.
9. Financial impact: compare recorded invoice cost against the admissible baseline.
10. Activity log: inspect the audit trail. Demo studio loads seven reproducible scenarios.

The starting synthetic basket at Margalla Table has an expected preferred-supplier comparison of PKR 127,070 versus a candidate allocation of PKR 117,560.20. These are generated demonstration values, not current market prices or customer outcomes. Different scenarios and edits change the result.

## What is implemented

- Three fictional restaurant workspaces; 12 ingredients each; 90 days of chronological stock receipts, consumption and waste, with conserved balances.
- Stock lots, expiry-aware usable quantity, count adjustments, atomic CSV preview/import, unit and capacity validation.
- Model selection among weekday average, seasonal naive and recent average using rolling-origin error over the last 14 usable observations. Stockout days are excluded. Uncertainty is illustrative, not calibrated.
- Supplier quotes, timestamps, approved grade, packs, delivery charges, capacity, reliability and minimum-order constraints.
- Mixed-integer purchasing allocation including supplier activation/delivery charges, budget and storage/cover constraints. Required quantities are rounded to the catalog's common pack size before solving. Per-supplier variable pack sizes are not exposed by this version.
- Independent plan validation; immutable input-version reference; blocked/stale plans cannot be approved.
- Five inspectable computational agents: Inventory, Demand, Supplier, Allocation, Risk & policy; an orchestrator sequences them. These are deterministic modules, not LLM personalities.
- A separate reverse second-price single-lot mechanism experiment, with private costs and truthful bids explicitly synthetic. It does not contact suppliers or assert an equilibrium comparison with first-price bidding.
- Approval/rejection, manager revisions, CSV export, full simulated receiving, invoice factor, outcome comparison and audit trail.
- Server role checks and owner role-preview downgrade. This is not a multi-user invitation interface.
- Cross-identity and cross-restaurant isolation, same-origin mutation checks, upload size limits, escaped CSV output, optimistic concurrency and transactional audit writes.
- Owner workspace export and downloadable source package.
- Responsive navigation, seven scenario controls, error states, keyboard focus trapping in dialogs and reduced-motion support.

## Architecture

`src/ui/` contains the React application and responsive CSS. `src/core/` contains domain types, deterministic seeding, forecasts, eligibility and allocation. `server/app.ts` is the shared API. `server/local.ts` provides a Node SQLite adapter; `server/worker.ts` is the hosted Worker adapter. `db/schema.ts` and `drizzle/` own the schema and migrations.

The first version stores a bounded restaurant aggregate as JSON in `workspaces`, alongside relational membership and audit tables. Every mutation uses a revision compare-and-swap and an operation ID; the audit insert is conditional on that operation in the same database batch. This is intentionally a small-workspace design. Before scaling histories, normalize inventory and purchasing records, paginate histories, and benchmark D1 row-size/CPU limits. Plan history is capped at 30 retained plans.

Only one approved, unreceived purchase may be outstanding in a restaurant workspace. This avoids duplicate commitments while inbound order reservation accounting remains out of scope.

## Database migrations

`npm run db:generate` generates a new schema-only migration. The local adapter applies pending SQL files at startup. Never edit an applied migration. Hosted deployment requires the DB D1 binding and the same migrations; Sites owns resource provisioning and applies migrations during publication.

## Backups and restoration

The UI's owner-only JSON export is useful for inspection and portability; it is not an encrypted or automatically scheduled disaster-recovery system.

For a full local backup, stop `npm run dev`, copy `.local/procurepilot.db` to controlled storage, then restart. To restore: stop the server, preserve the current database separately, remove stale `-wal`/`-shm` sidecars after confirming the server is stopped, replace the database with the saved copy, and restart. Run `node scripts/check-backup.mjs <copy-path>` before replacement to verify database integrity and record counts. Test this on a separate local checkout before relying on it. Protect and encrypt backup storage independently.

Hosted database backup scheduling, retention, point-in-time recovery and incident response must be established before real customer operation.

## Tests

`npm test` covers deterministic data, conservation, forecast leakage safeguards, whole-pack allocation, hand-calculated costs, exhaustive small-instance comparison, eligibility, minimum orders, budget infeasibility, no-saving results, mechanism arithmetic, authentication boundaries, tenant isolation, role restrictions, CSV atomicity, stale approval, revisions, export, duplicate receiving, outstanding commitments, financial reconciliation and audit retention.

`npm run check` checks TypeScript. `npm run build` compiles the actual browser client and Worker API. The API integration test exercises the complete purchasing workflow against the real SQLite adapter. It does not substitute for visual or interactive browser testing.

## Deployment and production limits

The current build is a **synthetic client demonstration and engineering foundation**, not a claim of complete pilot readiness.

- Browser UI QA was unavailable in the managed environment because its required `cua_repl.js` control tool was not provided. Responsive styles and accessibility behavior are implemented but have not received browser/assistive-technology acceptance testing.
- Hosted access uses platform sign-in. Local development identity must never be exposed publicly. Formal team invitation, account recovery and independently assigned memberships require additional work.
- No supplier messaging, orders, external procurement commitments, payments, POS integrations or scraping occur.
- Receipt handling accepts full simulated deliveries only; partial deliveries, item-level quality rejection, invoice uploads and credit-note reconciliation are not yet implemented.
- No menu/recipe or POS sales import is provided; forecasts use synthetic direct ingredient consumption.
- Delivery is one next-day purchasing window. Multi-date replenishment, supplier-specific pack conversions, calibrated uncertainty and contractual reliability models need extension.
- Stock cover uses forecast consumption and synthetic shelf-life assumptions; it is not food-safety certification.
- The MILP has a timeout and returned candidates are independently validated. The UI deliberately does not promise a certified optimality gap.
- New workspaces are seeded with synthetic data. Real-customer onboarding and lifecycle controls require an explicit production mode and further validation.
- A per-isolate rate limiter is included; a distributed/platform rate limit is required before wider access.
- Inline bundled assets require the current CSP allowance. Consider hashed/nonced scripts and styles for a hardened production pipeline.
- Audit writes are append-only through the application, not tamper-proof against database administrators.
- Local development uses existing hardware and incurs no required software/API/hosting fee. Electricity/connectivity and any commercial hosting, backups, domains or support remain separate costs. Sites account limits and future hosting terms are not guaranteed by this code.

## Pricing and ROI

The adjustable PKR 10,000 fee is the memory.md pricing hypothesis, not demonstrated willingness to pay. The dashboard does not extrapolate a single basket into monthly or annual savings. Financial impact sums recorded synthetic invoice differences against admissible reference baskets and subtracts one illustrative subscription. No waste, labor, emergency premium or lost-sales assumptions are added, avoiding unsupported double counting.

## Security notes

The hosted user header is trustworthy only behind Sites' trusted dispatch boundary. Another hosting provider must supply a verified authentication layer and strip user-supplied identity headers. Secrets and local runtime databases are ignored by Git and excluded from source downloads. No credentials are embedded in source or frontend code.
