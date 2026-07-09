import { SHARK_PATHS, SHARK_VIEWBOX } from "@/lib/shark";
import { cn } from "@/lib/utils";

/** Static (non-animated) shark mark. Inherits color via currentColor. */
export function SharkLogo({
  width = 48,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={SHARK_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      style={{ aspectRatio: "325 / 204" }}
      className={cn("shrink-0", className)}
      aria-label="Black Shark logo"
    >
      {SHARK_PATHS.map((d) => (
        <path key={d} fillRule="evenodd" clipRule="evenodd" d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
