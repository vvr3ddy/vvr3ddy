export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
        <h1 className="font-sans text-4xl font-bold tracking-tight mb-4 dark:text-white opacity-90 drop-shadow-sm">My Digital Garden</h1>
        <p className="text-gray-600 dark:text-gray-300 font-serif italic text-lg">Explore the web of thoughts.</p>
      </div>
    </main>
  );
}