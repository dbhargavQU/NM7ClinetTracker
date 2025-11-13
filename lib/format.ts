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
 * Format date in IST timezone
 */
export function formatDateIST(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get current time in IST
 */
export function getCurrentTimeIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

