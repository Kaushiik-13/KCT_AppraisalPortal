# Organization UI flow (screenshots)

A picture walkthrough of the Organization UI prototype, in the order a person meets the screens. Use it to review the design without running the app. Screens, tokens and components are described in [UI prototype and design reference](UI-PROTOTYPE.md).

**Current implementation:** these are screenshots of the clickable, **nonfunctional design prototype** in `apps/web` (Issue #69). It has no backend, authentication, email, database or validation. Names, scores, review counts and invitation outcomes are **sample data**. Nothing here describes production behaviour.

**Proposed design:** the journey and screens are design proposals for stakeholder review, not agreed requirements (see [UI/UX](UI-UX.md) and the open decisions in the prototype document).

**Known limitations:** see the end of this page.

To see the screens yourself, run `npm run dev` in `apps/web` and open `http://127.0.0.1:5173`.

## Flow at a glance

```text
Sign up -> Verify email -> Setup (6 steps) -> Review and send invitations
                                                      |
                 Administrator signs in <-------------+
                 Home | People | Invitations | Settings
                                                      |
                 Invited person: Accept invitation -> Log in
```

## 1. Create the account

| Screenshot | What to look at |
|---|---|
| ![Sign up](screenshots/01-signup.png) | **Sign up.** The first screen. Full name, work email and password for the person who will administer the organization. |
| ![Verify email](screenshots/02-verify-email.png) | **Verify email.** A 6-digit code step. The prototype does not check the code: Verify and continue moves on. |

## 2. Set up the organization

The setup screens share one layout: a left stepper, and Back and Continue buttons.

| Screenshot | What to look at |
|---|---|
| ![Organization](screenshots/03-organization.png) | **Step 1, Organization.** Name, type, size, location and contact details. Works for any kind of organization, not only colleges. |
| ![Departments](screenshots/04-departments.png) | **Step 2, Departments (optional).** Add, rename, recolor, reorder. Each department gets a light accent color used across the app. |
| ![Employees](screenshots/05-employees.png) | **Step 3, Employees.** People grouped by department. Add one person, or import a CSV into a department. |
| ![Roles and reviewers](screenshots/06-roles-and-reviewers.png) | **Step 4, Roles and reviewers.** First choose who can review others, then assign a reviewer to each person. |
| ![Configuration](screenshots/07-configuration.png) | **Step 5, Configuration.** Dates, invitation emails, access and security, evidence and data. Sensible defaults are filled in. |
| ![Review](screenshots/08-review.png) | **Step 6, Review.** A summary with checks and Edit links back to each step. |
| ![Send confirmation](screenshots/09-send-confirmation.png) | **Send confirmation.** Invitations cannot be unsent, so sending asks first. |

## 3. Signing in and accepting an invitation

| Screenshot | What to look at |
|---|---|
| ![Log in](screenshots/10-login.png) | **Log in.** Work email and password, with a reset link. |
| ![Reset password](screenshots/11-forgot-password.png) | **Reset password.** Email field, then a "Check your email" state. |
| ![Accept invitation](screenshots/12-accept-invitation.png) | **Accept invitation.** What an invited person sees: who invited them, their department and job title, then a name and password. |
| ![Expired invitation](screenshots/13-invitation-expired.png) | **Expired invitation.** Tells the person to ask the administrator for a new link. |

## 4. The administrator's app

The signed-in screens share a fixed sidebar and top bar. Only the page body scrolls. The sidebar has the organization at the top, then Home, People, Invitations and Settings, a setup-progress block and the user menu.

| Screenshot | What to look at |
|---|---|
| ![Home with needs attention](screenshots/14-home-needs-attention.png) | **Needs attention.** The bell lists open items (people without a reviewer, expired invitations) with a direct action for each. |
| ![Home](screenshots/15-home.png) | **Home.** Key numbers, average score by cycle, review status and score by department. Scores and review counts are sample data until Framework Studio exists. |
| ![People](screenshots/16-people.png) | **People.** One page for people and departments. The department list on the left filters the table. The reviewer is changed in the row. |
| ![People filtered by department](screenshots/17-people-department.png) | **A department selected.** Counts update, and Add person and Import CSV apply to that department. |
| ![Import](screenshots/18-people-import.png) | **Import CSV.** Drag and drop, with the expected columns and a template. In the prototype it adds 4 sample people. |
| ![Invitations](screenshots/19-invitations.png) | **Invitations.** Status filters with counts, a status dot per person, Resend or Retry, and bulk resend. |
| ![Settings, organization profile](screenshots/20-settings-profile.png) | **Settings.** A list of sections on the left. Changes are held as a draft. |
| ![Settings, dates and locale](screenshots/21-settings-dates.png) | **Save bar.** A Save changes and Discard bar appears only when something has changed. |

## 5. Phone layout

| Screenshot | What to look at |
|---|---|
| ![Phone, organization setup](screenshots/22-phone-organization.png) | Setup on a phone: the form is one column and the stepper becomes a progress bar with the current step's name. |
| ![Phone, home](screenshots/23-phone-home.png) | Home on a phone: the sidebar becomes a top bar with four tabs. |
| ![Phone, people](screenshots/24-phone-people.png) | People on a phone: the department list sits above the table, which scrolls sideways. |

## Known limitations

- Everything is a prototype: no validation, no real email, and no saved data beyond the browser tab.
- Search, Ctrl K and the appraisal-cycle selector do nothing.
- Deactivating a person is lost on reload. The imported people are sample rows, not your file.
- These screenshots were taken at 1280 by 800 (desktop) and 390 by 844 (phone). Dark mode, keyboard use and tablet sizes were not reviewed.
