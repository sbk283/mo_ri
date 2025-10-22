// (참고) src/components/NoticeDetailRichTextEditor.tsx
// 그대로 사용 가능합니다. (Supabase Storage 업로드 + 여러 장 삽입/교체 처리)
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
import { supabase } from '../lib/supabase';

interface DetailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onImagesChange?: (images: File[]) => void;
  height?: number;

  requireNotEmpty?: boolean;
  onValidityChange?: (valid: boolean) => void;
}

const BUCKET = 'group-images';
const ROOT_PREFIX = 'groups';

const checkEditorContent = (quillRef: React.MutableRefObject<ReactQuill | null>): boolean => {
  const editor = quillRef.current?.getEditor?.();
  if (!editor) return false;
  const text = (editor.getText?.() ?? '').replace(/\u200B|\u00A0/g, '').trim();
  if (text !== '' && text !== '\n') return true;
  const ops = editor.getContents?.().ops as any[] | undefined;
  return (
    Array.isArray(ops) &&
    ops.some(op => op?.insert && typeof op.insert === 'object' && 'image' in op.insert)
  );
};

const NoticeDetailRichTextEditor: React.FC<DetailRichTextEditorProps> = memo(
  ({
    value,
    onChange,
    placeholder = '내용을 입력해주세요.',
    disabled = false,
    onImagesChange,
    height = 350,
    requireNotEmpty = false,
    onValidityChange,
  }) => {
    const quillRef = useRef<ReactQuill | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);
    useEffect(() => {
      onValidityChange?.(checkEditorContent(quillRef));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const uploadImageToSupabase = useCallback(async (file: File): Promise<string> => {
      const ymd = new Date().toISOString().slice(0, 7).replace('-', '');
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const name = (crypto as any).randomUUID ? crypto.randomUUID() : String(Date.now());
      const path = `${ROOT_PREFIX}/${ymd}/${name}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type || 'image/*',
      });
      if (upErr) {
        console.error('[NoticeEditor] upload error:', upErr);
        throw upErr;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('공개 URL을 생성하지 못했습니다.');
      return data.publicUrl;
    }, []);

    const safeSetSelection = (editor: any, index: number) => {
      try {
        if (!editor?.root?.isConnected) return;
        const len = Math.max(0, (editor.getLength?.() ?? 1) - 1);
        const clamped = Math.min(Math.max(index, 0), len);
        setTimeout(() => {
          if (!editor?.root?.isConnected) return;
          editor.setSelection(clamped, 0, 'silent');
        }, 0);
      } catch {
        /* no-op */
      }
    };

    const insertOrReplaceAtSelection = useCallback((editor: any, url: string) => {
      const sel = editor.getSelection?.(true);
      let idx = sel?.index ?? (editor.getLength?.() ?? 1) - 1;

      const fmt = sel ? editor.getFormat(sel) : {};
      const onImage = !!(fmt && (fmt.image || (fmt['embed'] && fmt['embed'].image)));

      if (onImage) {
        editor.deleteText(idx, 1, 'user');
        editor.insertEmbed(idx, 'image', url, 'user');
        safeSetSelection(editor, idx + 1);
      } else {
        editor.insertEmbed(idx, 'image', url, 'user');
        safeSetSelection(editor, idx + 1);
      }
    }, []);

    const uploadAndInsertFiles = useCallback(
      async (files: FileList | File[]) => {
        const editor = quillRef.current?.getEditor?.();
        if (!editor || !files?.length) return;

        const list = Array.from(files);
        const accepted: File[] = [];

        for (const file of list) {
          if (!file.type.startsWith('image/')) continue;
          try {
            const url = await uploadImageToSupabase(file);
            insertOrReplaceAtSelection(editor, url);
            accepted.push(file);
          } catch (err) {
            console.error('[NoticeEditor] uploadAndInsertFiles error:', err);
          }
        }

        if (accepted.length && onImagesChange) onImagesChange(accepted);
        onValidityChange?.(checkEditorContent(quillRef));
      },
      [insertOrReplaceAtSelection, onImagesChange, onValidityChange, uploadImageToSupabase],
    );

    const imageHandler = useCallback(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = () => {
        if (!input.files?.length) return;
        void uploadAndInsertFiles(input.files);
      };
      input.click();
    }, [uploadAndInsertFiles]);

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.kind === 'file') {
            const f = it.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length) {
          e.preventDefault();
          void uploadAndInsertFiles(files);
        }
      },
      [uploadAndInsertFiles],
    );

    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer?.files?.length) {
          void uploadAndInsertFiles(e.dataTransfer.files);
        }
      },
      [uploadAndInsertFiles],
    );

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
          handlers: { image: imageHandler },
        },
        clipboard: { matchVisual: false },
      }),
      [imageHandler],
    );

    const formats = useMemo(
      () => ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'],
      [],
    );

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
        style={{ minHeight: `${height + 72}px` }}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <ReactQuill
          ref={quillRef as any}
          theme="snow"
          value={value || ''}
          onChange={next => {
            onValidityChange?.(checkEditorContent(quillRef));
            onChange(next);
          }}
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
