import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge tailwind classes with proper precedence
 * @param {...(string|object|boolean|undefined)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}