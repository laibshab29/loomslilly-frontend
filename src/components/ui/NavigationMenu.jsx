import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "./utils";

export function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  );
}

export function NavigationMenuItem({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      {...props}
    />
  );
}

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
);

export function NavigationMenuTrigger({ className, children, ...props }) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="ml-1 size-3 transition group-data-[state=open]:rotate-180" />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "top-0 left-0 w-full p-2 md:absolute md:w-auto",
        className
      )}
      {...props}
    />
  );
}

export function NavigationMenuViewport({ className, ...props }) {
  return (
    <div className="absolute top-full left-0 z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        className={cn(
          "bg-popover text-popover-foreground mt-1.5 rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function NavigationMenuLink({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex flex-col gap-1 rounded-sm p-2 text-sm outline-none",
        className
      )}
      {...props}
    />
  );
}

export function NavigationMenuIndicator({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Indicator
      className={cn(
        "top-full flex h-1.5 items-end justify-center",
        className
      )}
      {...props}
    >
      <div className="bg-border h-2 w-2 rotate-45 rounded-tl-sm" />
    </NavigationMenuPrimitive.Indicator>
  );
}