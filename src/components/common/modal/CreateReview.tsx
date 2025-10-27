// src/components/review/CreateReview.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

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

// INNER JOIN 전제: categories_major는 반드시 존재(런타임). TS에선 안전 캐스팅/가드.
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
  const [content, setContent] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  const [tagDict, setTagDict] = useState<TagDictRow[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 그룹 정보 조회 (INNER JOIN + single)
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

      // ✅ null 가드 추가 (빨간줄 원인 제거)
      if (!data) {
        console.warn('[CreateReview] no group row returned');
        setGroupInfo(null);
        return;
      }

      const row = data as unknown as RawGroupRow;

      if (!row.categories_major) {
        // RLS/데이터 무결성 이슈 방어
        console.warn('[CreateReview] categories_major missing (check RLS/FK)');
        setGroupInfo({
          group_title: row.group_title ?? null,
          major_id: row.major_id ?? null,
          categories_major: { category_major_name: '기타' },
        });
        return;
      }

      const mapped: GroupInfo = {
        group_title: row.group_title ?? null,
        major_id: row.major_id ?? null,
        categories_major: { category_major_name: row.categories_major.category_major_name },
      };
      setGroupInfo(mapped);
    })();

    return () => {
      ignore = true;
    };
  }, [open, groupId]);

  // 태그 사전 로드
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

  const toggleByCode = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code],
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setErrMsg('후기 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setErrMsg(null);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) throw new Error('로그인이 필요합니다.');
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

      // 2) 태그 매핑 insert
      if (selectedCodes.length > 0) {
        const payload = selectedCodes.map(code => ({ review_id, tag_code: code }));
        const { error: tagErr } = await supabase.from('group_review_tags').insert(payload);
        if (tagErr) throw tagErr;
      }

      onSuccess?.({ review_id });
      onClose();

      // 초기화
      setRating(5);
      setContent('');
      setSelectedCodes([]);
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!submitting) onClose();
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
                  <span className="text-white bg-[#D83737] h-[28px] text-md px-2 py-1 rounded-sm">
                    {categoryName}
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
                      disabled={submitting}
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

              {/* 해시태그 선택 */}
              <div className="my-6">
                <label className="block text-sm font-semibold mb-3">해시태그 선택</label>
                <div className="flex flex-wrap gap-3">
                  {tagDict.length === 0 ? (
                    <p className="text-gray-400 text-sm">태그를 불러오는 중...</p>
                  ) : (
                    tagDict.map(tag => (
                      <button
                        key={tag.tag_code}
                        type="button"
                        onClick={() => toggleByCode(tag.tag_code)}
                        className={`px-[11px] py-[7px] rounded-sm border transition-colors font-semibold leading-none ${
                          selectedCodes.includes(tag.tag_code)
                            ? 'bg-white text-[#0689E8] border-[#0689E8]'
                            : 'bg-white text-[#6C6C6C] border-[#6C6C6C]'
                        }`}
                        disabled={submitting}
                      >
                        # {tag.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="my-6">
                <label className="block mb-2 text-sm font-semibold">어떤 점이 좋았나요?</label>
                <textarea
                  className="w-full border border-[#A3A3A3] rounded-sm p-3 min-h-[145px] focus:outline-none focus:border-blue-500"
                  placeholder="모임의 어떤 점이 좋았는지 적어주세요."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={submitting}
                />
              </div>

              {/* 에러 */}
              {errMsg && <p className="text-red-600 text-sm mb-3">{errMsg}</p>}

              {/* 버튼 */}
              <div className="flex gap-[17px] justify-center">
                <button
                  type="button"
                  disabled={submitting}
                  className="max-w-[154px] h-[46px] px-4 py-3 flex-1 text-[17px] border border-[#0689E8] text-[#0689E8] rounded-sm hover:bg-blue-50 transition-colors disabled:opacity-60"
                  onClick={onClose}
                >
                  취소하기
                </button>
                <button
                  type="button"
                  disabled={submitting}
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
  );
}
