import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "./utils";

export function Menubar({ className, ...props }) {
  return (
    <MenubarPrimitive.Root
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props}
    />
  );
}

export function MenubarMenu(props) {
  return <MenubarPrimitive.Menu {...props} />;
}

export function MenubarGroup(props) {
  return <MenubarPrimitive.Group {...props} />;
}

export function MenubarPortal(props) {
  return <MenubarPrimitive.Portal {...props} />;
}

export function MenubarRadioGroup(props) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

export function MenubarTrigger({ className, ...props }) {
  return (
    <MenubarPrimitive.Trigger
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-none select-none",
        className
      )}
      {...props}
    />
  );
}

export function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[12rem] rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

export function MenubarItem({ className, inset, ...props }) {
  return (
    <MenubarPrimitive.Item
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-default data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

export function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      className={cn(
        "relative flex items-center gap-2 pl-8 pr-2 py-1.5 text-sm",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

export function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.RadioItem
      className={cn(
        "relative flex items-center gap-2 pl-8 pr-2 py-1.5 text-sm",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="h-2 w-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

export function MenubarLabel({ className, inset, ...props }) {
  return (
    <MenubarPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

export function MenubarSeparator({ className, ...props }) {
  return (
    <MenubarPrimitive.Separator
      className={cn("bg-border my-1 h-px", className)}
      {...props}
    />
  );
}

export function MenubarShortcut({ className, ...props }) {
  return (
    <span
      className={cn("ml-auto text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function MenubarSub(props) {
  return <MenubarPrimitive.Sub {...props} />;
}

export function MenubarSubTrigger({ className, children, ...props }) {
  return (
    <MenubarPrimitive.SubTrigger
      className={cn(
        "flex items-center px-2 py-1.5 text-sm rounded-sm",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

export function MenubarSubContent({ className, ...props }) {
  return (
    <MenubarPrimitive.SubContent
      className={cn(
        "bg-popover text-popover-foreground min-w-[8rem] rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}