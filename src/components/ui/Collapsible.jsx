import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export function Collapsible(props) {
  return <CollapsiblePrimitive.Root {...props} />;
}

export function CollapsibleTrigger(props) {
  return <CollapsiblePrimitive.Trigger {...props} />;
}

export function CollapsibleContent(props) {
  return <CollapsiblePrimitive.Content {...props} />;
}