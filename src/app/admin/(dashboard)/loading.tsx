import { SkeletonLine, SkeletonList } from "@/components/app/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonLine className="h-5 w-72" />
      <div className="mt-6 grid gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonLine key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="mt-6">
        <SkeletonList rows={4} />
      </div>
    </div>
  );
}
