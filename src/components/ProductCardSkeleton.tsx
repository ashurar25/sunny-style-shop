import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="glass rounded-2xl overflow-hidden shadow-card">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3.5 w-full" />
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  </div>
);

export default ProductCardSkeleton;
