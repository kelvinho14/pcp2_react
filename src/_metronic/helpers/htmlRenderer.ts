/**
 * Utility functions for safely rendering HTML content
 */

// Character limit constants for content preview
export const CONTENT_PREVIEW_LIMIT = 150

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
  
  // Get text content (this automatically strips all HTML tags including images)
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
  
  // Limit image size for preview with responsive sizing
  const images = tempDiv.querySelectorAll('img')
  images.forEach(img => {
    img.style.maxWidth = `min(100%, ${maxImageWidth}px)`
    img.style.maxHeight = `${maxImageHeight}px`
    img.style.width = 'auto'
    img.style.height = 'auto'
    img.style.objectFit = 'contain'
    img.style.marginRight = '5px'
    img.style.verticalAlign = 'middle'
    img.style.display = 'inline-block'
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
 * @param maxLength - Maximum length of the preview (default: 150)
 * @returns Text preview with ellipsis if truncated
 */
export const getTextPreview = (html: string, maxLength: number = CONTENT_PREVIEW_LIMIT): string => {
  const text = stripHtml(html)
  
  // For proper character counting (especially for Chinese characters)
  // We'll use a more sophisticated approach that counts actual characters
  if (text.length <= maxLength) {
    return text
  }
  
  // For text with mixed languages, we need to be careful about where we cut
  // to avoid cutting in the middle of a word or character
  let truncated = text.substring(0, maxLength)
  
  // If we're not at the end of the string, add ellipsis
  if (text.length > maxLength) {
    truncated += '...'
  }
  
  return truncated
}

/**
 * Utility function to render HTML content with images but limit text content
 * @param html - The HTML string to process
 * @param maxLength - Maximum length of text content (default: 150)
 * @param imageOptions - Options for image rendering
 * @returns HTML string with images and truncated text content
 */
export const getHtmlPreview = (
  html: string, 
  maxLength: number = CONTENT_PREVIEW_LIMIT,
  imageOptions: { maxImageWidth?: number; maxImageHeight?: number } = {}
): string => {
  if (!html) return ''
  
  const { maxImageWidth = 100, maxImageHeight = 60 } = imageOptions
  
  // Create a temporary div to parse HTML safely
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
  
  // Limit image size for preview with responsive sizing
  const images = tempDiv.querySelectorAll('img')
  images.forEach(img => {
    img.style.maxWidth = `min(100%, ${maxImageWidth}px)`
    img.style.maxHeight = `${maxImageHeight}px`
    img.style.width = 'auto'
    img.style.height = 'auto'
    img.style.objectFit = 'contain'
    img.style.marginRight = '5px'
    img.style.verticalAlign = 'middle'
    img.style.display = 'inline-block'
  })
  
  // Get all text nodes and truncate them if needed
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  )
  
  let totalTextLength = 0
  const textNodes: Text[] = []
  
  // Collect all text nodes and calculate total length
  let node
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      textNodes.push(node as Text)
      totalTextLength += node.textContent.length
    }
  }
  
  // If total text length is within limit, return as is
  if (totalTextLength <= maxLength) {
    return tempDiv.innerHTML
  }
  
  // Truncate text nodes to fit within the limit
  let remainingLength = maxLength
  for (const textNode of textNodes) {
    if (remainingLength <= 0) {
      textNode.textContent = ''
      continue
    }
    
    const nodeText = textNode.textContent || ''
    if (nodeText.length <= remainingLength) {
      remainingLength -= nodeText.length
    } else {
      textNode.textContent = nodeText.substring(0, remainingLength) + '...'
      remainingLength = 0
    }
  }
  
  return tempDiv.innerHTML
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