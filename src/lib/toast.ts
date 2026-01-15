import { toast } from 'sonner'
import { ApiError } from './api'

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    })
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
  
  apiError: (error: unknown, defaultMessage: string = 'An error occurred') => {
    if (error instanceof ApiError) {
      if (error.data.detail && error.data.detail.length > 0) {
        // Handle validation errors
        const validationMessages = error.data.detail
          .map(detail => `${detail.loc.join('.')}: ${detail.msg}`)
          .join('\n')
        
        toast.error('Validation Error', {
          description: validationMessages,
        })
      } else if (error.data.message) {
        toast.error('Error', {
          description: error.data.message,
        })
      } else {
        toast.error(defaultMessage, {
          description: `Status: ${error.status}`,
        })
      }
    } else if (error instanceof Error) {
      toast.error(defaultMessage, {
        description: error.message,
      })
    } else {
      toast.error(defaultMessage)
    }
  }
}