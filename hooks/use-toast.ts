'use client'

import * as React from 'react'
import { useToast as useToastBase } from '@/components/ui/use-toast'

export const useToast = () => {
  const { toast, ...rest } = useToastBase()

  return {
    toast: React.useCallback(
      ({ ...props }: any) => {
        toast({
          ...props,
        })
      },
      [toast]
    ),
    ...rest,
  }
}