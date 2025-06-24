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
  } = {}
): string => {
  if (!html) return ''
  
  const {
    maxImageWidth = 100,
    maxImageHeight = 60
  } = options
  
  // Create a temporary div to parse and sanitize HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
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