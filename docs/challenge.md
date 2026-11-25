# Courtly — challenge brief

This is a structured restatement of the Procimo Mid-Level Fullstack Software Developer challenge read on November 17, 2026. It preserves the requirements and submission constraints, rather than reproducing the page verbatim. Project-specific decisions belong in `docs/decisions.md`; API contracts and implementation tasks must distinguish requirements from additional choices.

## Context and delivery

Build a small fullstack sports facility booking application, with business rules similar to court-booking and resource-management products.

The suggested timeline is approximately five calendar days, with one to two days of actual implementation effort. The brief allows requesting more time. The personalized page displayed a submission deadline of November 22, 2026 at 12:48 in Lisbon.

Deliver one public GitHub repository with a README. Private repositories, GitLab links, and ZIP files are not accepted. Submit the repository URL and a short explanation of decisions through the challenge page, not by email. The page accepts one submission only. The decision field accepts 150–3,000 characters and asks what was chosen, rejected, and why, where AI was used, and what the candidate checked personally.

The personalized submission URL was provided in the planning chat. Do not publish its access token in the public repository. Submission is a separate user action, outside the implementation workflow.

## Product and roles

- Users browse courts, inspect availability, create bookings, and cancel their own bookings.
- Administrators create and edit courts, deactivate them, and view all bookings.
- A simple login with seeded accounts, JWT, or sessions is sufficient; an external authentication provider is unnecessary.
- Role restrictions must be enforced by the backend API, not just by hiding interface elements.

## Courts

- Each court has a name, sport type, hourly price, opening hours, and active/inactive status.
- An example opening interval is 08:00–23:00.
- Administrators can create, edit, and deactivate courts.
- Deactivating a court must preserve its booking history.

## Availability

- A user selects a court and a date to see the day's one-hour slots.
- Slots indicate whether they are available or occupied.
- Availability accounts for the court's opening hours and existing bookings.

## Bookings

- A booking lasts one or two consecutive hours.
- Conflicting bookings for the same court must be prevented, including when two users submit simultaneously.
- The README must explain the database-level mechanism that guarantees this. An interface check alone is insufficient.
- Bookings cannot be created in the past.
- Users may cancel their own bookings until two hours before their start. Later cancellation attempts must be rejected with an understandable error.
- Users can view their upcoming and past bookings.

## Administrator day view

- Administrators can inspect all bookings for a selected day across all courts.
- The view includes the day's total expected revenue.

## Required technology and startup

- Use TypeScript in strict mode throughout the application.
- Use React or Next.js for the frontend.
- Use Express or NestJS for the backend.
- A separate backend is mandatory even when choosing Next.js; implementing only Next.js route handlers is insufficient.
- Choose PostgreSQL, MySQL, or MongoDB and provide a deliberate schema/model design.
- Include seed data with at least three courts, two users, one administrator, and several bookings.
- `docker compose up` must start the complete application: frontend, backend, database, migrations, and seed. Reviewers will use this startup command; requiring additional setup commands prevents evaluation.

## Required tests

Full coverage is unnecessary. Meaningful backend tests are mandatory and must cover at least:

- Double-booking prevention.
- The cancellation window.
- Opening-hours validation.

Frontend tests are optional.

## README requirements

The README must explain:

- How to clone and start the project with `docker compose up`, including application URLs and seeded login credentials.
- Why the frontend framework, backend framework, and database were selected, with approximately two or three sentences for each and concrete trade-offs beyond familiarity alone.
- How concurrent double bookings are prevented, including the mechanism and where it is implemented.
- Specific improvements the candidate would make with additional time.

The candidate must write the README.

## AI usage and history

- AI assistance is allowed.
- The candidate must understand and defend every line and be prepared to explain decisions and change behavior live in the follow-up interview.
- Maintain a clean sequence of meaningful commits that tells the implementation story; a single large commit is insufficient.

## Optional bonus choices

A complete mandatory implementation is preferred to an incomplete implementation with extra features. If time remains, at most one bonus may be selected:

- Real-time availability updates through WebSockets or server-sent events.
- A booking waitlist that automatically promotes a waiting user after cancellation.
- A performance exercise with more than 10,000 seeded bookings and measured availability and administrator day-view query performance.

The original approved scope excluded all bonuses. On November 25, 2026, the user approved only the performance exercise on a separate branch; see `performance-plan.md`. This is a project scope decision, not a mandatory challenge requirement.

## Evaluation

Reviewers assess business-rule correctness, data modeling, API design and error handling, organization, tests, Docker startup, and the reasoning in the README. Interface polish has lower priority than correctness and clarity, but the application must be usable without reading its source.

## Details the brief does not settle

The brief does not prescribe a timezone, currency, authentication mechanism, endpoint structure, daily schedule model, or exact revenue treatment for cancellations. Record those decisions explicitly rather than treating them as stated requirements. It also does not require registration, password recovery, payments, facility management, or recurring bookings.
