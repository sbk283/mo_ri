// 이미지 업로드

import React, { useEffect, useMemo, useRef, useState } from 'react';

// 이미지 최대 9장, 서브 이미지 8장 대표이미지 1장
const MAX_SUB = 8;
const MAX_TOTAL = 1 + MAX_SUB;

type Props = {
  images: File[];
  onChange: (next: File[]) => void;
};

function ImageUploader({ images, onChange }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 내부 관리
  useEffect(() => {
    const urls = images.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  const canAdd = images.length < MAX_TOTAL;

  const handlePick = () => inputRef.current?.click();

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = MAX_TOTAL - images.length;
    const next = [...images, ...files.slice(0, room)];
    onChange(next);
    e.currentTarget.value = ''; // 같은 파일 재선택 가능하게끔.
  };

  const handleRemove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  // 서브 슬롯 갯수 고정 8개
  const subSlots = useMemo(() => Array.from({ length: MAX_SUB }), []);

  return (
    <section>
      <label className="block font-semibold mb-2">이미지 첨부</label>

      <div className="flex gap-6">
        {/* 대표 이미지 */}
        <div className="relative w-40 h-40 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
          {previews[0] ? (
            <>
              <img src={previews[0]} alt="대표" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(0)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded"
              >
                제거
              </button>
            </>
          ) : (
            <>
              대표 이미지
              <button
                type="button"
                onClick={handlePick}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="대표 이미지 업로드"
              />
            </>
          )}
        </div>

        {/* 서브 이미지 8개 + 마지막 점선 업로드 */}
        <div className="grid grid-cols-4 gap-3">
          {subSlots.map((_, i) => {
            const idx = i + 1; // 1~8
            const isLastSlot = i === MAX_SUB - 1;
            const hasImage = !!previews[idx];

            return (
              <div
                key={i}
                className={`relative w-20 h-20 ${!hasImage && isLastSlot ? 'border-2 border-dashed' : 'border'} rounded flex items-center justify-center text-gray-400 overflow-hidden`}
              >
                {hasImage ? (
                  <>
                    <img
                      src={previews[idx]}
                      alt={`서브 ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded"
                    >
                      X
                    </button>
                  </>
                ) : (
                  <>
                    {/* 마지막 빈 슬롯만 업로드 트리거 */}
                    {isLastSlot && canAdd ? '+' : ''}
                    {isLastSlot && canAdd && (
                      <button
                        type="button"
                        onClick={handlePick}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="이미지 추가"
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 숨겨진 파일 입력기: 모든 업로드 트리거가 이걸 사용 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className="hidden"
      />
    </section>
  );
}

export default ImageUploader;
