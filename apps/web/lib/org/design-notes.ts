// PROTOTYPE ONLY. Reviewer notes for each screen: what the screen implies for
// data, rules and operations, and what is still undecided. These feed the
// later data/API needs list. They are proposals, not approved contracts.

export type DesignNote = {
  title: string;
  purpose: string;
  data: string[];
  rules: string[];
  operations: string[];
  open: string[];
};

export const DESIGN_NOTES: Record<string, DesignNote> = {
  home: {
    title: 'Setup home',
    purpose: 'Shows setup progress, lets the administrator resume, and after setup shows invitation status and entry points to other modules.',
    data: ['Setup progress per step', 'Institution name and role context', 'Invitation status per person', 'Module entry points (links only)'],
    rules: [
      'Entry points to Framework Studio, Prediction and Recommendation stay unavailable until setup is confirmed.',
      'The page shows only what the signed-in administrator is allowed to see; a missing page must not reveal that it exists.',
    ],
    operations: ['Get setup state', 'List invitations with status', 'Resend or retry an invitation'],
    open: ['What counts as "setup complete" for other modules to start.'],
  },
  profile: {
    title: 'Institution profile',
    purpose: 'Establishes the single institution context for the first release.',
    data: ['Institution name', 'Institution type', 'Official contact email', 'Country', 'Time zone'],
    rules: [
      'All five fields are required.',
      'Contact email must be a valid address.',
      'First release supports exactly one institution; a duplicate institution is rejected.',
    ],
    operations: ['Create or update the institution profile (draft until confirmed)', 'Detect an existing institution'],
    open: ['How a duplicate institution is detected.', 'Whether the list of types and countries is fixed or configurable.'],
  },
  account: {
    title: 'Administrator account',
    purpose: 'Creates and verifies the first administrator as a named, traceable person.',
    data: ['Full name', 'Personal work email', 'Verification state'],
    rules: [
      'Use a personal work email. A shared mailbox is discouraged, and AFPI never asks for or stores a shared email password.',
      'The email must be verified before setup can continue.',
      'The first administrator is the account owner for audit purposes.',
    ],
    operations: ['Create the administrator account', 'Send a verification code', 'Verify the code', 'Resend the code'],
    open: [
      'Sign-in method: password, single sign-on, or both. Not shown on this screen.',
      'Verification method and code lifetime.',
      'Who is eligible to become the first administrator.',
    ],
  },
  structure: {
    title: 'Organization structure',
    purpose: 'Optional departments, schools or other units used to group people and assignments.',
    data: ['Unit name', 'Unit kind'],
    rules: ['Skippable and can be completed later.', 'Unit names are unique within the institution.'],
    operations: ['Add a unit', 'Remove a unit', 'Skip this step'],
    open: ['Whether units can be nested.', 'What happens to people if a unit is removed.', 'Whether units affect supervisor scope.'],
  },
  people: {
    title: 'Employees',
    purpose: 'Stages the people to invite, one by one or by roster import. Invitations are sent only after the final confirmation.',
    data: ['Name', 'Work email', 'Unit (optional)', 'Roster file rows with line numbers and errors', 'Invitation status'],
    rules: [
      'Email must be valid and unique across the institution.',
      'A roster is checked row by row: valid rows are kept, invalid rows are listed with the reason and can be fixed without losing the rest.',
      'If units are defined, a unit named in the roster must match one of them (this catches typos). If no units are defined, the unit column is ignored so skipping the structure step never blocks an import.',
      'Nothing is invited until the administrator confirms setup.',
    ],
    operations: ['Add an employee (draft)', 'Check a roster file', 'Import the valid rows', 'Remove a draft employee'],
    open: ['Roster file format and size limit.', 'Whether employees can be invited before roles are assigned.', 'Invitation expiry period.'],
  },
  roles: {
    title: 'Roles and supervisor assignment',
    purpose: 'Decides who is faculty and who is a supervisor, and which supervisor reviews each faculty member.',
    data: ['Faculty and supervisor responsibility per person', 'Supervisor for each faculty member'],
    rules: [
      'One person can hold both responsibilities.',
      'Every faculty member needs exactly one supervisor for the first release.',
      'A person cannot be their own supervisor.',
      'Removing the supervisor responsibility clears the faculty assigned to that person, and the screen says so.',
      'Role changes made during setup are reflected in the summary before confirmation.',
    ],
    operations: ['Set responsibilities for a person', 'Assign a supervisor to a faculty member', 'Validate the assignment set'],
    open: [
      'Whether a faculty member can have more than one supervisor or one per appraisal period.',
      'Whether a supervisor must be in the same unit.',
      'Delegation and conflict-of-interest exceptions.',
    ],
  },
  review: {
    title: 'Review and finish',
    purpose: 'Final check before the consequential action of confirming setup and sending invitations.',
    data: ['Summary of every previous step', 'List of blocking problems', 'Audit entry preview'],
    rules: [
      'Confirmation is blocked while any problem remains.',
      'Confirming is a consequential, audited action and needs an explicit confirmation step.',
      'Submitting twice must not send invitations twice.',
    ],
    operations: ['Validate the whole setup', 'Confirm setup and send invitations', 'Record an audit event'],
    open: ['What the audit event contains and who can read it.', 'Whether setup can be reopened and edited after confirmation.'],
  },
};
