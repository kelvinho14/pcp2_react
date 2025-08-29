import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios';

interface TinyMCEEditorProps {
  initialValue?: string;
  value?: string;
  onChange?: (content: string) => void;
  onBlur?: (content: string) => void;
  height?: number;
  placeholder?: string;
  onImageUpload?: (fileId: string, url: string, questionId?: string) => void;
  questionType?: 'mc' | 'lq';
  questionId?: string; // For edit mode
  isQuestionBank?: boolean; // Indicates this is from question bank
}

const TinyMCEEditor = ({
  initialValue = '',
  value,
  onChange,
  onBlur,
  height = 500,
  placeholder = 'Start typing...',
  onImageUpload,
  questionType,
  questionId,
  isQuestionBank = true, // Default to true for question bank
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

  // Update local question ID when prop changes
  useEffect(() => {
    if (questionId && questionId !== localQuestionId) {
      setLocalQuestionId(questionId);
      currentQuestionIdRef.current = questionId;
      console.log('🔄 TinyMCEEditor: questionId prop updated to:', questionId);
    }
  }, [questionId, localQuestionId]);
  
  // Update editor content when value prop changes, but only if it's different
  useEffect(() => {
    if (isEditorReady && editorRef.current && editorRef.current.getContent && value !== undefined && value !== lastValueRef.current) {
      try {
        lastValueRef.current = value;
        // Only update if the content is actually different
        const currentContent = editorRef.current.getContent();
        if (currentContent !== value) {
          editorRef.current.setContent(value);
        }
      } catch (error) {
        // If editor is not ready, try again after a short delay
        setTimeout(() => {
          if (editorRef.current && editorRef.current.getContent) {
            try {
              const currentContent = editorRef.current.getContent();
              if (currentContent !== value) {
                editorRef.current.setContent(value);
              }
            } catch (retryError) {
              console.warn('Editor still not ready after retry:', retryError);
            }
          }
        }, 100);
      }
    }
  }, [value, isEditorReady]);

  // Custom image upload handler - using useCallback to maintain stable reference
  const handleImageUpload = useCallback(async (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
    console.log('🖼️ handleImageUpload called with:', { localQuestionId, questionId, questionType });
    
    try {
      const formData = new FormData();
      
      // Use 'file' as the field name
      const fieldName = 'file';
      formData.append(fieldName, blobInfo.blob(), blobInfo.filename());
      
      // Add metadata about the image source and question type
      formData.append('source', 'question_bank');
      if (questionType) {
        formData.append('question_type', questionType);
      }
      
      // Always send question_id if we have one (either from local state, ref, or props)
      const currentQuestionId = currentQuestionIdRef.current || localQuestionId || questionId;
      
      if (currentQuestionId) {
        formData.append('question_id', currentQuestionId);
        console.log('📤 Sending question_id to image upload API:', currentQuestionId);
      } else {
        console.log('⚠️ No question_id available for image upload');
      }

      const API_URL = import.meta.env.VITE_APP_API_URL;
      
      // Check if API URL is available
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      
      const endpoint = `${API_URL}/questions/imageupload`;
      const headers = getHeadersWithSchoolSubject(endpoint);
      
      // Remove content-type header to let browser set it with boundary for multipart/form-data
      delete headers['Content-Type'];

      const response = await axios.post(endpoint, formData, {
        headers,
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            progress(percent);
          }
        },
      });

      if (response.data.status === 'success' && response.data.data?.public_url) {
        // Extract file ID and question ID, then notify parent component
        const fileId = response.data.data.file_id;
        const returnedQuestionId = response.data.data.question_id;
        
        // Always store the returned question ID for future uploads
        if (returnedQuestionId) {
          // Update both state and ref immediately for next uploads
          setLocalQuestionId(returnedQuestionId);
          currentQuestionIdRef.current = returnedQuestionId;
          
          if (returnedQuestionId !== localQuestionId) {
            console.log('💾 Stored new question_id from API response:', returnedQuestionId);
          } else {
            console.log('✅ Using existing question_id:', returnedQuestionId);
          }
        } else {
          console.log('⚠️ No question_id returned from API response');
        }
        
        if (fileId && onImageUpload) {
          onImageUpload(fileId, response.data.data.public_url, returnedQuestionId);
        }
        
        return response.data.data.public_url;
      } else {
        throw new Error('Upload failed: Invalid response format');
      }
    } catch (error: any) {
      // Check if it's a network error (endpoint doesn't exist)
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        // Return a blob URL as fallback for development/testing
        const blobUrl = URL.createObjectURL(blobInfo.blob());
        return blobUrl;
      }
      
      // Check if it's a validation error (422)
      if (error.response?.status === 422) {
        // Return a blob URL as fallback for development/testing
        const blobUrl = URL.createObjectURL(blobInfo.blob());
        return blobUrl;
      }
      
      const errorMessage = error.response?.data?.message || 'Image upload failed';
      throw new Error(errorMessage);
    }
  }, [localQuestionId, questionType, onImageUpload]);

  const editorConfig = {
    height,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | image | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    placeholder,
    branding: false,
    promotion: false,
    // Custom image upload handler - this is the key setting
    images_upload_handler: handleImageUpload,
    // Enable automatic image uploads
    automatic_uploads: true,
    // Image upload settings
    images_upload_credentials: true,
    // Image file types
    images_file_types: 'jpeg,jpg,png,gif,webp',
    // Replace blob URIs with uploaded URLs
    images_replace_blob_uris: true,
    // Disable image tools that create unwanted tabs
    image_advtab: false,
    // Disable image dimensions
    image_dimensions: false,
    // Disable image description
    image_description: false,
    // Disable image title
    image_title: false,
    // Disable image caption
    image_caption: false,
    // Enable image upload tab in image dialog
    images_upload_url: '', // Empty to force use of upload handler
    // Force image plugin to show upload tab
    image_uploadtab: true,
    // Enable image upload in image dialog
    image_upload: true,
    // Show image upload tab
    image_upload_tab: true,
     // Setup callback - simplified
     setup: (editor: any) => {
       // Store reference to editor
       editorRef.current = editor;
       
       // Set initial content when editor is ready
       editor.on('init', () => {
         setIsEditorReady(true);
         if (value !== undefined && lastValueRef.current !== value) {
           try {
             editor.setContent(value);
             lastValueRef.current = value;
           } catch (error) {
             // If initial content setting fails, try again after a short delay
             setTimeout(() => {
               try {
                 if (value !== undefined && lastValueRef.current !== value) {
                   editor.setContent(value);
                   lastValueRef.current = value;
                 }
               } catch (retryError) {
                 console.warn('Could not set initial content after retry:', retryError);
               }
             }, 200);
           }
         }
       });
       
       // Customize the image dialog to only show upload tab
       editor.on('BeforeOpenWindow', (e: any) => {
         if (e.target?.settings?.title === 'Insert/edit image') {
           console.log('🚪 Image dialog opening, customizing tabs');
           
           // Override the dialog configuration to only show upload tab
           e.target.settings.image_uploadtab = true;
           e.target.settings.image_upload = true;
           
           // Hide general and advanced tabs by customizing the dialog
           e.target.settings.image_advtab = false;
           e.target.settings.image_dimensions = false;
           e.target.settings.image_description = false;
           e.target.settings.image_title = false;
           e.target.settings.image_caption = false;
         }
       });
       
       // After dialog opens, hide the unwanted tabs
       editor.on('OpenWindow', (e: any) => {
         if (e.target?.settings?.title === 'Insert/edit image') {
           console.log('🚪 Image dialog opened, hiding unwanted tabs');
           
           setTimeout(() => {
             try {
               // Hide General tab
               const generalTab = document.querySelector('.tox-dialog .tox-tab[aria-label="General"]');
               if (generalTab) {
                 (generalTab as HTMLElement).style.display = 'none';
                 console.log('✅ Hidden General tab');
               }
               
               // Hide Advanced tab
               const advancedTab = document.querySelector('.tox-dialog .tox-tab[aria-label="Advanced"]');
               if (advancedTab) {
                 (advancedTab as HTMLElement).style.display = 'none';
                 console.log('✅ Hidden Advanced tab');
               }
               
               // Show only Upload tab
               const uploadTab = document.querySelector('.tox-dialog .tox-tab[aria-label="Upload"]');
               if (uploadTab) {
                 (uploadTab as HTMLElement).click();
                 console.log('✅ Activated Upload tab');
               }
               
               // Hide any other unwanted elements
               const generalContent = document.querySelector('.tox-dialog .tox-tab-panel[aria-labelledby*="general"]');
               if (generalContent) {
                 (generalContent as HTMLElement).style.display = 'none';
               }
               
               const advancedContent = document.querySelector('.tox-dialog .tox-tab-panel[aria-labelledby*="advanced"]');
               if (advancedContent) {
                 (advancedContent as HTMLElement).style.display = 'none';
               }
               
             } catch (error) {
               console.error('Error customizing image dialog:', error);
             }
           }, 100);
         }
       });
     },
  };
  


  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce/js/tinymce/tinymce.min.js"

      onInit={(evt, editor) => {
        // Store editor reference
        editorRef.current = editor;
        

        
        // Content will be set in the setup callback when editor is fully ready
        if (value !== undefined) {
          lastValueRef.current = value;
        }
      }}
      initialValue={initialValue}
      init={editorConfig}
      onEditorChange={(content) => {
        if (onChange && content !== undefined) {
          onChange(content);
        }
      }}
      onBlur={(evt) => {
        if (onBlur && evt.target && evt.target.getContent) {
          try {
            const content = evt.target.getContent();
            onBlur(content);
          } catch (error) {
            console.warn('Editor not ready for blur event:', error);
          }
        }
      }}
    />
  );
};

export default TinyMCEEditor; 