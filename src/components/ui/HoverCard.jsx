import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "./utils";

export function HoverCard(props) {
  return <HoverCardPrimitive.Root {...props} />;
}

export function HoverCardTrigger(props) {
  return <HoverCardPrimitive.Trigger {...props} />;
}

export function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}