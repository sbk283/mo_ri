import { useEffect, useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string; // 예: 'http://localhost:5173/groupdetail/5'
}

function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("링크 복사 실패:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose} // 바깥 클릭 시 닫기
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 */}
      <div
        className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭은 닫기 방지
      >
        <h2 className="mb-4 text-xl font-bold">공유하기</h2>

        {/* 링크 영역 */}
        <div className="space-y-2">
          <div className="flex items-center overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 select-all bg-white px-5 py-3 text-sm text-gray-800 outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-[#1a73e8] text-white text-xs font-semibold hover:bg-[#1765cb] transition-colors focus:outline-none rounded-full mr-1"
            >
              복사
            </button>
          </div>

          {/* 복사 완료 문구 */}
          <div className="min-h-[20px]">
            {copied && (
              <p className="text-sm font-medium text-blue-600 ml-1">
                링크가 복사되었습니다.
              </p>
            )}
          </div>
        </div>

        {/* 하단 구분선 */}
        {/* <div className="mt-2 border-b border-gray-300" /> */}

        {/* 닫기 버튼 */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
