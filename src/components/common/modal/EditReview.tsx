import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export type GroupReview = {
  id: number;
  title: string;
  category: string;
  status: '진행중' | '종료';
  rating: 1 | 2 | 3 | 4 | 5;
  period: string;
  content: string;
  tags: string[];
};

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updatedReview: Partial<GroupReview>) => void;
  review: GroupReview;
}

function EditReview({ open, onClose, onConfirm, review }: EditModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(review.rating);
  const [content, setContent] = useState(review.content);
  const [selectedTags, setSelectedTags] = useState<string[]>(review.tags);

  const availableTags = [
    '강력추천',
    '다같이활동',
    '알찬커리큘럼',
    '재참여하고싶어요',
    '좋은분위기',
    '초보자추천',
    '전문적인운영',
    '친절한모임장',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = () => {
    onConfirm({
      rating,
      content,
      tags: selectedTags,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-[5px] w-[590px] h-[740px] overflow-y-auto border-[#B7B7B7] border"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="py-8 px-[50px]">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <h2 className="text-[28px] font-[600] text-[#0689E8]">모임이 종료되었어요!</h2>
                <p className="mt-2 font-[15px]">
                  여러분의 후기가 다른 사용자에게 큰 도움이 됩니다.
                </p>
              </div>

              <div className="border border-[#6C6C6C] mb-8"></div>
              {/* 별점 */}
              <div className="my-6">
                <div className="flex items-center">
                  <label className="text-[20px] font-semibold mr-3 ">{review.title}</label>
                  <span className="text-white bg-[#D83737] h-[28px] text-[15px] px-2 py-1 rounded-[5px]">
                    {review.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 leading-normal mt-6">
                  <span className="mr-5 text-[15px] font-semibold ">별점</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className="focus:outline-none "
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className={`w-6 h-6 gap-1 ${n <= rating ? 'fill-amber-400' : 'fill-gray-300'}`}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.1 3.38a1 1 0 0 0 .95.69h3.552c.967 0 1.371 1.24.588 1.81l-2.874 2.09a1 1 0 0 0-.364 1.118l1.1 3.38c.3.921-.755 1.688-1.54 1.118l-2.874-2.09a1 1 0 0 0-1.176 0l-2.874 2.09c-.785.57-1.84-.197-1.54-1.118l1.1-3.38a1 1 0 0 0-.364-1.118L1.86 8.807c-.783-.57-.379-1.81.588-1.81h3.552a1 1 0 0 0 .95-.69l1.1-3.38z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* 해시태그 선택 */}
              <div className="my-6">
                <label className="block text-sm font-semibold mb-3">해시태그 선택</label>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-[11px] py-[7px] rounded-[5px] border transition-colors font-[600] ${
                        selectedTags.includes(tag)
                          ? 'bg-white text-[#0689E8] border-[#0689E8]'
                          : 'bg-white text-[#6C6C6C] border-[#6C6C6C]'
                      }`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="my-6">
                <label className="block mb-2 text-[15px] font-[600]">어떤 점이 좋았나요?</label>
                <textarea
                  className="w-full border border-[#A3A3A3] rounded-[5px] p-3 min-h-[145px] x-[490px] focus:outline-none focus:border-blue-500"
                  placeholder="모임 관리자분께서 잘못을 잘 조해주셔서, 좋았어요."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-[17px] justify-center">
                <button
                  type="button"
                  className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] border border-[#0689E8] text-[#0689E8] rounded-[5px] hover:bg-blue-50 transition-colors"
                  onClick={onClose}
                >
                  취소하기
                </button>
                <button
                  type="button"
                  className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] bg-[#0689E8] text-white rounded-[5px] hover:bg-[#0689E8] transition-colors"
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
