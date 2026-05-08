"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "./utils";

export function Accordion(props) {
  return <AccordionPrimitive.Root {...props} />;
}

export function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium transition-all hover:underline",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="size-4 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden text-sm" {...props}>
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
