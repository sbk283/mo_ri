// src/components/DetailRichTextEditor.tsx
import React, {
  useCallback,
  useRef,
  memo,
  useMemo,
  useState,
  useEffect,
  type DragEvent,
} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DetailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImagesChange?: (images: File[]) => void;
  /** 업로드 허용 최대 용량(MB). 기본 5 */
  maxImageMB?: number;
  /** 에디터 전체 높이(px). 기본 350 */
  height?: number;
  /** 이미지 버튼/업로드 비활성화 */
  disableImage?: boolean;
}

const NoticeDetailRichTextEditor: React.FC<DetailRichTextEditorProps> = memo(
  ({
    value,
    onChange,
    placeholder = '내용을 입력하세요.',
    disabled = false,
    onImagesChange,
    maxImageMB = 5,
    height = 350,
    disableImage = false,
  }) => {
    const quillRef = useRef<ReactQuill | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const acceptImage = useCallback(
      (file: File) => {
        const maxBytes = maxImageMB * 1024 * 1024;
        if (file.size > maxBytes) {
          alert(`파일 크기는 ${maxImageMB}MB 이하여야 합니다.`);
          return false;
        }
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.');
          return false;
        }
        return true;
      },
      [maxImageMB],
    );

    const insertFilesToQuill = useCallback(
      (files: FileList | File[]) => {
        const quill = quillRef.current?.getEditor?.();
        if (!quill || !files || !files.length) return;

        const accepted: File[] = [];
        Array.from(files).forEach(file => {
          if (!acceptImage(file)) return;

          const reader = new FileReader();
          reader.onload = e => {
            const result = e.target?.result;
            if (!result) return;
            const range = quill.getSelection();
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertEmbed(insertIndex, 'image', result);
            quill.setSelection(insertIndex + 1, 0);
          };
          reader.readAsDataURL(file);
          accepted.push(file);
        });

        if (accepted.length && onImagesChange) onImagesChange(accepted);
      },
      [onImagesChange, acceptImage],
    );

    const imageHandler = useCallback(() => {
      if (disableImage) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.click();
      input.onchange = () => {
        if (!input.files?.length) return;
        insertFilesToQuill(input.files);
      };
    }, [disableImage, insertFilesToQuill]);

    // 붙여넣기 이미지(클립보드) 핸들링
    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        if (disableImage) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.kind === 'file') {
            const file = it.getAsFile();
            if (file) files.push(file);
          }
        }
        if (files.length) {
          e.preventDefault();
          insertFilesToQuill(files);
        }
      },
      [disableImage, insertFilesToQuill],
    );

    // 드래그&드롭 이미지 핸들링
    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        if (disableImage) return;
        e.preventDefault();
        if (e.dataTransfer?.files?.length) {
          insertFilesToQuill(e.dataTransfer.files);
        }
      },
      [disableImage, insertFilesToQuill],
    );

    const modules = useMemo(() => {
      const base = {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', ...(disableImage ? [] : ['image'])],
            ['clean'],
          ],
          handlers: {} as Record<string, () => void>,
        },
        clipboard: { matchVisual: false },
      };
      if (!disableImage) {
        (base.toolbar.handlers as any).image = imageHandler;
      }
      return base;
    }, [imageHandler, disableImage]);

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
        ...(disableImage ? [] : ['image']),
      ],
      [disableImage],
    );

    // SSR 대응
    if (!isMounted) {
      return (
        <div className="editor-wrapper" style={{ minHeight: `${height + 50}px` }} aria-busy="true">
          Loading...
        </div>
      );
    }

    return (
      <div
        className="editor-wrapper"
        style={{ minHeight: `${height + 50}px` }}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <ReactQuill
          ref={quillRef as any}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules as any}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={{ height: `${height}px` }}
        />
      </div>
    );
  },
);

export default NoticeDetailRichTextEditor;
