import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/placeholder.svg"
        alt="Logo"
        className={cn(
          "object-contain transition-all",
          sizeClasses[size]
        )}
      />
      <span className={cn(
        "font-semibold tracking-tight transition-colors",
        size === "sm" && "text-lg",
        size === "md" && "text-xl",
        size === "lg" && "text-2xl"
      )}>
        TripSynergy
      </span>
    </div>
  );
}