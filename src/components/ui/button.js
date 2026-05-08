export function buttonVariants({ variant } = {}) {
  let base = "px-4 py-2 rounded-md text-sm font-medium";

  if (variant === "outline") {
    return base + " border border-gray-300 bg-white";
  }

  return base + " bg-black text-white";
}