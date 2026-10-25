# Student Grade Calculator & Report Generator — TODO

## 1. Hosted application shell and visual system
- [x] Deliver a responsive hosted web application rather than a static mockup or localhost-only page.
- [x] Use a professional academic dashboard with sidebar navigation, responsive layouts, light/dark mode, statistic cards, searchable tables, loading/error-ready surfaces, toast feedback, and accessible buttons and forms.
- [x] Keep the route manifest synchronized for dashboard, management, result, report, analytics, settings, and user-management views.

## 2. Student and subject management
- [x] Provide at least 10 fictional students with name, roll number, register number, department, course, semester, academic year, and email fields.
- [x] Provide searchable student records with department/semester filters, sort controls, profile details, add-student flow, and delete confirmation.
- [x] Provide subject records with code, name, department, semester, maximum marks, minimum passing marks, and credits.

## 3. Marks and grade calculation
- [x] Provide marks-entry workflow with examination and subject selectors, editable student marks, absence handling, numeric boundaries, save feedback, and CSV-ready export action.
- [x] Calculate percentage as marks obtained divided by maximum marks multiplied by 100.
- [x] Apply the default O/A+/A/B+/B/C/U grading scale, minimum passing marks, absent display, required-subject failure, overall percentage, and overall result rules.
- [x] Keep percentage distinct from CGPA and expose grading rules in the settings view.

## 4. Results, reports, and analytics
- [x] Provide searchable/filterable results with individual report preview, pass/fail status, subject breakdown, and report download/print actions.
- [x] Provide report-generation surfaces for individual, class, department, semester, subject, and complete grade-sheet exports.
- [x] Provide dashboard and analytics views for grade distribution, subject averages, pass/fail mix, class average, highest/lowest performers, and students needing support.

## 5. Settings and roles
- [x] Provide institution settings for name, academic year, grading scale, passing marks, examination types, assessment weights, and report appearance.
- [x] Provide a user-management view with Administrator, Teacher, and Student role summaries and access descriptions.
- [ ] Connect the existing OAuth and Drizzle database foundation to server-backed student, subject, marks, and settings procedures.

## 6. Validation and delivery
- [x] Keep student, mark, filter, report, and settings changes persistent in browser storage for hosted demo continuity.
- [x] Add reusable grade calculation code and run TypeScript checks, tests, and production build before delivery.
- [ ] Add production database migrations, seed execution, and publish the accepted checkpoint to a public deployment target after hosted verification.
