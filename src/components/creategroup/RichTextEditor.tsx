// 2025-09-24 업데이트: ReactQuill 안정성 개선을 위한 memo, useMemo 추가
import React, { useCallback, useRef, memo, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../css/custom-quill.css'; // 네가 만든 커스텀 CSS (정렬 등 스타일)

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImagesChange?: (images: File[]) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = memo(
  ({ value, onChange, placeholder = '내용을 입력하세요.', disabled = false, onImagesChange }) => {
    const quillRef = useRef<ReactQuill | null>(null);

    // 이미지 삽입 핸들러
    const imageHandler = useCallback(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.click();

      input.onchange = () => {
        const files = input.files;
        if (!files || files.length === 0) return;
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
            if (result) {
              const range = quill.getSelection();
              const insertIndex = range ? range.index : quill.getLength();
              quill.insertEmbed(insertIndex, 'image', result);
              quill.setSelection(insertIndex + 1);
              onChange(quill.root.innerHTML);
            }
          };
          reader.readAsDataURL(file);

          if (onImagesChange) onImagesChange([file]);
        });
      };
    }, [onChange, onImagesChange]);

    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { align: [] }],
            ['link', 'image'],
            ['clean'],
          ],
          handlers: { image: imageHandler },
        },
        clipboard: { matchVisual: false },
      }),
      [imageHandler],
    );

    const formats = useMemo(
      () => [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'link',
        'image',
        'color', 
        'align',
      ],
      [],
    );

    return (
      <div className="editor-wrapper">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={(content: string) => onChange(content)}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
        />
      </div>
    );
  },
);

export default RichTextEditor;
