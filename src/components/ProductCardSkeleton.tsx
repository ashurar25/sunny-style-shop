import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => (
  <div className="glass rounded-[1.5rem] overflow-hidden shadow-card">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2 pt-1">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  </div>
);

export default ProductCardSkeleton;
