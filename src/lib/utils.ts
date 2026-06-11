import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes input to prevent HTML and script injection
 */
export function sanitizeInput(val: string): string {
  if (typeof val !== "string") return "";
  let sanitized = val.trim();
  // Strip any HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  // Replace direct script/html character sequences if necessary
  sanitized = sanitized.replace(/[<>]/g, "");
  return sanitized;
}

/**
 * Validates Indian mobile number format
 */
export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "Phone number is required";
  }
  // Check if first character is not in [6, 7, 8, 9]
  const firstChar = trimmed[0];
  if (firstChar && !["6", "7", "8", "9"].includes(firstChar)) {
    return "Please enter a valid Indian mobile number";
  }
  // Check if contains non-digits, or length is not 10
  const hasNonDigits = /\D/.test(trimmed);
  if (hasNonDigits || trimmed.length !== 10) {
    return "Phone number must contain exactly 10 digits";
  }
  return null;
}

/**
 * Validates general email format
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required";
  }
  // Standard email format verification regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address";
  }
  return null;
}

