import type { ReactNode } from 'react';

/** A full-width "nothing here" row for tables. */
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-muted-foreground px-4 py-8 text-center text-sm">
        {children}
      </td>
    </tr>
  );
}
