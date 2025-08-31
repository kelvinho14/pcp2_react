export const config = {
  // Math rounding decimal places
  mathRounding: 1,
  // Date format
  dateFormat: 'YYYY-MM-DD HH:mm',
  // File upload configuration
  fileUpload: {
    // File size limits in bytes
    maxFileSizes: {
      question_bank: 5 * 1024 * 1024, // 5MB - detailed educational content
      default: 5 * 1024 * 1024,       // 5MB default
    },
    // Allowed image file types
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    // Mobile timeout settings (in milliseconds)
    timeouts: {
      mobile: 60000,  // 60 seconds
      desktop: 30000, // 30 seconds
    },
  },
} 