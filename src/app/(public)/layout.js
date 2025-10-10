export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Ferretería Online</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
