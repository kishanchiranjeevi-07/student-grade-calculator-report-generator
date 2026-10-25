# Student Grade Calculator & Report Generator — Plan

## Implementation approach

Build a hosted, responsive academic operations dashboard on the initialized React/TypeScript/Vite/Express/tRPC/Drizzle project. The first delivered slice is a complete administrator-facing workflow with realistic fictional data, client-side persistence for demo continuity, reusable grade-calculation utilities, searchable student/result tables, marks-entry interactions, analytics, report previews, CSV/PDF-ready actions, and settings. The existing server, health endpoint, OAuth hooks, database schema, and managed deployment configuration remain intact so database-backed procedures can be connected incrementally without replacing the working hosted runtime.

The frontend uses a single application shell with route-aware views for Dashboard, Students, Subjects, Marks Entry, Results, Reports, Analytics, Settings, and User Management. Demo records are stored in localStorage so the hosted preview is interactive and survives browser refreshes; all calculations derive from the stored records rather than hardcoded display totals. The data model is intentionally shaped like the eventual database entities: students, subjects, marks, examinations, grading rules, and institution settings. The backend remains available for the next persistence slice through the existing tRPC and Drizzle starter.

## Design direction

Three candidate styles:

- **Editorial Academic Console** — 0.06: crisp institutional blue with paper-like surfaces and structured data hierarchy.
- **Quiet Luxury SaaS** — 0.03: warm neutrals, high-contrast type, and restrained status colors.
- **Civic Data Utility** — 0.08: navy navigation, mint action accents, and dense but calm operational tables.

Chosen style: **Editorial Academic Console**.

### Design movement

A modern editorial academic console: authoritative like a university registrar's office, but with the clarity and responsiveness of a contemporary SaaS product.

### Core principles

1. **Trust through hierarchy:** summary metrics, labels, and status chips make decisions legible at a glance.
2. **Calm density:** tables and charts carry operational detail without visual noise.
3. **Progressive disclosure:** everyday workflows are direct; advanced filters and settings stay available but quiet.
4. **Human signals:** use initials, concise copy, and familiar icons to keep the system approachable.

### Color philosophy

Deep ink navy anchors navigation and communicates institutional trust. An ownable mint-teal accent signals saved work, positive progress, and key actions. Pale blue-gray surfaces keep the application light and professional, while amber and coral are reserved for attention states and exceptions.

### Layout paradigm

A fixed left rail frames a wide working canvas. The content area uses an editorial two-column rhythm: a primary operational panel and a narrower context panel, rather than a repetitive dashboard-card grid. Tables stretch into the canvas, while overview modules stay compact.

### Signature elements

- A slim mint progress rule on active navigation and major result cards.
- Rounded status pills with plain-language labels such as `On track`, `Needs review`, and `Published`.
- Small uppercase section eyebrows paired with large, tightly set headings.

### Interaction philosophy

Every action should feel reversible and visible. Search updates results immediately, filters are explicit, forms show validation in place, and destructive actions use confirmation. Toasts acknowledge saves and exports without interrupting the workflow.

### Animation

Use short ease-out fades and 150–220ms slide transitions for panels, drawers, and toasts. Avoid decorative motion in dense tables. Metric values can enter with a subtle upward fade on first render; charts animate once and remain stable.

### Typography system

Use a system sans stack with `Inter`-like proportions for UI labels and `Georgia`-like editorial serif accents only in the institution wordmark and hero headings. Headings are compact and semibold; table copy is 13–14px; helper labels are 11–12px uppercase with letter spacing.

### Brand essence

**A clear, dependable workspace for turning marks into confident academic decisions.** Personality: precise, composed, supportive.

### Brand voice

Headlines are direct and useful. CTAs are action verbs, never vague placeholders.

- “Keep every result ready for review.”
- “Publish a report when the record is complete.”

### Wordmark & logo

Use a compact graduation-cap mark inside a navy square with a mint underline, paired with the `GradePilot` wordmark and the descriptor `Academic operations`.

### Signature brand color

**Registrar Mint** — `#2DD4BF`, used sparingly for active states, progress, and positive action.

## Project structure

- `client/src/pages/Home.tsx` — route-aware hosted application shell and primary product views.
- `client/src/data/demo.ts` — typed fictional students, subjects, marks, and default settings.
- `client/src/lib/grade.ts` — reusable percentage, grade, result, and summary calculations.
- `client/src/index.css` — visual system, responsive layout, table, chart, and dark-mode styling.
- `client/public/manus-routes.json` — synchronized route manifest for hosted preview and publication.
- `drizzle/schema.ts` and `server/db.ts` — existing database foundation reserved for server-backed persistence.
- `plan.md` and `TODO.md` — implementation decisions and outcome-level acceptance criteria.
