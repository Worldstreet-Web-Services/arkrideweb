import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-[var(--container-max)]",
  full: "max-w-full",
};

function Container({ size = "xl", className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-[var(--container-pad)]",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container };
