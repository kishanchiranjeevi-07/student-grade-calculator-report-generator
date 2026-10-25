# Student Grade Calculator & Report Generator

A responsive academic operations dashboard for managing students, subjects, marks, results, analytics, and report workflows. The project is designed as a college mini-project, an academic demonstration, and a professional full-stack portfolio piece.

## Live demo

**Hosted application:** https://studentgrade-cy4ukygt.manus.space

## What it includes

- Academic dashboard with class average, pass percentage, highest percentage, grade distribution, and subject performance.
- Student directory with search, department filters, CSV export, profile creation, result status, and report drawer.
- Subject management with credits, maximum marks, passing marks, department, and semester context.
- Marks-entry workflow with examination and subject selection, validation-friendly score inputs, absence support, grade calculation, and CSV export.
- Results page with sortable performance context, pass/fail status, searchable records, and individual report previews.
- Report center for individual report cards, class grade sheets, subject performance, department reports, semester summaries, and print workflows.
- Analytics workspace for cohort health, subject averages, grade distribution, and students needing academic support.
- Institution settings for report identity, academic year, grading scale, and report footer.
- Role-aware user-management view for Administrator, Teacher, and Student access models.
- Responsive light/dark interface with a professional navy, pale blue, and Registrar Mint visual system.

## Technology

React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Express, tRPC, Drizzle ORM, MySQL-compatible managed database support, Vitest, and hosted deployment through the Manus Webdev platform.

## Grading logic

The application calculates percentage as:

```text
Percentage = (Marks Obtained / Maximum Marks) × 100
```

The default grading scale is O (90–100), A+ (80–89.99), A (70–79.99), B+ (60–69.99), B (50–59.99), C (40–49.99), and U (below 40). Subject passing marks are applied independently, and an overall result is marked FAIL when a required subject is failed. Absent examinations are represented as ABS rather than a numeric grade.

## Run locally

```bash
pnpm install
pnpm dev
```

The application runs on port 3000 by default. For validation:

```bash
pnpm check
pnpm test
pnpm build
```

The hosted demo stores its interactive demonstration records in browser storage so changes survive refreshes in the same browser. The repository also contains the server, OAuth, Drizzle, and managed database foundation for connecting institution-wide persistence and production role enforcement.

## Project structure

- `client/src/pages/Home.tsx` — dashboard shell and product workflows.
- `client/src/data/demo.ts` — fictional student, subject, marks, and institution data.
- `client/src/lib/grade.ts` — reusable grading and percentage utilities.
- `client/src/index.css` — responsive academic console design system.
- `server/` — Express, tRPC, OAuth, and database foundation.
- `drizzle/` — database schema and migrations.
- `plan.md` — implementation and design plan.
- `TODO.md` — outcome-level delivery checklist.

## Safety

Use fictional records for demonstrations. Never commit real student information, credentials, service-role keys, or environment secrets.
