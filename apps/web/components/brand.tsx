import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
      <span className="bg-foreground text-background grid size-6 place-items-center rounded-[4px] text-xs">A</span>
      AFPI
    </Link>
  );
}
