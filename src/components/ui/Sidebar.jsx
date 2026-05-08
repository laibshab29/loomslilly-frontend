import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./sheet";
import { Skeleton } from "./Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

const SidebarContext = createContext(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

export function SidebarProvider({ defaultOpen = true, children }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  const toggleSidebar = () => {
    isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  };

  useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [open]);

  const state = open ? "expanded" : "collapsed";

  const value = useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      isMobile,
    }),
    [state, open, openMobile, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          }}
          className="flex w-full min-h-screen"
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, side = "left" }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile Sidebar</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-state={state}
      className="hidden md:flex flex-col h-screen w-[var(--sidebar-width)] bg-sidebar border-r"
    >
      {children}
    </div>
  );
}

export function SidebarTrigger(props) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} {...props}>
      <PanelLeftIcon />
    </Button>
  );
}

/* ---------- STRUCTURE ---------- */

export function SidebarHeader({ className, ...props }) {
  return <div className={cn("p-2 flex flex-col gap-2", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }) {
  return <div className={cn("p-2 mt-auto flex flex-col gap-2", className)} {...props} />;
}

export function SidebarContent({ className, ...props }) {
  return <div className={cn("flex-1 overflow-auto flex flex-col", className)} {...props} />;
}

export function SidebarInset({ className, ...props }) {
  return <main className={cn("flex-1", className)} {...props} />;
}

/* ---------- MENU ---------- */

export function SidebarMenu(props) {
  return <ul className="flex flex-col gap-1" {...props} />;
}

export function SidebarMenuItem(props) {
  return <li className="relative" {...props} />;
}

const menuVariants = cva(
  "flex items-center gap-2 p-2 text-sm rounded-md hover:bg-sidebar-accent"
);

export function SidebarMenuButton({ tooltip, className, ...props }) {
  const { isMobile, state } = useSidebar();

  const btn = (
    <button className={cn(menuVariants(), className)} {...props} />
  );

  if (!tooltip) return btn;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent
        side="right"
        hidden={state !== "collapsed" || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/* ---------- EXTRA ---------- */

export function SidebarSeparator(props) {
  return <Separator className="my-2" {...props} />;
}

export function SidebarInput(props) {
  return <Input className="h-8" {...props} />;
}

export function SidebarMenuSkeleton({ showIcon }) {
  return (
    <div className="flex items-center gap-2 p-2">
      {showIcon && <Skeleton className="h-4 w-4" />}
      <Skeleton className="h-4 w-full" />
    </div>
  );
}