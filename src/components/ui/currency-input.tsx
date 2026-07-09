"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatDisplay(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Number input with a fixed "$" prefix and thousands separators once the field loses focus. */
export function CurrencyInput({
  id,
  value,
  onValue,
  className,
}: {
  id?: string;
  value: number;
  onValue: (value: number) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(formatDisplay(value));

  useEffect(() => {
    if (!focused) setText(formatDisplay(value));
  }, [value, focused]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={text}
        className={cn("pl-6", className)}
        onFocus={() => {
          setFocused(true);
          setText(value === 0 ? "" : String(value));
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          setText(raw);
          onValue(Number(raw) || 0);
        }}
        onBlur={() => {
          setFocused(false);
          setText(formatDisplay(value));
        }}
      />
    </div>
  );
}
