// src/components/review/CreateReview.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import SuccessModal from './SuccessModal';

export type ReviewItem = {
  id: string;
  title: string;
  category: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  tags: string[];
};

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess?: (created: { review_id: string }) => void;
}

type TagDictRow = { tag_code: string; label: string };

type GroupInfo = {
  group_title: string | null;
  major_id: string | null;
  categories_major: { category_major_name: string };
};

type RawGroupRow = {
  group_title: string | null;
  major_id: string | null;
  categories_major?: { category_major_name: string } | null;
};

export default function CreateReview({ open, onClose, groupId, onSuccess }: CreateModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  // 글자수 제한 관련 상태
  const MAX_LENGTH = 500;
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [tagDict, setTagDict] = useState<TagDictRow[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 성공 모달 상태 & 타이머
  const [successOpen, setSuccessOpen] = useState(false);
  const successTimerRef = useRef<number | null>(null);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!open) return;
    setRating(5);
    setContent('');
    setCharCount(0);
    setSelectedCodes([]);
    setErrMsg(null);
    setSubmitting(false);
    setSuccessOpen(false);
  }, [open]);

  // ====== 그룹 정보 & 태그 로드 부분은 생략 (그대로 유지) ======
  useEffect(() => {
    if (!open || !groupId) return;

    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          group_title,
          major_id,
          categories_major:major_id!inner (
            category_major_name
          )
        `,
        )
        .eq('group_id', groupId)
        .single();

      if (error) {
        console.error('[CreateReview] load group info error', error);
        return;
      }
      if (ignore) return;

      const row = data as unknown as RawGroupRow;
      const mapped: GroupInfo = {
        group_title: row.group_title ?? null,
        major_id: row.major_id ?? null,
        categories_major: {
          category_major_name: row.categories_major?.category_major_name ?? '기타',
        },
      };
      setGroupInfo(mapped);
    })();

    return () => {
      ignore = true;
    };
  }, [open, groupId]);

  useEffect(() => {
    if (!open) return;

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
      setTagDict(data ?? []);
    })();

    return () => {
      ignore = true;
    };
  }, [open]);

  // 500자 입력 제한 로직
  const handleChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTH) {
      setContent(val);
      setCharCount(val.length);
    }
  };

  // ======= 제출 처리 (기존 그대로) =======
  const hasMeaningfulText = (s: string) => /\S/.test(s);

  const handleSubmit = async () => {
    if (!hasMeaningfulText(content)) {
      setErrMsg('후기 내용을 입력해주세요.');
      return;
    }
    if (submitting || successOpen) return;
    setSubmitting(true);
    setErrMsg(null);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) throw new Error('로그인이 필요합니다.');
      const uid = userRes.user.id;

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

      if (selectedCodes.length > 0) {
        const payload = selectedCodes.map(code => ({ review_id, tag_code: code }));
        const { error: tagErr } = await supabase.from('group_review_tags').insert(payload);
        if (tagErr) throw tagErr;
      }

      setSuccessOpen(true);
      successTimerRef.current = window.setTimeout(() => {
        setSuccessOpen(false);
        onSuccess?.({ review_id });
        onClose();
        setRating(5);
        setContent('');
        setCharCount(0);
        setSelectedCodes([]);
      }, 2000);
    } catch (e: any) {
      console.error('[CreateReview] submit error', e);
      setErrMsg(e?.message ?? '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const groupTitle = groupInfo?.group_title ?? '(제목 없음)';
  const categoryName = groupInfo?.categories_major?.category_major_name ?? '기타';

  return (
    <>
      <SuccessModal
        isOpen={successOpen}
        message="등록이 완료되었습니다!"
        onClose={() => {
          if (successTimerRef.current) {
            window.clearTimeout(successTimerRef.current);
            successTimerRef.current = null;
          }
          setSuccessOpen(false);
          onClose();
        }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-[990]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!submitting && !successOpen) onClose();
            }}
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
                    <label className="text-xl font-semibold mr-3">{groupTitle}</label>
                    <span className="text-white bg-brand-red h-[28px] text-md px-2 py-1 rounded-sm">
                      {categoryName}
                    </span>
                  </div>

                  {/* 별점 */}
                  <div className="flex items-center gap-2 leading-normal mt-6">
                    <span className="mr-5 text-md font-semibold">별점</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                        className="focus:outline-none"
                        disabled={submitting || successOpen}
                      >
                        <img
                          src={n <= rating ? '/images/star_gold.svg' : '/images/star_dark.svg'}
                          alt={`${n}점`}
                          className="w-6 h-6"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 해시태그 선택 */}
                <div className="my-6">
                  <label className="block text.sm font-semibold mb-3">해시태그 선택</label>
                  <div className="flex flex-wrap gap-3">
                    {tagDict.length === 0 ? (
                      <p className="text-gray-400 text-sm">태그를 불러오는 중...</p>
                    ) : (
                      tagDict.map(tag => (
                        <button
                          key={tag.tag_code}
                          type="button"
                          onClick={() =>
                            setSelectedCodes(prev =>
                              prev.includes(tag.tag_code)
                                ? prev.filter(c => c !== tag.tag_code)
                                : [...prev, tag.tag_code],
                            )
                          }
                          className={`text-md px-2 py-2 rounded-sm border font-semibold leading-none ${
                            selectedCodes.includes(tag.tag_code)
                              ? 'bg-white text-[#0689E8] border-[#0689E8]'
                              : 'bg-white text-[#6C6C6C] border-[#6C6C6C]'
                          }`}
                          disabled={submitting || successOpen}
                        >
                          # {tag.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* 리뷰 내용 (500자 제한 + 카운터 표시) */}
                <div className="my-6">
                  <label className="block mb-2 text-sm font-semibold">어떤 점이 좋았나요?</label>
                  <textarea
                    className="w-full border border-[#A3A3A3] rounded-sm p-3 h-[145px] resize-none overflow-y-auto focus:outline-none focus:border-blue-500"
                    placeholder="모임의 어떤 점이 좋았는지 적어주세요. (최대 500자)"
                    value={content}
                    onChange={handleChangeContent}
                    maxLength={MAX_LENGTH}
                    disabled={submitting || successOpen}
                  />
                  <div
                    className={`text-right text-xs mt-1 ${
                      charCount >= MAX_LENGTH ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    {charCount}/{MAX_LENGTH}자
                  </div>
                </div>

                {errMsg && <p className="text-red-600 text-sm mb-3">{errMsg}</p>}

                {/* 버튼 */}
                <div className="flex gap-[17px] justify-center">
                  <button
                    type="button"
                    disabled={submitting || successOpen}
                    className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] border border-[#0689E8] text-[#0689E8] rounded-sm hover:bg-blue-50 transition-colors disabled:opacity-60"
                    onClick={() => {
                      if (!successOpen) onClose();
                    }}
                  >
                    취소하기
                  </button>
                  <button
                    type="button"
                    disabled={submitting || successOpen}
                    className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] bg-[#0689E8] text-white rounded-sm hover:bg-[#0577c9] transition-colors disabled:opacity-60"
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
    </>
  );
}
