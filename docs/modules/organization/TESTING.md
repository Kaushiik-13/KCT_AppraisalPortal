# Organization — Module testing

## Status

**Current implementation:** the Organization module has no production code. Only a nonfunctional UI design prototype exists (see [UI prototype and design reference](UI-PROTOTYPE.md)). There are **no automated tests committed** for it. The results below come from a one-off manual-style run and are recorded so reviewers know what was and was not checked. They are not evidence of production readiness.

**Proposed design:** when the real module exists, test strategy follows the shared [testing standards](../../development/TESTING-STANDARDS.md): change-aware tests, a production build, and full integration verification before merge.

## Prototype verification run (2026-11-23)

**Scope:** the onboarding prototype in `apps/web` at commit time of this document, against a local development server.

**Method:** a throwaway script drove Microsoft Edge (headless) over the Chrome DevTools Protocol using real mouse clicks, keyboard input and text entry, then read the page and the prototype's `sessionStorage` data to check the outcome. The script is not part of the repository.

**Result:** 144 of 144 checks passed after the fixes below. The run also asserted that no console errors or uncaught exceptions occurred.

| Area | What was exercised |
|---|---|
| Sign up | Typing name, email and password; show and hide password; submit goes to verification |
| Verify email | Six boxes fill and auto-advance; backspace; email shown; resend countdown; continue |
| Organization | Typing every field, choosing type, size and country; live preview; values saved; Back and Continue keep values |
| Departments | Add with code and color; quick add; inline rename; keyboard reorder; delete; color applied to the badge |
| Employees | Add-employee popup with every field; per-department import popup; imported people land in the chosen department; move between departments; remove; search and clear |
| Roles | Two-step flow; step 2 locks with no reviewer and unlocks again; reviewer switches; filter; select all; bulk assign; a person is never their own reviewer; selection bar is light |
| Configuration | Every setting changed and checked in the saved data (time zone, year start, date format, week start, working days, language, invitation expiry, sender, reply-to, reminders, sign-in, allowed domains, session timeout, two-step, file types, file size, retention) |
| Review | Summary shows the entered data; checks reflect the data; Edit link navigates; confirmation can be cancelled; sending shows all people as Invited with the chosen expiry; the sent state survives a reload; "Start the demo over" resets the data |
| Layout | At a 390 px phone width no element extends beyond the screen on any of the eight screens (on a phone the setup stepper is a progress bar with the step name) |
| Dark tokens | Adding the `dark` class applies the dark page color and the Employees screen renders legibly |

**Defects found and fixed during the run**

- On a phone-width screen the setup layout was wider than the screen, so the right side of the content was cut off. Fixed in the setup layout (grid columns and minimum widths).
- `apps/web/lib/utils.ts` re-exported `cn` from an unrelated npm package. Replaced with the standard `clsx` and `tailwind-merge` helper.

## Signed-in screens (checked by hand, not part of the 144-check run)

After the run above, these screens were added: log in, forgot password, accept invitation (and expired), the signed-in shell (sidebar, top bar, bell, setup progress), home, invitations, people (with departments, reviewer picker and CSV import) and settings. They were checked by hand in the browser only: type check, screen renders, and spot checks (resend an invitation, select rows, edit a person, deactivate a person, open the bell, filter by department and "No reviewer", import into a department, open Settings sections and the Save bar). The shared components were checked by confirming each page still renders its tabs, rows, chips and tiles. They have **no scripted end-to-end coverage**, and dark mode, keyboard-only use and phone layouts were not reviewed for them.

**Not covered**

- Screen-reader behavior, a full keyboard-only pass of every flow, and a formal accessibility review (WCAG 2.2 AA).
- Browsers other than Edge, touch input, and real devices.
- A visual review of every screen in dark mode (dark tokens exist; there is no theme toggle yet).
- Drag and drop of a real file, and drag reordering with a mouse (only keyboard reorder was exercised).
- Any behavior that needs a backend: real email, verification codes, authentication, persistence, duplicate detection, authorization. None exist.
- Required states listed in [UI/UX](UI-UX.md) that the prototype does not build (see the deviations list in [UI prototype and design reference](UI-PROTOTYPE.md)).

## Known limitations

- Results depend on a local, unpublished script and a single browser. They should be treated as a smoke test of the prototype only.
- Converting this run into committed automated tests needs a decision on tooling and a separate issue.
