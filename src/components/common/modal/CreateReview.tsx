// src/components/review/CreateReview.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export type ReviewItem = {
  id: string;
  title: string;
  category: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  tags: string[]; // UI 표기용 라벨 배열
};

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  review: ReviewItem;
  onSuccess?: (created: { review_id: string }) => void;
}

type TagDictRow = { tag_code: string; label: string };

export default function CreateReview({
  open,
  onClose,
  groupId,
  review,
  onSuccess,
}: CreateModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(review.rating);
  const [content, setContent] = useState(review.content);

  // 태그 사전 로드
  const [tagDict, setTagDict] = useState<TagDictRow[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  // 코드 -> 라벨 (UI 표시)
  const labelByCode = useMemo(
    () => Object.fromEntries(tagDict.map(t => [t.tag_code, t.label])),
    [tagDict],
  );
  // 라벨 -> 코드 (초기값 세팅, 라벨을 코드로 변환)
  const codeByLabel = useMemo(
    () => Object.fromEntries(tagDict.map(t => [t.label, t.tag_code])),
    [tagDict],
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from('review_tag_dict')
        .select('tag_code,label')
        .order('label', { ascending: true });

      if (error) {
        console.error('[CreateReview] load tag dict error', error);
        return;
      }
      if (ignore) return;

      const dict = data ?? [];
      setTagDict(dict);

      // 라벨 배열(review.tags)을 코드 배열로 변환해서 초기 선택에 반영
      const initialCodes = (review.tags ?? [])
        .map(label => codeByLabel[label])
        .filter((c): c is string => !!c);

      setSelectedCodes(initialCodes);
    })();

    return () => {
      ignore = true;
    };
    // review.tags가 바뀌면 초기값 재계산
  }, [review.tags, codeByLabel]);

  const toggleByCode = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code],
    );
  };

  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrMsg(null);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error('로그인이 필요합니다.');
      const uid = userRes.user.id;

      // 1) 리뷰 본문 insert
      const { data: reviewRow, error: insErr } = await supabase
        .from('group_reviews')
        .insert({
          group_id: groupId,
          author_id: uid,
          rating,
          pros_text: content,
        })
        .select('review_id')
        .single();

      if (insErr) throw insErr;
      const review_id = reviewRow.review_id as string;

      // 2) 태그 매핑 벌크 insert
      if (selectedCodes.length > 0) {
        const payload = selectedCodes.map(code => ({ review_id, tag_code: code }));
        const { error: tagErr } = await supabase.from('group_review_tags').insert(payload);
        if (tagErr) throw tagErr;
      }

      onSuccess?.({ review_id });
      onClose();
    } catch (e: any) {
      console.error('[CreateReview] submit error', e);
      setErrMsg(e?.message ?? '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-sm w-[590px] h-[740px] overflow-y-auto border-[#B7B7B7] border"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="py-8 px-[50px]">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <h2 className="text-xxl font-[600] text-[#0689E8]">모임이 종료되었어요!</h2>
                <p className="mt-2 text-md">여러분의 후기가 다른 사용자에게 큰 도움이 됩니다.</p>
              </div>

              <div className="border border-[#6C6C6C] mb-8"></div>

              {/* 제목/카테고리 + 별점 */}
              <div className="my-6">
                <div className="flex items-center">
                  <label className="text-xl font-semibold mr-3">{review.title}</label>
                  <span className="text-white bg-[#D83737] h-[28px] text-md px-2 py-1 rounded-sm">
                    {review.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 leading-normal mt-6">
                  <span className="mr-5 text-md font-semibold">별점</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className="focus:outline-none"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className={`w-6 h-6 ${n <= rating ? 'fill-amber-400' : 'fill-gray-300'}`}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.1 3.38a1 1 0 0 0 .95.69h3.552c.967 0 1.371 1.24.588 1.81l-2.874 2.09a1 1 0 0 0-.364 1.118l1.1 3.38c.3.921-.755 1.688-1.54 1.118l-2.874-2.09a1 1 0 0 0-1.176 0l-2.874 2.09c-.785.57-1.84-.197-1.54-1.118l1.1-3.38a1 1 0 0 0-.364-1.118L1.86 8.807c-.783-.57-.379-1.81.588-1.81h3.552a1 1 0 0 0 .95-.69l1.1-3.38z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* 해시태그 선택 (라벨 표시, 내부값은 코드) */}
              <div className="my-6">
                <label className="block text-sm font-semibold mb-3">해시태그 선택</label>
                <div className="flex flex-wrap gap-3">
                  {tagDict.map(tag => (
                    <button
                      key={tag.tag_code}
                      type="button"
                      onClick={() => toggleByCode(tag.tag_code)}
                      className={`px-[11px] py-[7px] rounded-sm border transition-colors font-semibold leading-none ${
                        selectedCodes.includes(tag.tag_code)
                          ? 'bg-white text-[#0689E8] border-[#0689E8]'
                          : 'bg-white text-[#6C6C6C] border-[#6C6C6C]'
                      }`}
                    >
                      # {tag.label}
                    </button>
                  ))}
                </div>

                {/* 선택 미리보기: 코드 -> 라벨 변환 사용 */}
                {selectedCodes.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    선택: {selectedCodes.map(c => `# ${labelByCode[c] ?? c}`).join(' ')}
                  </div>
                )}
              </div>

              {/* 리뷰 내용 */}
              <div className="my-6">
                <label className="block mb-2 text-sm font-semibold">어떤 점이 좋았나요?</label>
                <textarea
                  className="w-full border border-[#A3A3A3] rounded-sm p-3 min-h-[145px] focus:outline-none focus:border-blue-500"
                  placeholder="모임의 어떤 점이 좋았는지 적어주세요."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              {/* 에러 */}
              {errMsg && <p className="text-red-600 text-sm mb-3">{errMsg}</p>}

              {/* 버튼 */}
              <div className="flex gap-[17px] justify-center">
                <button
                  type="button"
                  disabled={submitting}
                  className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] border border-[#0689E8] text-[#0689E8] rounded-sm disabled:opacity-60"
                  onClick={onClose}
                >
                  취소하기
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] bg-[#0689E8] text-white rounded-sm disabled:opacity-60"
                  onClick={handleSubmit}
                >
                  {submitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
