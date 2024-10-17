import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueToFloat(value: number) {
  return value / 100
}

export function floatToReal(value: number) {
  const formattedValue = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
  return formattedValue
}

export function integerValueToBRL(value: number) {
  return floatToReal(valueToFloat(value))
}

export function getTransactionStatusColor(status: string) {
  const allStatus = {
    paid: 'text-green-500',
    pending: 'text-yellow-500',
    cancelled: 'text-red-500'
  }
  return allStatus[status.toLowerCase()] ?? 'text-white'
}
