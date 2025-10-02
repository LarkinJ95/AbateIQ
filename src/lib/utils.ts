import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// You can add this to your existing utils.ts file or a new one
export function visuallyHidden(
  ...inputs: ClassValue[]
): string {
  return cn(
    'sr-only',
    'absolute w-px h-px p-0 -m-px overflow-hidden clip-rect(0, 0, 0, 0) whitespace-nowrap border-0',
    ...inputs
  );
}
