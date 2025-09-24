// 2025-09-24 업데이트: ReactQuill 안정성 개선을 위한 memo, useMemo 추가
import React, { useCallback, useRef, memo, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImagesChange?: (images: File[]) => void;
}

// 2025-09-24 업데이트: memo로 컴포넌트 메모이제이션하여 불필요한 리렌더링 방지
const RichTextEditor: React.FC<RichTextEditorProps> = memo(
  ({ value, onChange, placeholder = '내용을 입력하세요.', disabled = false, onImagesChange }) => {
    const quillRef = useRef<ReactQuill | null>(null);

    // 2025-09-24 업데이트: 이미지 핸들러를 useCallback으로 메모이제이션하고 FileReader 사용으로 변경
    const imageHandler = useCallback(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true; // 2025-01-24 업데이트: 다중 파일 업로드 지원
      input.click();

      input.onchange = () => {
        const files = input.files;
        if (!files || files.length === 0) return;

        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        Array.from(files).forEach(file => {
          // 2025-09-24 업데이트: 파일 크기 제한 (5MB) 및 타입 검증 추가
          if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
          }

          if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
          }

          // 2025-09-24 업데이트: URL.createObjectURL 대신 FileReader.readAsDataURL 사용
          const reader = new FileReader();
          reader.onload = e => {
            const result = e.target?.result;
            if (result) {
              const range = quill.getSelection();
              const insertIndex = range ? range.index : quill.getLength();

              // 2025-09-24 업데이트: Base64 이미지를 에디터에 삽입
              quill.insertEmbed(insertIndex, 'image', result);
              quill.setSelection(insertIndex + 1);

              // 2025-09-24 업데이트: 에디터 내용 업데이트를 위해 onChange 호출
              const newContent = quill.root.innerHTML;
              onChange(newContent);
            }
          };
          reader.readAsDataURL(file);

          // 2025-09-24 업데이트: 원본 파일을 부모 컴포넌트에 전달 (서버 업로드용)
          if (onImagesChange) {
            onImagesChange([file]);
          }
        });
      };
    }, [onChange, onImagesChange]);

    // 2025-09-24 업데이트: modules와 formats를 useMemo로 메모이제이션하여 안정성 향상
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
