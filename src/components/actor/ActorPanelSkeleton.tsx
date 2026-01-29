import { cn } from "@/lib/utils";

const shimmer = "bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer";

export function ActorPanelSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-4">
        <div className={cn("w-24 h-36 rounded-xl", shimmer)} />
        <div className="flex-1 space-y-2">
          <div className={cn("h-6 w-2/3 rounded-md", shimmer)} />
          <div className={cn("h-4 w-1/2 rounded-md", shimmer)} />
          <div className={cn("h-3 w-1/3 rounded-md", shimmer)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("h-20 rounded-xl", shimmer)} />
        ))}
      </div>

      <div className="space-y-2">
        <div className={cn("h-4 w-32 rounded-md", shimmer)} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("h-3 w-full rounded-md", shimmer)} />
        ))}
      </div>

      <div className="space-y-2">
        <div className={cn("h-4 w-40 rounded-md", shimmer)} />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn("aspect-[2/3] rounded-lg", shimmer)} />
          ))}
        </div>
      </div>
    </div>
  );
}
