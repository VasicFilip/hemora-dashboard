import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    })
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
    })
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  },
  apiError: (error: any, fallbackMessage: string) => {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    const displayMessage = errorMessage.length < 50 ? errorMessage : fallbackMessage

    toast.error(displayMessage, {
      description: errorMessage.length >= 50 ? errorMessage : undefined,
      duration: 5000,
    })
  }
}
