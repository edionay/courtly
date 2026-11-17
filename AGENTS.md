# Project guidance

- Write code, UI text, and repository documentation in English.
- Prefer self-explanatory names and small functions. Add comments only when necessary.
- Keep the implementation small and focused on the challenge's mandatory requirements. Do not add optional bonuses.
- Before making assumptions, consult `docs/challenge.md` once the challenge has been transcribed. Until then, the challenge brief is not yet available locally: ask for the brief when necessary rather than inventing requirements.
- Read `docs/decisions.md` for approved decisions and unresolved questions. Proposed decisions are not approved requirements.
- Focus on the happy path. Discuss additional edge-case behavior before implementing it.
- Keep unit and integration tests focused, meaningful, and simple to configure. Backend tests must cover concurrency prevention, cancellation timing, and opening hours.
- Never commit directly to `main`. Use a `codex/` branch and a pull request for review and merge.
- The repository currently has no initial commit. Establishing the base branch and first PR remains a planning item; do not silently bypass the PR rule.
- Keep these instructions and the planning documents current as decisions change.
- The execution plan must be self-contained: include requirements, approved decisions, API contracts, incremental deliverables, acceptance criteria, dependencies, and enough context for another chat or agent.
- Implementation is intended to be delegated to subagents using Luna. Confirm model availability before delegation; do not silently substitute another model.
- The challenge requires the candidate to write the README. Help with discussion and review, but leave README authorship to the candidate.
- Do not submit the challenge as part of implementation or planning.
