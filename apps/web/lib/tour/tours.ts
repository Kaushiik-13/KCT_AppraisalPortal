// Guided tours. Each step points at a real control on a page, found by a CSS selector (an aria-label or a
// data-tour attribute). Steps whose control is missing (for example a phone layout, or a state not reached)
// are skipped when `optional`. Copy is one or two short sentences in the app's plain wording.

export type TourStep = {
  /** Pages this step belongs to: the path must start with one of these. */
  page: string[];
  /** Where "Go there" takes you when the tour is paused on another page. */
  href: string;
  /** The control to point at. Several selectors separated by commas: the first visible one wins. Leave out for a centred note. */
  target?: string;
  title: string;
  body: string;
  /** What to do now, shown as "Do this". */
  action?: string;
  /** Move on when this is clicked: true means the target itself, a string is another selector. */
  advanceOn?: true | string;
  /** Skip quietly when the control is not on screen. */
  optional?: boolean;
};

export type Tour = { id: string; name: string; steps: TourStep[] };

const APP = ['/home', '/people', '/invitations', '/frameworks', '/profile', '/settings'];
const FW = ['/frameworks'];
const LIB = ['/frameworks/library'];
const ED = ['/frameworks/kpis/'];
const FW_OVERVIEW = '/frameworks';

/** The main guided tour: from the sidebar to a published KPI. */
const FIRST_KPI: Tour = {
  id: 'first-kpi',
  name: 'Create your first KPI',
  steps: [
    {
      page: APP,
      href: '/home',
      target: 'nav[aria-label="Main"] a[href="/frameworks"]',
      title: 'Frameworks',
      body: 'KRAs and KPIs are built in the Studio, under Frameworks.',
      action: 'Click Frameworks.',
      advanceOn: true,
    },
    {
      page: [FW_OVERVIEW],
      href: FW_OVERVIEW,
      target: 'nav[aria-label="Frameworks sections"]',
      title: 'Two views',
      body: 'Overview shows how your KPIs are doing. KRAs and KPIs is the library where you build them.',
    },
    {
      page: [FW_OVERVIEW],
      href: FW_OVERVIEW,
      target: '[data-tour="getting-started"]',
      title: 'Getting started',
      body: 'This checklist tracks the steps to your first live KPI. Each item takes you to where you do it.',
      optional: true,
    },
    {
      page: [FW_OVERVIEW],
      href: FW_OVERVIEW,
      target: '[data-tour="use-template"]',
      title: 'No KRAs yet?',
      body: 'Load sample KRAs and KPIs to explore, or start with your own KRA.',
      action: 'Click Use a template, or New KRA.',
      advanceOn: '[data-tour="use-template"], [data-tour="new-kra-empty"]',
      optional: true,
    },
    {
      page: FW,
      href: FW_OVERVIEW,
      target: 'nav[aria-label="Frameworks sections"] a[href="/frameworks/library"]',
      title: 'The library',
      body: 'Your KRAs and their KPIs live here.',
      action: 'Click KRAs and KPIs.',
      advanceOn: true,
    },
    {
      page: LIB,
      href: '/frameworks/library',
      target: '[data-tour="kra-rail"], [aria-label="KRA"]',
      title: 'KRAs',
      body: 'A KRA groups related KPIs, like Teaching and learning. Its code starts every KPI code in it, like TL-1. Use + to add one.',
    },
    {
      page: LIB,
      href: '/frameworks/library',
      target: '[data-tour="kpi-list"]',
      title: 'KPIs',
      body: 'Each KPI shows its version and status. Draft KPIs affect nobody until they are published.',
      optional: true,
    },
    {
      page: LIB,
      href: '/frameworks/library',
      target: '[data-tour="new-kpi"]',
      title: 'New KPI',
      body: 'Create a KPI inside the selected KRA.',
      action: 'Click New KPI.',
      advanceOn: true,
    },
    {
      page: LIB,
      href: '/frameworks/library',
      target: '[data-tour="new-kpi-dialog"]',
      title: 'Name it',
      body: 'Give it a name, pick its KRA and who it is for. You can change these later from the KPI name in the editor.',
      action: 'Fill in a name, then Create and build.',
      advanceOn: '[data-tour="new-kpi-create"]',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="editor-steps"]',
      title: 'Four steps',
      body: 'Build a KPI in order: Form, Workflow, Scoring, Test. You can jump between them at any time; a tick means a step is done.',
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="form-fields"]',
      title: '1. Form',
      body: 'The fields an employee fills in. Ask for proof with a file upload field, like a certificate or a paper.',
      action: 'Add a field.',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="form-settings"]',
      title: 'Field settings',
      body: 'Name the field and pick its type. A required file field makes the KPI need evidence, which the reviewer checks.',
      action: 'Give the field a label.',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="form-view"]',
      title: 'Preview',
      body: 'Switch to Preview to see the form the way the employee will.',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="step-workflow"]',
      title: '2. Workflow',
      body: 'Next, decide what happens after someone submits.',
      action: 'Click Workflow.',
      advanceOn: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="starting-points"]',
      title: 'Pick a starting point',
      body: 'Most KPIs score straight from the form. Check evidence first reads values from an uploaded file. Different by role scores leads and team members differently.',
      action: 'Pick one.',
      advanceOn: '[data-tour="starting-points"] button',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="canvas"]',
      title: 'The workflow',
      body: 'Each step shows Ready or what it still needs. Click a step to set it up. The + on a connection adds a step: a check, a split by role, or a tool like Extract evidence.',
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="step-scoring"]',
      title: '3. Scoring',
      body: 'Then set how values turn into points.',
      action: 'Click Scoring.',
      advanceOn: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="scoring-card"]',
      title: 'Scoring rules',
      body: 'Rules can use form answers, and values read from a file earlier in the workflow. The first rule that matches wins; no match scores 0.',
      action: 'Add a rule.',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="step-test"]',
      title: '4. Test',
      body: 'Try it before it goes live.',
      action: 'Click Test.',
      advanceOn: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="test-panel"]',
      title: 'Run a test',
      body: 'Choose who is submitting, fill in the form and run it. The path lights up on the canvas, with the points each step gave.',
      action: 'Run a test.',
      optional: true,
    },
    {
      page: ED,
      href: '/frameworks/library',
      target: '[data-tour="publish"]',
      title: 'Publish',
      body: 'Publishing lists anything left to fix, each with a Fix link. Once live, edits become the next version and the live one stays in use until you publish again.',
    },
    {
      page: [...APP, ...ED],
      href: FW_OVERVIEW,
      title: 'You are set',
      body: 'That is the whole journey. Use the ? button on any page to tour it again, or Get help in your menu.',
    },
  ],
};

/** Short tours of each page, from the ? button. */
const PAGE_TOURS: Tour[] = [
  {
    id: 'page-home',
    name: 'Home',
    steps: [
      { page: ['/home'], href: '/home', target: 'nav[aria-label="Main"]', title: 'Navigation', body: 'Day-to-day pages at the top. Frameworks, Prediction and Recommendation sit under Studio.' },
      { page: ['/home'], href: '/home', target: 'section[aria-label="Key numbers"]', title: 'Key numbers', body: 'Click a number to chart it over past cycles.' },
      { page: ['/home'], href: '/home', target: 'section[aria-label^="Department"], section[aria-label^="Review"]', title: 'Breakdowns', body: 'Tabs slice the same question different ways, like by department.', optional: true },
      { page: ['/home'], href: '/home', target: 'input[aria-label="Search"]', title: 'Search', body: 'Find people and invitations. Press Ctrl K from anywhere.', optional: true },
      { page: ['/home'], href: '/home', target: '[aria-label="Appraisal cycle"]', title: 'Cycle', body: 'Pick which appraisal cycle you are looking at.' },
      { page: ['/home'], href: '/home', target: '[aria-label^="Notifications"]', title: 'Needs attention', body: 'Setup steps and other things that need you.' },
      { page: ['/home'], href: '/home', target: '[data-tour="user-menu"], nav[aria-label="Main"] button[aria-haspopup="menu"]', title: 'Your menu', body: 'Your profile, organization settings, shortcuts and Get help, which starts these tours.' },
    ],
  },
  {
    id: 'page-people',
    name: 'People',
    steps: [
      { page: ['/people'], href: '/people', target: 'aside[aria-label="Departments"]', title: 'Departments', body: 'Pick a department to see its people. + adds one.' },
      { page: ['/people'], href: '/people', target: '[data-tour="people-actions"]', title: 'Add people', body: 'Add one person, or import many from a spreadsheet.', optional: true },
      { page: ['/people'], href: '/people', target: '[data-tour="people-list"]', title: 'People', body: 'Each person has a role and a reviewer. Use the ⋯ menu on a row to edit them.', optional: true },
    ],
  },
  {
    id: 'page-invitations',
    name: 'Invitations',
    steps: [
      { page: ['/invitations'], href: '/invitations', target: '[data-tour="invitations-list"]', title: 'Invitations', body: 'See who has joined. Resend links that were not used or did not arrive, one at a time or several at once.' },
    ],
  },
  {
    id: 'page-frameworks',
    name: 'Frameworks overview',
    steps: [
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: 'nav[aria-label="Frameworks sections"]', title: 'Overview and library', body: 'Overview shows how KPIs are doing. KRAs and KPIs is where you build them.' },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: '[data-tour="getting-started"]', title: 'Getting started', body: 'Steps to your first live KPI.', optional: true },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: '[data-tour="use-template"]', title: 'Start here', body: 'Load sample KRAs and KPIs, or create your own KRA.', optional: true },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: 'div[role="group"][aria-label="Filter analytics"]', title: 'Filters', body: 'Narrow everything below to one KRA or department.', optional: true },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: 'section[aria-label="Key numbers"]', title: 'Key numbers', body: 'The numbers in the lower row switch the chart. One submission is one employee’s answer to one KPI.', optional: true },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: 'section[aria-label^="By KRA"]', title: 'Submissions', body: 'Where submissions come from, by KRA, KPI or department.', optional: true },
      { page: [FW_OVERVIEW], href: FW_OVERVIEW, target: 'section[aria-label="KPIs by KRA"]', title: 'KPIs by KRA', body: 'Open a KRA to see its KPIs. Click a KPI to edit it.', optional: true },
    ],
  },
  {
    id: 'page-library',
    name: 'KRAs and KPIs',
    steps: [
      { page: LIB, href: '/frameworks/library', target: '[data-tour="kra-rail"], [aria-label="KRA"]', title: 'KRAs', body: 'Pick a KRA to see its KPIs. + adds a KRA; its ⋯ menu edits or archives it.' },
      { page: LIB, href: '/frameworks/library', target: '[data-tour="new-kpi"]', title: 'New KPI', body: 'Create a KPI in the selected KRA. You then build its form, workflow and scoring.', optional: true },
      { page: LIB, href: '/frameworks/library', target: '[data-tour="kpi-list"]', title: 'KPIs', body: 'Click a KPI to open it. The ⋯ menu duplicates, shows versions or archives it.', optional: true },
    ],
  },
  {
    id: 'editor-form',
    name: 'Form',
    steps: [
      { page: ED, href: '/frameworks/library', target: '[data-tour="editor-steps"]', title: 'Four steps', body: 'Build a KPI in order: Form, Workflow, Scoring, Test. Jump between them at any time; a tick means a step is done.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="form-fields"]', title: 'Fields', body: 'Each row is one thing the employee fills in. Click a row to set it up; the arrows reorder it.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="form-add"]', title: 'Add a field', body: 'A number, a choice, yes or no, text, a date, or a file upload for proof.', optional: true },
      { page: ED, href: '/frameworks/library', target: '[data-tour="form-settings"]', title: 'Field settings', body: 'Label, type and help text. A file field also sets the allowed file types. Making it required makes the KPI need evidence, which the reviewer checks before releasing a mark.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="form-view"]', title: 'Preview', body: 'See the form the way the employee will.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="kpi-details"]', title: 'Details', body: 'Click the name to change it, its code, KRA, description or who it applies to.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="form-next"]', title: 'Next: Workflow', body: 'Then decide what happens after someone submits.' },
    ],
  },
  {
    id: 'editor-workflow',
    name: 'Workflow',
    steps: [
      { page: ED, href: '/frameworks/library', target: '[data-tour="starting-points"]', title: 'Starting point', body: 'Most KPIs score straight from the form. Check evidence first reads values from an uploaded file. Different by role scores leads and team members differently.', optional: true },
      { page: ED, href: '/frameworks/library', target: '[data-tour="canvas"]', title: 'The workflow', body: 'What happens after someone submits, top to bottom. Each step shows Ready or what it still needs.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="canvas"]', title: 'Add and set up steps', body: 'Click a step to set it up in the panel on the right. The + on a connection adds a step: a check, a split by role, or a tool like Extract evidence.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="next-scoring"]', title: 'Next: Scoring', body: 'Then set how values turn into points.', optional: true },
    ],
  },
  {
    id: 'editor-scoring',
    name: 'Scoring',
    steps: [
      { page: ED, href: '/frameworks/library', target: '[data-tour="scoring-card"]', title: 'Scoring rules', body: 'Every Score step in the workflow, with the path it is on. Rules can use form answers and values read from a file earlier on that path.', optional: true },
      { page: ED, href: '/frameworks/library', target: '[data-tour="scoring-card"]', title: 'How rules work', body: 'The first rule that matches gives its points. No match scores 0.', optional: true },
      { page: ED, href: '/frameworks/library', target: '[data-tour="step-test"]', title: 'Next: Test', body: 'Try it before it goes live.' },
    ],
  },
  {
    id: 'editor-test',
    name: 'Test',
    steps: [
      { page: ED, href: '/frameworks/library', target: '[data-tour="test-panel"]', title: 'Run a test', body: 'Choose who is submitting, fill in the form and run it. Nothing is saved.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="canvas"]', title: 'The path', body: 'After a run, the steps it went through turn dark, with the points each one gave.' },
      { page: ED, href: '/frameworks/library', target: '[data-tour="publish"]', title: 'Publish', body: 'Checks what is left, each with a Fix link, then makes it live. Later edits become the next version.' },
    ],
  },
  {
    id: 'page-profile',
    name: 'Your profile',
    steps: [
      { page: ['/profile'], href: '/profile', target: 'nav[aria-label="Profile sections"]', title: 'Sections', body: 'About you, sign-in and security, preferences and notifications. Only you see this page.' },
      { page: ['/profile'], href: '/profile', target: '[data-tour="page-body"]', title: 'Changes', body: 'Edit a section, then save or discard from the bar that appears.', optional: true },
    ],
  },
  {
    id: 'page-settings',
    name: 'Organization settings',
    steps: [
      { page: ['/settings'], href: '/settings', target: 'nav[aria-label="Settings sections"]', title: 'Sections', body: 'Organization-wide settings, like working days, email sender and allowed file types.' },
      { page: ['/settings'], href: '/settings', target: '[data-tour="page-body"]', title: 'Saving', body: 'Changes apply to everyone once you save.', optional: true },
    ],
  },
];

export const TOURS: Tour[] = [FIRST_KPI, ...PAGE_TOURS];
export const tourById = (id: string) => TOURS.find((t) => t.id === id);

/** The page tour for a path, for the ? button. */
export function pageTourFor(pathname: string): Tour | undefined {
  if (pathname.startsWith('/frameworks/kpis/')) return tourById('editor-form');
  if (pathname.startsWith('/frameworks/library')) return tourById('page-library');
  if (pathname.startsWith('/frameworks')) return tourById('page-frameworks');
  const name = pathname.split('/')[1];
  return tourById(`page-${name}`);
}

/** The guided tour already covers these, so they do not start on their own after it. */
export const COVERED_BY: Record<string, string[]> = {
  'first-kpi': ['page-frameworks', 'page-library', 'editor-form', 'editor-workflow', 'editor-scoring', 'editor-test'],
};

export const onPage = (step: TourStep, pathname: string) => step.page.some((p) => (p === FW_OVERVIEW ? pathname === p : pathname.startsWith(p)));
