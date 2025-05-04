export default function NotFound() {
  return (
    <main className="py-14 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-[var(--color-accent)] mb-2">
        ops...
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        A página que você procura não existe ou foi movida.
      </p>
    </main>
  );
}
