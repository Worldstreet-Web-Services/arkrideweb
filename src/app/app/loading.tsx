import { SkeletonLine, SkeletonList } from "@/components/app/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonLine className="h-8 w-40" />
      <SkeletonLine className="mt-2 h-4 w-56" />
      <div className="mt-6">
        <SkeletonList />
      </div>
    </div>
  );
}
