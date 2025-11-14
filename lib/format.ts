/**
 * Format currency amount in Indian Rupees (₹)
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toFixed(2)}`
}

/**
 * Format time in 12-hour format with AM/PM (IST)
 * Converts time string (HH:mm) to 12-hour format
 */
export function formatTimeIST(timeString: string): string {
  // Parse HH:mm format
  const [hours, minutes] = timeString.split(':').map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) {
    return timeString // Return as-is if invalid format
  }

  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  
  // Format with leading zero for minutes
  const minutesStr = minutes.toString().padStart(2, '0')
  
  return `${hours12}:${minutesStr} ${period} IST`
}

/**
 * Format time range in 12-hour format
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeIST(startTime)} - ${formatTimeIST(endTime)}`
}

/**
 * Format date in DD/MM/YYYY format (IST timezone)
 */
export function formatDateIST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Use Intl.DateTimeFormat to get date parts in IST timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  
  const parts = formatter.formatToParts(dateObj)
  const day = parts.find(p => p.type === 'day')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const year = parts.find(p => p.type === 'year')?.value || ''
  
  return `${day}/${month}/${year}`
}

/**
 * Get current time in IST
 */
export function getCurrentTimeIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

