/**
 * Utility functions for safely rendering HTML content
 */

/**
 * Safely strips HTML tags and extracts text content
 * @param html - The HTML string to process
 * @returns Clean text content without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return ''
  
  // Create a temporary div to parse HTML safely
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Replace img tags with a placeholder before getting text content
  const images = tempDiv.querySelectorAll('img')
  images.forEach((img, index) => {
    const alt = img.getAttribute('alt') || ''
    const placeholder = alt ? `[Image: ${alt}]` : '[Image]'
    img.replaceWith(document.createTextNode(placeholder))
  })
  
  // Get text content (this automatically strips remaining HTML tags)
  let text = tempDiv.textContent || tempDiv.innerText || ''
  
  // Clean up any remaining HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Safely renders HTML content with images while preventing XSS attacks
 * @param html - The HTML string to render
 * @param options - Configuration options for rendering
 * @returns Sanitized HTML string safe for rendering
 */
export const renderHtmlSafely = (
  html: string, 
  options: {
    maxImageWidth?: number
    maxImageHeight?: number
    nl2br?: boolean // Convert \n to <br> tags
  } = {}
): string => {
  if (!html) return ''
  
  const {
    maxImageWidth = 100,
    maxImageHeight = 60,
    nl2br = false
  } = options
  
  let processedHtml = html
  
  // Convert newlines to <br> tags if nl2br is enabled
  if (nl2br) {
    processedHtml = processedHtml
      .replace(/&/g, '&amp;')      // Escape ampersands first
      .replace(/</g, '&lt;')       // Escape less than
      .replace(/>/g, '&gt;')       // Escape greater than
      .replace(/"/g, '&quot;')     // Escape quotes
      .replace(/'/g, '&#39;')      // Escape single quotes
      .replace(/\\n/g, '<br />')   // Convert escaped \n literals
      .replace(/\r\n/g, '<br />')  // Windows line endings
      .replace(/\n/g, '<br />')    // Unix line endings
      .replace(/\r/g, '<br />')    // Old Mac line endings
  }
  
  // Create a temporary div to parse and sanitize HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = processedHtml
  
  // Remove potentially dangerous elements and attributes
  const dangerousElements = tempDiv.querySelectorAll('script, style, iframe, object, embed, form, input, button, select, textarea')
  dangerousElements.forEach(el => el.remove())
  
  // Remove dangerous attributes from all elements
  const allElements = tempDiv.querySelectorAll('*')
  allElements.forEach(el => {
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit']
    dangerousAttrs.forEach(attr => el.removeAttribute(attr))
  })
  
  // Limit image size for preview
  const images = tempDiv.querySelectorAll('img')
  images.forEach(img => {
    img.style.maxWidth = `${maxImageWidth}px`
    img.style.maxHeight = `${maxImageHeight}px`
    img.style.objectFit = 'contain'
    img.style.marginRight = '5px'
    img.style.verticalAlign = 'middle'
  })
  
  return tempDiv.innerHTML
}

/**
 * Utility function to check if HTML content contains images
 * @param html - The HTML string to check
 * @returns True if the HTML contains img tags
 */
export const hasImages = (html: string): boolean => {
  return html.includes('<img')
}

/**
 * Utility function to get a text preview of HTML content
 * @param html - The HTML string to process
 * @param maxLength - Maximum length of the preview (default: 80)
 * @returns Text preview with ellipsis if truncated
 */
export const getTextPreview = (html: string, maxLength: number = 80): string => {
  const text = stripHtml(html)
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * Converts plain text with newlines to HTML with <br> tags (nl2br)
 * @param text - The plain text with newlines
 * @returns HTML string with <br> tags
 */
export const nl2br = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/&/g, '&amp;')      // Escape ampersands first
    .replace(/</g, '&lt;')       // Escape less than
    .replace(/>/g, '&gt;')       // Escape greater than
    .replace(/"/g, '&quot;')     // Escape quotes
    .replace(/'/g, '&#39;')      // Escape single quotes
    .replace(/\\n/g, '<br />')   // Convert escaped \n literals
    .replace(/\r\n/g, '<br />')  // Windows line endings
    .replace(/\n/g, '<br />')    // Unix line endings
    .replace(/\r/g, '<br />')    // Old Mac line endings
} 