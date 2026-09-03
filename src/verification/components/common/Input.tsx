import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { inputCls, invalidCls, textareaCls } from "../../ui";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(inputCls, invalid && invalidCls, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(textareaCls, invalid && invalidCls, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
