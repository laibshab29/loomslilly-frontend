import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

export function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  );
}

export function CommandDialog({
  title = "Command Palette",
  description = "Search...",
  children,
  ...props
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogContent className="overflow-hidden p-0">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({ className, ...props }) {
  return (
    <div className="flex items-center gap-2 border-b px-3">
      <SearchIcon className="h-4 w-4 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-10 w-full bg-transparent text-sm outline-none",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List
      className={cn(
        "max-h-[300px] overflow-y-auto",
        className
      )}
      {...props}
    />
  );
}

export function CommandEmpty(props) {
  return (
    <CommandPrimitive.Empty
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

export function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      className={cn("p-1 text-sm", className)}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-default data-[selected=true]:bg-accent",
        className
      )}
      {...props}
    />
  );
}

export function CommandSeparator({ className, ...props }) {
  return (
    <CommandPrimitive.Separator
      className={cn("h-px bg-border my-1", className)}
      {...props}
    />
  );
}

export function CommandShortcut({ className, ...props }) {
  return (
    <span
      className={cn("ml-auto text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}