import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in KES
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date in DD/MM/YYYY format (Kenyan preference)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB')
}

/**
 * Format phone number for Kenya
 */
export function formatPhone(phone: string): string {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // If starts with 07, convert to +2547
  if (cleaned.startsWith('07')) {
    return '+254' + cleaned.substring(1)
  }
  
  // If starts with 7, convert to +2547
  if (cleaned.startsWith('7')) {
    return '+254' + cleaned
  }
  
  return phone
}

