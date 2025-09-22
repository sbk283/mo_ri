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
    <section className="flex">
      <label className="font-semibold mb-2 text-lg">이미지 첨부</label>

      <div className="flex pl-[40px] gap-4">
        {/* 대표 이미지 */}
        <div className="relative w-[310px] h-[200px] border-2 border-brand border-dashed rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
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
              <img src="/images/picture_dark.svg" />
              <button
                type="button"
                onClick={handlePick}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="대표 이미지 업로드"
              />
            </>
          )}
        </div>

        {/* 서브 이미지 8개, 마지막 점선! */}
        <div className="grid grid-cols-4 gap-3">
          {subSlots.map((_, i) => {
            const idx = i + 1;
            const isLastSlot = i === MAX_SUB - 1;
            const hasImage = !!previews[idx];

            return (
              <div
                key={i}
                className={`relative w-[103px] h-[95px] ${
                  !hasImage && isLastSlot
                    ? 'border-2 border-dashed border-brand'
                    : 'border border-brand'
                } rounded flex items-center justify-center text-gray-400 overflow-hidden`}
              >
                {/* 여기서 아이콘 분기 */}
                {!hasImage && (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={isLastSlot ? '/images/camera.svg' : '/images/picture_dark.svg'}
                      alt="placeholder"
                      className="w-5 h-5"
                    />
                    {isLastSlot && (
                      <span className="mt-1 text-[10px] font-semibold text-[#4294CF] leading-normal">
                        사진 추가
                      </span>
                    )}
                  </div>
                )}

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
