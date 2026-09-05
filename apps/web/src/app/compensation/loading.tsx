export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
      <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}
