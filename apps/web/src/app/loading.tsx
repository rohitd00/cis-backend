export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
