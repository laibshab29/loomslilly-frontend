import React, { createContext, useContext, useId } from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./utils";
import { Label } from "./Label";

export const Form = FormProvider;

const FormFieldContext = createContext({});
const FormItemContext = createContext({});

export function FormField(props) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name);

  if (!fieldContext) {
    throw new Error("useFormField must be used inside FormField");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-description`,
    formMessageId: `${id}-form-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

export function FormControl(props) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        error
          ? `${formDescriptionId} ${formMessageId}`
          : formDescriptionId
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

export function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function FormMessage({ className, children, ...props }) {
  const { error, formMessageId } = useFormField();

  const message = error?.message || children;

  if (!message) return null;

  return (
    <p
      id={formMessageId}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
}