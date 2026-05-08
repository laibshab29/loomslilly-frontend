import { cn } from "./utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}