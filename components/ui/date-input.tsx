'use client'

import * as React from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string // ISO date string (YYYY-MM-DD) or empty
  onChange?: (value: string) => void // Returns ISO date string (YYYY-MM-DD)
}

/**
 * Custom date input that displays and accepts DD/MM/YYYY format
 * Internally stores and returns ISO format (YYYY-MM-DD) for compatibility
 */
const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Convert ISO date (YYYY-MM-DD) to DD/MM/YYYY for display
    const formatForDisplay = (isoDate: string): string => {
      if (!isoDate) return ''
      // Parse YYYY-MM-DD as UTC to avoid timezone shifts
      const [year, month, day] = isoDate.split('-').map(Number)
      if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        return ''
      }
      // Validate the date
      const date = new Date(Date.UTC(year, month - 1, day))
      if (isNaN(date.getTime())) return ''
      // Format as DD/MM/YYYY using the original values to avoid timezone issues
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }

    // Convert DD/MM/YYYY to ISO format (YYYY-MM-DD)
    const parseFromDisplay = (displayValue: string): string => {
      // Remove any non-digit characters except slashes
      const cleaned = displayValue.replace(/[^\d/]/g, '')
      
      // Match DD/MM/YYYY or DDMMYYYY
      const match = cleaned.match(/^(\d{1,2})[\/]?(\d{1,2})[\/]?(\d{4})$/)
      if (!match) return ''

      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10)
      const year = parseInt(match[3], 10)

      // Validate date
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        return ''
      }

      // Create date and validate it's a real date
      const date = new Date(year, month - 1, day)
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return ''
      }

      // Return ISO format
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }

    const [displayValue, setDisplayValue] = React.useState(() =>
      value ? formatForDisplay(value) : ''
    )

    // Update display value when prop value changes
    React.useEffect(() => {
      if (value) {
        const formatted = formatForDisplay(value)
        setDisplayValue(formatted)
      } else {
        setDisplayValue('')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)

      // Try to parse the value
      const isoDate = parseFromDisplay(inputValue)
      if (isoDate && onChange) {
        onChange(isoDate)
      } else if (inputValue === '' && onChange) {
        onChange('')
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // On blur, validate and format the date
      const isoDate = parseFromDisplay(displayValue)
      if (isoDate) {
        setDisplayValue(formatForDisplay(isoDate))
        if (onChange) {
          onChange(isoDate)
        }
      } else if (displayValue) {
        // Invalid date, clear it or show error
        setDisplayValue('')
        if (onChange) {
          onChange('')
        }
      }
    }

    return (
      <Input
        ref={ref}
        type="text"
        placeholder="DD/MM/YYYY"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    )
  }
)
DateInput.displayName = 'DateInput'

export { DateInput }

