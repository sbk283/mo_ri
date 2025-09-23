// 모임 생성 - StepOne 이미지 업로드

import React, { useEffect, useRef, useState } from 'react';

// 이미지 최대 9장, 서브 이미지 8장 대표이미지 1장
const MAX_SUB = 8;
const MAX_TOTAL = 1 + MAX_SUB;

type ImageUploaderProps = {
  images: File[];
  onChange: (nextImages: File[]) => void;
};

function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 내부 관리
  useEffect(() => {
    const previewUrls = images.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  const canAdd = images.length < MAX_TOTAL;

  const handlePick = () => inputRef.current?.click();

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;

    const availableSlots = MAX_TOTAL - images.length;
    const nextImages = [...images, ...selectedFiles.slice(0, availableSlots)];

    onChange(nextImages);
    e.currentTarget.value = '';
  };

  const handleRemove = (removeIndex: number) => {
    const nextImages = images.filter((_, i) => i !== removeIndex);
    onChange(nextImages);
  };

  return (
    <section className="flex">
      <label className="font-semibold mb-2 text-lg">이미지 첨부</label>

      <div className="flex pl-[40px] gap-4">
        {/* 대표 이미지 */}
        <div className="relative w-[310px] h-[200px] border border-gray-300 rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
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

        {/* 서브 이미지들 + 추가 버튼 */}
        <div className="grid grid-cols-4 gap-3">
          {images.slice(1).map((_, subIndex) => {
            const imageIndex = subIndex + 1;
            return (
              <div
                key={imageIndex}
                className="relative w-[103px] h-[95px] border border-gray-300 rounded flex items-center justify-center text-gray-400 overflow-hidden"
              >
                <img
                  src={previews[imageIndex]}
                  alt={`서브 ${imageIndex}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(imageIndex)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded"
                >
                  X
                </button>
              </div>
            );
          })}

          {/* 사진 추가 버튼 (마지막 점선) */}
          {canAdd && (
            <div className="relative w-[103px] h-[95px] border border-dashed border-brand rounded flex items-center justify-center text-gray-400 overflow-hidden">
              <div className="flex flex-col items-center justify-center">
                <img src="/images/camera.svg" alt="placeholder" className="w-5 h-5" />
                <span className="mt-1 text-[10px] font-semibold text-[#4294CF] leading-normal">
                  사진 추가
                </span>
              </div>
              <button
                type="button"
                onClick={handlePick}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="이미지 추가"
              />
            </div>
          )}
        </div>
      </div>

      {/* 숨겨진 파일 입력기: 모든 업로드 트리거가 이걸 사용 */}
      {/* 파일 선택창은 input이 띄우지만, 기존 input은 숨겨놓고 저희가 피그마에서 만든 박스로 대신하게끔 구현했어여 */}
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
