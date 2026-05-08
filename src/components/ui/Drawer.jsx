import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "./utils";

export function Drawer(props) {
  return <DrawerPrimitive.Root {...props} />;
}

export function DrawerTrigger(props) {
  return <DrawerPrimitive.Trigger {...props} />;
}

export function DrawerPortal(props) {
  return <DrawerPrimitive.Portal {...props} />;
}

export function DrawerClose(props) {
  return <DrawerPrimitive.Close {...props} />;
}

export function DrawerOverlay({ className, ...props }) {
  return (
    <DrawerPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      {...props}
    />
  );
}

export function DrawerContent({ className, children, ...props }) {
  return (
    <DrawerPortal>
      <DrawerOverlay />

      <DrawerPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-background",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 sm:max-w-sm data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 sm:max-w-sm data-[vaul-drawer-direction=left]:border-r",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export function DrawerHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

export function DrawerFooter({ className, ...props }) {
  return (
    <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  );
}

export function DrawerTitle({ className, ...props }) {
  return (
    <DrawerPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function DrawerDescription({ className, ...props }) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}