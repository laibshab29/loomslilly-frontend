import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "./utils";
import { buttonVariants } from "./Button";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground w-8 text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal"
        ),
        day_selected: "bg-primary text-white",
        day_today: "bg-accent text-accent-foreground",
        day_disabled: "opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: (props) => (
          <ChevronLeft className="h-4 w-4" {...props} />
        ),
        IconRight: (props) => (
          <ChevronRight className="h-4 w-4" {...props} />
        ),
      }}
      {...props}
    />
  );
}