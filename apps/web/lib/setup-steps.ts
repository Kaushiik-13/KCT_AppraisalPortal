export const SETUP_STEPS = [
  { path: '/setup/organization', label: 'Organization', hint: 'Name, type and size' },
  { path: '/setup/departments', label: 'Departments', hint: 'Optional grouping' },
  { path: '/setup/employees', label: 'Employees', hint: 'Add or import people' },
  { path: '/setup/roles', label: 'Roles', hint: 'Who reviews whom' },
  { path: '/setup/configuration', label: 'Configuration', hint: 'Time zone and year start' },
  { path: '/setup/review', label: 'Review', hint: 'Check and send invitations' },
] as const;
