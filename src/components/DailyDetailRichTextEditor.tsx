// src/components/DetailRichTextEditor.tsx
import React, { useCallback, useRef, memo, useMemo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DetailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImagesChange?: (images: File[]) => void;
}

const DetailRichTextEditor: React.FC<DetailRichTextEditorProps> = memo(
  ({ value, onChange, placeholder = '내용을 입력하세요.', disabled = false, onImagesChange }) => {
    const quillRef = useRef<ReactQuill | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const imageHandler = useCallback(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.click();

      input.onchange = () => {
        const files = input.files;
        if (!files?.length) return;

        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        Array.from(files).forEach(file => {
          if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
          }
          if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
          }

          const reader = new FileReader();
          reader.onload = e => {
            const result = e.target?.result;
            if (!result) return;
            const range = quill.getSelection();
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertEmbed(insertIndex, 'image', result);
            quill.setSelection(insertIndex + 1);
          };
          reader.readAsDataURL(file);
        });

        if (onImagesChange) {
          onImagesChange(Array.from(files));
        }
      };
    }, [onImagesChange]);

    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
          },
        },
        clipboard: {
          matchVisual: false,
        },
      }),
      [imageHandler],
    );

    const formats = useMemo(
      () => ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'],
      [],
    );

    // SSR 대응: 클라이언트에서만 렌더링
    if (!isMounted) {
      return (
        <div className="editor-wrapper" style={{ minHeight: '400px' }}>
          Loading...
        </div>
      );
    }

    return (
      <div className="editor-wrapper" style={{ minHeight: '400px' }}>
        <ReactQuill
          ref={quillRef as any}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules as any}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{ height: '350px' }}
        />
      </div>
    );
  },
);

DetailRichTextEditor.displayName = 'DetailRichTextEditor';

export default DetailRichTextEditor;
