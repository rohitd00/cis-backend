export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}
