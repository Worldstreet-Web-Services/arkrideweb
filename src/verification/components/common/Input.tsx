"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { inputCls, invalidCls, textareaCls } from "../../ui";
import { useFieldContext } from "./FormField";

/**
 * `id`, `aria-describedby` and `aria-invalid` are taken from the enclosing
 * `FormField` unless the caller passes them explicitly. That is what makes
 * every existing call site labelled without touching it.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, id, ...props }: InputProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <input
      id={id ?? field?.id}
      className={cn(inputCls, isInvalid && invalidCls, className)}
      aria-invalid={isInvalid || undefined}
      aria-describedby={props["aria-describedby"] ?? field?.describedBy}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, id, ...props }: TextareaProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <textarea
      id={id ?? field?.id}
      className={cn(textareaCls, isInvalid && invalidCls, className)}
      aria-invalid={isInvalid || undefined}
      aria-describedby={props["aria-describedby"] ?? field?.describedBy}
      {...props}
    />
  );
}
