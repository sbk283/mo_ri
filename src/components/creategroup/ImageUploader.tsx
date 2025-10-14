// 모임 생성 - StepOne 이미지 업로드

import React, { useEffect, useRef, useState } from 'react';

// 이미지 최대 9장, 서브 이미지 8장 대표이미지 1장
const MAX_SUB = 8;
const MAX_TOTAL = 1 + MAX_SUB;

type ImageUploaderProps = {
  images: File[];
  onChange: (nextImages: File[]) => void;
  mode?: 'multi' | 'single';
};

function ImageUploader({ images, onChange, mode = 'multi' }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 관리
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  // 파일 선택창 열기
  const handlePick = () => inputRef.current?.click();

  // 이미지 추가
  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // single 모드는 한 장만 유지
    const nextImages =
      mode === 'single' ? [files[0]] : [...images, ...files.slice(0, MAX_TOTAL - images.length)];

    onChange(nextImages);
    e.currentTarget.value = '';
  };

  // 이미지 삭제
  const handleRemove = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    onChange(nextImages);
  };

  // 추가 가능 여부
  const canAdd = mode === 'single' ? images.length < 1 : images.length < MAX_TOTAL;

  // 싱글 이미지
  if (mode === 'single') {
    return (
      <section className="flex flex-col gap-2 items-start">
        <label className="font-semibold text-lg text-gray-400 mb-1">프로필 이미지</label>
        <div className="relative w-[192px] h-[192px] rounded-full border-[3px] border-brand overflow-hidden flex items-center justify-center">
          {previews[0] ? (
            <>
              <img src={previews[0]} alt="프로필 이미지" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(0)}
                className="absolute top-2 right-2 bg-white rounded-full p-1"
              >
                <img src="/images/close_dark.svg" alt="삭제" className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center text-gray-400">
                <img src="/images/camera.svg" alt="camera" className="w-6 h-6" />
                <span className="mt-1 text-[12px] font-semibold text-brand">이미지 추가</span>
              </div>
              <button
                type="button"
                onClick={handlePick}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="프로필 이미지 업로드"
              />
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={false}
          onChange={handleAdd}
          className="hidden"
        />
      </section>
    );
  }
  // 멀티 생성용
  return (
    <section className="flex flex-col">
      <label className="font-semibold mb-2 text-lg">이미지 첨부</label>

      <div className="flex pl-[122px] gap-4">
        {/* 대표 이미지 */}
        <div className="relative w-[310px] h-[200px] border border-gray-300 rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
          {previews[0] ? (
            <>
              <img src={previews[0]} alt="대표 이미지" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(0)}
                className="absolute top-1 right-1"
              >
                <img src="/images/close_dark.svg" alt="삭제" className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <img src="/images/picture_dark.svg" alt="placeholder" />
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
            const idx = subIndex + 1;
            return (
              <div
                key={idx}
                className="relative w-[103px] h-[95px] border border-gray-300 rounded flex items-center justify-center text-gray-400 overflow-hidden"
              >
                <img
                  src={previews[idx]}
                  alt={`서브 이미지 ${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1"
                >
                  <img src="/images/close_dark.svg" alt="삭제" />
                </button>
              </div>
            );
          })}

          {/* 사진 추가 버튼 */}
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

      {/* 숨겨진 파일 입력기 */}
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
