import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios';
import { config } from '../../_metronic/helpers/config';
import './TinyMCEEditor.css'; // Import CSS for z-index fixes

interface TinyMCEEditorProps {
  initialValue?: string;
  value?: string;
  onChange?: (content: string) => void;
  onBlur?: (content: string) => void;
  height?: number;
  placeholder?: string;
  onImageUpload?: (fileId: string, url: string, questionId?: string) => void;
  questionType?: 'mc' | 'lq' | 'tf' | 'matching'; // Ready for future question types
  questionId?: string; // For edit mode
  isQuestionBank?: boolean; // Indicates this is from question bank
  language?: string; // TinyMCE language code (e.g., 'en', 'zh_CN', 'es')
  disabled?: boolean; // Add disabled state
  customTexts?: Record<string, string>; // For localization
}

interface ImageUploadResponse {
  status: string;
  data: {
    file_id: string;
    question_id: string;
    public_url: string;
  };
}

// Constants
const DEFAULT_CONFIG = {
  height: 500,
  placeholder: 'Start typing...',
  language: 'en',
  isQuestionBank: true,
} as const;

const EDITOR_PLUGINS = [
  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
  'insertdatetime', 'media', 'table', 'help', 'wordcount'
];

const EDITOR_TOOLBAR = 'undo redo | blocks | ' +
  'bold italic forecolor | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'removeformat | image | help';

// File size limits based on context
const getFileSizeLimit = (context: string): number => {
  return config.fileUpload.maxFileSizes[context as keyof typeof config.fileUpload.maxFileSizes] || 
         config.fileUpload.maxFileSizes.default;
};

// Helper function to format file size for user-friendly messages
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const TinyMCEEditor = ({
  initialValue = '',
  value,
  onChange,
  onBlur,
  height = DEFAULT_CONFIG.height,
  placeholder = DEFAULT_CONFIG.placeholder,
  onImageUpload,
  questionType,
  questionId,
  isQuestionBank = DEFAULT_CONFIG.isQuestionBank,
  language = DEFAULT_CONFIG.language,
  disabled = false,
  customTexts = {},
}: TinyMCEEditorProps) => {
  const editorRef = useRef<any>(null);
  const editorId = useRef<string>(`editor-${Math.random().toString(36).substr(2, 9)}`);
  const lastValueRef = useRef<string>('');
  
  // Local state to store the question ID returned from image uploads
  const [localQuestionId, setLocalQuestionId] = useState<string | undefined>(questionId);
  // Track if editor is fully initialized
  const [isEditorReady, setIsEditorReady] = useState(false);
  // Ref to store current question ID for immediate access in uploads
  const currentQuestionIdRef = useRef<string | undefined>(questionId);
  // Track blob URLs for cleanup
  const blobUrls = useRef<Set<string>>(new Set());

  // Always sync with prop - prop takes absolute precedence
  useEffect(() => {
    // If prop is provided, always use it (overrides internal state)
    if (questionId) {
      if (questionId !== localQuestionId || questionId !== currentQuestionIdRef.current) {
        setLocalQuestionId(questionId);
        currentQuestionIdRef.current = questionId;
      }
    }
    // If prop becomes undefined, keep internal state (don't clear it)
  }, [questionId]); // Only depend on questionId prop, not local state
  
  // Simplified content update - only for dynamic changes after initialization
  useEffect(() => {
    // Skip if using initialValue approach or editor not ready
    if (!isEditorReady || !editorRef.current?.setContent || !value) {
      return;
    }

    // Only update if content actually changed and we have a value
    if (value === lastValueRef.current) {
      return;
    }

    console.log('🔄 TinyMCE Dynamic Update:', {
      valueLength: value.length,
      lastValueLength: lastValueRef.current?.length || 0,
      preview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
    });

    // Update content for dynamic changes (like user edits in forms)
    try {
      editorRef.current.setContent(value);
      lastValueRef.current = value;
      console.log('✅ TinyMCE Dynamic Update: Success');
    } catch (error) {
      console.log('❌ TinyMCE Dynamic Update: Failed', error);
    }
  }, [value, isEditorReady]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrls.current.forEach(url => URL.revokeObjectURL(url));
      blobUrls.current.clear();
    };
  }, []);

  // Memoized image upload handler with better error handling
  const handleImageUpload = useCallback(async (
    blobInfo: any, 
    progress: (percent: number) => void
  ): Promise<string> => {
    try {
      // Validate file size before upload
      const fileBlob = blobInfo.blob();
      const maxSize = getFileSizeLimit('question_bank');
      
      if (fileBlob.size > maxSize) {
        const actualSize = formatFileSize(fileBlob.size);
        const maxSizeFormatted = formatFileSize(maxSize);
        throw new Error(`Image size (${actualSize}) exceeds the ${maxSizeFormatted} limit. Please use a smaller image or compress it first.`);
      }

      // Validate file type
      if (!config.fileUpload.allowedImageTypes.includes(fileBlob.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP).');
      }

      const formData = new FormData();
      formData.append('file', fileBlob, blobInfo.filename());
      formData.append('source', 'question_bank');
      
      if (questionType) {
        formData.append('question_type', questionType);
      }
      
      // STRICT PRIORITY: prop > ref > local state
      const currentQuestionId = questionId || currentQuestionIdRef.current || localQuestionId;
      if (currentQuestionId) {
        formData.append('question_id', currentQuestionId);
      }

      const API_URL = import.meta.env.VITE_APP_API_URL;
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      
      const endpoint = `${API_URL}/questions/imageupload`;
      const headers = { ...getHeadersWithSchoolSubject(endpoint) };
      delete headers['Content-Type']; // Let browser set boundary

      // Mobile-specific configuration
      const isMobile = /iPad|iPhone|Android/i.test(navigator.userAgent);
      const uploadConfig = {
        headers,
        withCredentials: true,
        timeout: isMobile ? config.fileUpload.timeouts.mobile : config.fileUpload.timeouts.desktop,
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progress(percent);
          }
        },
      };

      const response = await axios.post<ImageUploadResponse>(endpoint, formData, uploadConfig);

      const { data } = response.data;
      if (response.data.status === 'success' && data?.public_url) {
        // Update local question ID only if we don't have a prop
        if (data.question_id && !questionId) {
          setLocalQuestionId(data.question_id);
          currentQuestionIdRef.current = data.question_id;
        }
        
        // Notify parent component
        onImageUpload?.(data.file_id, data.public_url, data.question_id);
        
        return data.public_url;
      }
      
      throw new Error('Upload failed: Invalid response format');
    } catch (error: any) {
      // Add detailed logging for debugging
      console.error('🚨 TinyMCE Upload Error:', {
        errorCode: error.code,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile: /iPad|iPhone|Android/i.test(navigator.userAgent)
      });
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 413) {
        const maxSizeFormatted = formatFileSize(getFileSizeLimit('question_bank'));
        throw new Error(`Image file is too large for the server. Please use an image smaller than ${maxSizeFormatted}.`);
      }
      
      if (error.message?.includes('CORS') || error.message?.includes('access-control-allow-origin')) {
        throw new Error('Upload blocked by security policy. Please contact support if this persists.');
      }
      
      // Handle different error types with fallbacks (only in development)
      const isDevelopment = import.meta.env.MODE === 'development';
      const shouldUseFallback = isDevelopment && (
        error.code === 'ERR_NETWORK' || 
        error.response?.status === 404 || 
        error.response?.status === 422
      );
      
      if (shouldUseFallback) {
        console.warn('⚠️ Using blob fallback in development mode due to upload error');
        // Return blob URL as fallback for development/testing only
        const blobUrl = URL.createObjectURL(blobInfo.blob());
        blobUrls.current.add(blobUrl);
        return blobUrl;
      }
      
      // Re-throw the original error to preserve the custom message
      throw error;
    }
  }, [questionType, questionId, localQuestionId, onImageUpload]);

  // Memoized editor configuration for better performance
  const editorConfig = useMemo(() => ({
    height,
    menubar: true,
    language,
    plugins: EDITOR_PLUGINS,
    toolbar: EDITOR_TOOLBAR,
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    placeholder,
    branding: false,
    promotion: false,
    
    // Image upload configuration
    images_upload_handler: handleImageUpload,
    automatic_uploads: true,
    images_upload_credentials: true,
    images_file_types: 'jpeg,jpg,png,gif,webp',
    images_replace_blob_uris: true,
    image_advtab: false,
    image_dimensions: false,
    image_description: false,
    image_title: false,
    image_caption: false,
    images_upload_url: '',
    image_uploadtab: true,
    image_upload: true,
    image_upload_tab: true,
    // Show detailed error messages
    images_upload_error_handler: (error: any) => {
      console.error('TinyMCE Image Upload Error Handler:', error);
      // Return the error message to be displayed to the user
      return error.message || 'Image upload failed';
    },
    // Setup callback
    setup: (editor: any) => {
      editorRef.current = editor;
      
      // Add custom translations if provided
      if (Object.keys(customTexts).length > 0) {
        editor.on('init', () => {
          try {
            editor.translate.add(customTexts);
          } catch (error) {
            // Silent failure
          }
        });
      }
      
      editor.on('init', () => {
        console.log('🚀 TinyMCE Editor initialized:', {
          hasValue: !!value,
          valueLength: value?.length || 0,
          valuePreview: value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''),
          lastValueLength: lastValueRef.current?.length || 0
        });
        
        setIsEditorReady(true);
        
        // Handle modal z-index issues
        try {
          const container = editor.getContainer();
          if (container?.closest('.modal')) {
            container.style.zIndex = '1060';
            
            setTimeout(() => {
              const elements = container.querySelectorAll('.tox-menu, .tox-dialog');
              elements.forEach((element: any) => {
                element.style.zIndex = '1070';
              });
            }, 100);
          }
        } catch (error) {
          // Silent failure
        }
        
        // Track the initial content that was set via initialValue
        const currentContent = editor.getContent();
        if (currentContent) {
          lastValueRef.current = currentContent;
          console.log('✅ TinyMCE Setup: Tracked initial content:', {
            length: currentContent.length,
            preview: currentContent.substring(0, 50) + (currentContent.length > 50 ? '...' : '')
          });
        }
      });
    },
  }), [height, language, placeholder, disabled, handleImageUpload, customTexts, value]);
  


  // Memoized event handlers for better performance
  const handleEditorInit = useCallback((evt: any, editor: any) => {
    editorRef.current = editor;
    if (value !== undefined) {
      lastValueRef.current = value;
    }
  }, [value]);

  const handleEditorChange = useCallback((content: string) => {
    if (onChange && content !== undefined) {
      onChange(content);
    }
  }, [onChange]);

  const handleEditorBlur = useCallback((evt: any) => {
    if (onBlur && evt.target?.getContent) {
      try {
        const content = evt.target.getContent();
        onBlur(content);
      } catch (error) {
        // Silent failure
      }
    }
  }, [onBlur]);

  // For AI modal with pre-populated content, use initialValue instead of value
  const effectiveInitialValue = value || initialValue || '';

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce/js/tinymce/tinymce.min.js"
      onInit={handleEditorInit}
      initialValue={effectiveInitialValue}
      init={editorConfig}
      onEditorChange={handleEditorChange}
      onBlur={handleEditorBlur}
      disabled={disabled}
    />
  );
};

export default TinyMCEEditor; 