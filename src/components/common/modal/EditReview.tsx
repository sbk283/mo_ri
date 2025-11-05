// src/components/common/modal/EditReview.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ReviewItem } from "../ReviewCard";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updatedReview: Partial<ReviewItem>) => void;
  review: ReviewItem;
}

const MAX_CONTENT_LENGTH = 500;

function EditReview({ open, onClose, onConfirm, review }: EditModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(review.rating);
  const [content, setContent] = useState(review.content);
  const [selectedTags, setSelectedTags] = useState<string[]>(review.tags);

  // 모달이 열릴 때마다 원본(review) 값으로 초기화
  useEffect(() => {
    if (!open) return;
    setRating(review.rating);
    setContent(review.content);
    setSelectedTags(review.tags);
  }, [open, review]);

  const availableTags = [
    "초보자 추천",
    "좋은 분위기",
    "알찬 커리큘럼",
    "친절한 모임장",
    "전문적인 운영",
    "재참여 하고싶어요",
    "다양한 활동",
    "강력 추천",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = () => {
    onConfirm({
      rating,
      content,
      tags: selectedTags,
    });
  };

  // 취소: 편집 상태를 원본으로 되돌리고 닫기
  const handleCancel = () => {
    setRating(review.rating);
    setContent(review.content);
    setSelectedTags(review.tags);
    onClose();
  };

  const handleContentChange = (value: string) => {
    // 500글자 이상은 잘라서 저장
    const next = value.slice(0, MAX_CONTENT_LENGTH);
    setContent(next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel(); // 오버레이 클릭도 취소로 동작
          }}
        >
          <motion.div
            className="bg-white rounded-sm w-[590px] h-[740px] overflow-y-auto border-[#B7B7B7] border"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-8 px-[50px]">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <h2 className="text-xxl font-[600] text-[#0689E8]">
                  모임이 종료되었어요!
                </h2>
                <p className="mt-2 text-md">
                  여러분의 후기가 다른 사용자에게 큰 도움이 됩니다.
                </p>
              </div>

              <div className="border border-[#6C6C6C] mb-8" />

              {/* 제목/카테고리 + 별점 */}
              <div className="my-6">
                <div className="flex items-center">
                  <label className="text-xl font-semibold mr-3 ">
                    {review.title}
                  </label>
                  <span className="text-white bg-brand-red h-[28px] text-md px-2 py-1 rounded-sm">
                    {review.category}
                  </span>
                </div>

                {/* 별점 */}
                <div className="flex items-center gap-2 leading-normal mt-6">
                  <span className="mr-5 text-md font-semibold">별점</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className="focus:outline-none "
                      aria-label={`${n}점 주기`}
                    >
                      <img
                        src={
                          n <= rating
                            ? "/images/star_gold.svg"
                            : "/images/star_dark.svg"
                        }
                        alt={n <= rating ? `${n}점` : `${n}점 미만`}
                        className="w-6 h-6"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 해시태그 선택 */}
              <div className="my-6">
                <label className="block text-sm font-semibold mb-3">
                  해시태그 선택
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-md px-[11px] py-[7px] rounded-sm border transition-colors font-semibold leading-none ${
                        selectedTags.includes(tag)
                          ? "bg-white text-[#0689E8] border-[#0689E8]"
                          : "bg-white text-[#6C6C6C] border-[#6C6C6C]"
                      }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="my-6">
                <label className="block mb-2 text-sm font-semibold">
                  어떤 점이 좋았나요?
                </label>
                <textarea
                  className="w-full border border-[#A3A3A3] rounded-sm p-3 h-[145px] min-h-[145px] max-h-[145px] resize-none overflow-y-auto focus:outline-none focus:border-blue-500"
                  placeholder="모임의 어떤 점이 좋았는지 적어주세요."
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                />
                <div className="mt-1 text-right text-xs text-[#8C8C8C]">
                  {content.length}/{MAX_CONTENT_LENGTH}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-10 justify-center">
                <button
                  type="button"
                  className="max-w-[154px] h-[46px] px-4 flex-1 text-[17px] border border-[#0689E8] text-[#0689E8] rounded-sm hover:bg-blue-50 transition-colors"
                  onClick={handleCancel}
                >
                  취소하기
                </button>
                <button
                  type="button"
                  className="max-w-[154px] h-[46px] px-4 flex-1 text-[17px] bg-[#0689E8] text-white rounded-sm hover:bg-[#0689E8] transition-colors"
                  onClick={handleSubmit}
                >
                  등록하기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EditReview;
