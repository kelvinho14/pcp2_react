import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const TinyMCEEditor = ({
  initialValue = '',
  onChange,
  height = 500,
  placeholder = 'Start typing...',
}: TinyMCEEditorProps) => {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce/js/tinymce/tinymce.min.js"
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      init={{
        height,
        menubar: true,
        // Using the free tier configuration
        suffix: '.min',
        base_url: '/tinymce/tinymce/js/tinymce',
        // Disable premium features
        premium_plugins: [],
        // Use community plugins only
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
    />
  );
};

export default TinyMCEEditor; 