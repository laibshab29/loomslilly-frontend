import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "./utils";

export function ContextMenu(props) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export function ContextMenuTrigger(props) {
  return <ContextMenuPrimitive.Trigger {...props} />;
}

export function ContextMenuContent({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItem({ className, inset, ...props }) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-default data-[disabled]:opacity-50 data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      className={cn(
        "relative flex items-center gap-2 pl-8 pr-2 py-1.5 text-sm",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export function ContextMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "relative flex items-center gap-2 pl-8 pr-2 py-1.5 text-sm",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="h-2 w-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export function ContextMenuLabel({ className, inset, ...props }) {
  return (
    <ContextMenuPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

export function ContextMenuSeparator({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("bg-border my-1 h-px", className)}
      {...props}
    />
  );
}

export function ContextMenuShortcut({ className, ...props }) {
  return (
    <span
      className={cn("ml-auto text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ContextMenuSub(props) {
  return <ContextMenuPrimitive.Sub {...props} />;
}

export function ContextMenuSubTrigger({ className, children, ...props }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        "flex items-center px-2 py-1.5 text-sm rounded-sm",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

export function ContextMenuSubContent({ className, ...props }) {
  return (
    <ContextMenuPrimitive.SubContent
      className={cn(
        "bg-popover text-popover-foreground min-w-[8rem] rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}