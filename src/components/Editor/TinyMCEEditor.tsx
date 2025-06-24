import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect } from 'react';

interface TinyMCEEditorProps {
  initialValue?: string;
  value?: string;
  onChange?: (content: string) => void;
  onBlur?: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const TinyMCEEditor = ({
  initialValue = '',
  value,
  onChange,
  onBlur,
  height = 500,
  placeholder = 'Start typing...',
}: TinyMCEEditorProps) => {
  const editorRef = useRef<any>(null);
  const editorId = useRef<string>(`editor-${Math.random().toString(36).substr(2, 9)}`);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // Add a small delay to ensure editor is fully ready
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.setContent(value);
        }
      }, 100);
    }
  }, [value]);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce/js/tinymce/tinymce.min.js"
      onInit={(evt, editor) => {
        editorRef.current = editor
        // Always set content immediately when editor is ready
        if (value !== undefined) {
          // Add a small delay to ensure editor is fully ready
          setTimeout(() => {
            editor.setContent(value);
          }, 50);
        }
      }}
      initialValue={initialValue}
      init={{
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
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder,
        branding: false,
        promotion: false,
      }}
      onEditorChange={(content) => {
        if (onChange) {
          onChange(content);
        }
      }}
      onBlur={(evt) => {
        if (onBlur) {
          const content = evt.target.getContent();
          onBlur(content);
        }
      }}
    />
  );
};

export default TinyMCEEditor; 