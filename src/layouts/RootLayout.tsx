import { Link, Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <Link to="/" className="font-heading text-lg font-semibold">
            Tall Grass
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
