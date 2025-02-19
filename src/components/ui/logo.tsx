import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6 md:h-8 md:w-8",
    md: "h-8 w-8 md:h-12 md:w-12",
    lg: "h-12 w-12 md:h-16 md:w-16"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/mylogo.png" // Corrected path
        alt="Logo"
        className={cn(
          "object-contain transition-all",
          sizeClasses[size]
        )}
      />
      <span className={cn(
        "font-semibold tracking-tight transition-colors",
        size === "sm" && "text-base md:text-lg",
        size === "md" && "text-lg md:text-xl",
        size === "lg" && "text-xl md:text-2xl"
      )}>
        <a href="https://beyourtour.xyz">Be Your Tour</a>
        <p>Travel System</p>
      </span>
    </div>
  );
}