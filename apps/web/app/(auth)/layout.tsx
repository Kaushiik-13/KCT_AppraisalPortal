import { Brand } from '@/components/brand';

const ROWS = [
  { n: 'Meera Nair', d: 'Computer Science', s: 'Joined', c: 'bg-success' },
  { n: 'Arun Prakash', d: 'Computer Science', s: 'Invited', c: 'bg-info' },
  { n: 'Divya Menon', d: 'Electronics', s: 'Joined', c: 'bg-success' },
  { n: 'Karthik S', d: 'Mechanical', s: 'Invite expired', c: 'bg-warning' },
  { n: 'Lakshmi Rao', d: 'Mechanical', s: 'Joined', c: 'bg-success' },
];

function Preview() {
  return (
    <div aria-hidden className="absolute top-[52%] left-10 w-[620px] overflow-hidden rounded-md border border-border bg-card text-card-foreground text-xs shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-medium">Employees</span>
        <span className="rounded-[4px] bg-primary px-2 py-1 font-medium text-primary-foreground">Add employee</span>
      </div>
      <div className="grid grid-cols-3 gap-px border-b border-border bg-border text-muted-foreground">
        {[['Employees', '248'], ['Invited', '212'], ['Joined', '180']].map(([k, v]) => (
          <div key={k} className="bg-card px-4 py-2.5">
            {k}
            <div className="mt-0.5 text-base font-semibold text-foreground">{v}</div>
          </div>
        ))}
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Department</th>
            <th className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.n} className="border-t border-border">
              <td className="px-4 py-2.5">{r.n}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{r.d}</td>
              <td className="px-4 py-2.5">
                <span className={`mr-2 inline-block size-1.5 rounded-full ${r.c}`} />
                {r.s}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <aside
        className="relative hidden overflow-hidden bg-[color-mix(in_oklab,var(--foreground)_4%,var(--background))] p-10 text-foreground lg:block"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
          <span className="grid size-10 place-items-center rounded-md bg-foreground text-lg text-background">A</span>
          AFPI
        </div>
        <div className="mt-16 grid max-w-md gap-3">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight">
            Appraisals and performance, in one place.
          </h2>
          <p className="text-muted-foreground text-sm">
            Set up your organization, run appraisal cycles with your KPIs, and see performance across your people.
          </p>
        </div>
        <Preview />
      </aside>
      <main className="flex flex-col px-6 py-8">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="grid flex-1 place-items-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
