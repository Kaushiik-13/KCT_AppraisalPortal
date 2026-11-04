# AFPI — UI design system v1.0

**Status:** Agreed design target; **not yet installed or implemented**. Issue: [#43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43).

## Direction
- Modern enterprise SaaS, clean/light-first, neutral surfaces, restrained blue accents, readable information hierarchy and consistent interaction patterns.
- **shadcn/ui is the primary component foundation**, Tailwind CSS for styling, Lucide for icons, Next.js + React + TypeScript for the planned rebuild. Use component source files maintained inside the repository, not a remote runtime UI service.
- Use official, current shadcn/ui docs and a single selected primitive family (Radix or Base UI) during installation; do not mix generated component variants without a migration plan.
- Inter is the preferred font with system sans-serif fallback. Dark mode supported by design tokens but need not ship in the first implementation.
- This spec is a design decision, not evidence that Tailwind, shadcn/ui, TypeScript or the new shell are installed in the current PoC. As inspected on 2026-11-04, the repo has Next.js 16, React 19, JSX and legacy CSS imports, without `components.json` and without Tailwind/shadcn dependencies.

## Design principles
1. Clarity before decoration: clear purpose, primary action, status and next step.
2. Consistency: one shared component vocabulary; avoid ad-hoc UI styles inside modules.
3. Progressive disclosure: advanced policy controls appear when relevant.
4. Recoverability: validation, deliberate destructive actions, draft/change state, safe back navigation.
5. Explainability: visually distinguish entered, verified, calculated, predicted and recommended data.
6. Secure context: visible active organization/role; backend remains the authority for permissions and tenant separation.
7. Accessibility: aim for WCAG 2.2 AA; keyboard, focus, contrast, semantics, no color-only meaning and reduced motion.
8. Purposeful density: accessible tables/filters for expert work without overwhelming first-time users.

## Design tokens — light theme initial values
| Semantic token | Value | Usage |
|---|---|---|
| background | #F8FAFC | App canvas |
| foreground | #0F172A | Primary text |
| card / popover | #FFFFFF | Elevated content |
| primary | #2563EB | Primary CTA, selected actions |
| primary-foreground | #FFFFFF | On primary |
| primary hover | #1D4ED8 | Interactive hover |
| secondary / muted | #F1F5F9 | Neutral controls |
| secondary foreground | #334155 | Text on neutral controls |
| muted-foreground | #475569 | Descriptions |
| border / input | #CBD5E1 | Boundaries, controls |
| destructive | #B91C1C | Destructive action |
| success | #15803D | Verified success |
| warning | #B45309 | Actionable caution |
| ring | #2563EB | Focus ring |
| sidebar | #FFFFFF | Navigation surface |
| sidebar border | #E2E8F0 | Navigation separator |

Implement **semantic CSS variables** compatible with the current shadcn/ui `components.json` token system and Tailwind v4 `@theme inline` when the frontend implementation starts. Define pairs such as `--background/--foreground`, `--primary/--primary-foreground`, `--card/--card-foreground`, `--muted/--muted-foreground`, `--accent/--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, and the full sidebar token family. **Do not copy raw hex colors into module components.** Validate token pairs and contrast in both themes before release; the table above is a design starting point, not a certified accessible palette.

## Typography, spacing and surfaces
- Font: Inter; body 14–16px; supporting text >= 13px where practical; headings 28/20/16px (page/section/card), weight 600; consistent line-height and truncation behavior.
- Base spacing unit: 4px; allowed rhythm 4, 8, 12, 16, 24, 32, 48px.
- Default control height 40px; compact 36px only where justified; comfortable 44px.
- Base corner radius 10px (shadcn `--radius`), derive size variants through token scale; never hardcode unrelated radii throughout the app.
- Light borders with restrained shadows; dialogs and menus may be elevated. No unnecessary gradients or decorative colored cards.
- Responsive design starts with semantic layouts, not fixed pixel positions; avoid horizontal scroll except dense data tables/workspace canvases.

## Required shared component vocabulary
- Shell/navigation: SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, Breadcrumb, DropdownMenu, Avatar, Separator, Tabs, Tooltip.
- Actions/forms: Button, Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Calendar/DatePicker pattern, Dialog, Sheet, AlertDialog.
- Data/feedback: Card, Badge, Table, application-specific DataTable (using compatible TanStack Table version), Skeleton, Alert, Sonner/toast, Pagination.
- Specialized AFPI components: policy/workflow editor, evidence viewer, scoring review, model evaluation and recommendation explanation **owned by relevant modules** and composed using shared tokens/components.
- Each interactive component requires documented disabled, loading, focus-visible, invalid and success/empty states where relevant.

## Accessibility and UX acceptance gates
- WCAG 2.2 AA target; minimum normal-text contrast 4.5:1, non-text UI component contrast 3:1 where applicable; validate in situ.
- Visible keyboard focus, correct tab sequence, semantic headings/labels, proper modal focus management and an accessible navigation drawer.
- Error messages near fields; never rely on toast alone for critical validation.
- Provide nonvisual alternative for dragging and charts where required; avoid color-only encoding.
- Use 44px comfortable pointer surfaces where space allows; WCAG 2.2 AA minimum target size requirements and exceptions must still be checked.
- Loading, empty, unavailable, unauthorized, partial data and error states are first-class design deliverables.
- Inference/prediction UIs display provenance, timestamp/version and uncertainty where applicable; no unsupported certainty claims.
- Destructive actions explicitly show consequences and require confirmation for significant irreversible operations.

## Implementation sequencing (future code Issues)
1. Review existing imports/styles and choose a clean migration boundary; no uncontrolled global CSS replacement.
2. Confirm TypeScript, Tailwind v4 and appropriate Node/toolchain support for the current version of shadcn/ui.
3. Initialize shadcn/ui in the **existing** Next.js app, select one component primitive family, add `components.json` and semantic light/dark tokens.
4. Install minimal primitives (sidebar, button, field, dialog etc.) and build the shared application shell.
5. Write accessibility and responsive tests, snapshot/visual checks, theme contrast checks and update component documentation.
6. Implement module routes incrementally; keep old PoC pages isolated until deliberately retired.

## References
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui sidebar](https://ui.shadcn.com/docs/components/radix/sidebar)
- [shadcn/ui Field](https://ui.shadcn.com/docs/components/radix/field)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/radix/data-table)

## Open design decisions
- Exact dark-theme tokens and final contrast audit.
- Primitive family selection for generated components.
- Brand mark and icon artwork; no custom branding locked yet.
- User-role navigation visibility and organization switching behavior depend on [#44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44).
