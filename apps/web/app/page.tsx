import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto my-[12vh] max-w-2xl rounded-xl border bg-white p-8">
      <h1 className="text-2xl font-semibold">AFPI application foundation</h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        Product workflows are being rebuilt from the approved documentation. This page is a temporary application
        shell, not a finished interface.
      </p>
      <p className="mt-4">
        <Link href="/organization" className="underline underline-offset-4">
          Organization setup (design prototype, not functional)
        </Link>
      </p>
    </main>
  );
}
