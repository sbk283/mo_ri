import { useEffect, useState } from 'react';
import type { groups } from '../types/group';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

type GroupWithCategory = groups & {
  categories_major?: { category_major_name: string; category_major_slug: string };
  categories_sub?: { category_sub_name: string; category_sub_slug: string };
  created_by?: { name: string; nickname: string };
};

function PendingGroupsList() {
  const [pendingGroups, setPendingGroups] = useState<GroupWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingGroups = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select(
            `
              *,
               created_by: user_profiles(name, nickname),
              categories_major ( category_major_name, category_major_slug ),
              categories_sub ( category_sub_name, category_sub_slug )
            `,
          )
          .eq('approved', false)
          .order('group_created_at', { ascending: false });

        if (error) throw error;
        setPendingGroups((data as GroupWithCategory[]) ?? []);
      } catch (err) {
        console.error('🔥 승인 대기 그룹 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGroups();
  }, []);

  // 승인 완료
  const handleApprove = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ approved: true })
        .eq('group_id', groupId)
        .select();

      if (error) throw error;

      // console.log('승인 완료 DB 반영:', data);
      setPendingGroups(prev => prev.filter(group => group.group_id !== groupId));
      alert('모임이 승인되었습니다.');
    } catch (err) {
      console.error('🔥 승인 실패:', err);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 승인 거부
  const handleReject = async (groupId: string) => {
    if (!confirm('정말 이 모임 신청을 거부하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('groups').delete().eq('group_id', groupId);

      if (error) throw error;

      setPendingGroups(prev => prev.filter(group => group.group_id !== groupId));
      alert('모임 신청이 거부되었습니다.');
    } catch (err) {
      console.error('🔥 거부 실패:', err);
      alert('거부 처리 중 오류가 발생했습니다.');
    }
  };
  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : pendingGroups.length === 0 ? (
        <div className="border border-gray-300 p-4 rounded-sm shadow-sm">
          <p>승인 대기 중인 모임이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingGroups.map(group => (
            <div key={group.group_id} className="border border-gray-300 p-4 rounded-sm shadow-sm ">
              <div className="flex gap-40 mb-2 flex-wrap">
                <div>
                  <label className="font-medium text-md text-brand">모임생성 신청자 : </label>
                  <span className="text-md font-semibold text-gray-400">
                    {group.created_by?.name || '알 수 없음'}
                  </span>
                </div>
                <div>
                  <label className="font-medium text-md  text-brand">모임 카테고리 : </label>
                  <span className="text-md font-semibold text-gray-400">
                    {group.categories_major?.category_major_name} {'>'}{' '}
                    {group.categories_sub?.category_sub_name}
                  </span>
                </div>
              </div>

              <div className=" ">
                <div className="mb-2">
                  <label className="font-medium text-md text-brand">모임 이름 : </label>
                  <span className="text-md font-semibold text-gray-400">{group.group_title}</span>
                </div>
                <div>
                  <label className="font-medium text-md  text-brand">모임 소개 : </label>
                  <span className="text-md font-semibold text-gray-400">
                    {group.group_short_intro}
                  </span>
                </div>
                {/* 그룹 이미지 */}
                {group.image_urls && group.image_urls.length > 0 && (
                  <div className="mb-3 mt-6">
                    <label className="font-semibold block mb-3 text-md">
                      모임 썸네일 이미지
                      <span className="font-medium text-gray-200 text-sm">
                        {'  '}
                        (클릭 시 확인 가능)
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-2 border-t p-2">
                      {group.image_urls.map((url, idx) => {
                        const fileUrl = url.startsWith('http')
                          ? url
                          : `https://eetunrwteziztszaezhd.supabase.co/storage/v1/object/public/${url}`;
                        const fileName = fileUrl.split('/').pop();

                        return (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center mt-1 bg-white border border-gray-300 p-1 rounded hover:bg-gray-50 transition-colors"
                            title={fileName}
                          >
                            <img src="/images/file_blue.svg" alt="파일" className="mr-2 w-4 h-4" />
                            <span className="truncate max-w-[100px] text-[10px]">{fileName}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="font-semibold text-md ">모임 커리큘럼 상세 내용</label>
                <div className=" p-2 border-t mt-3">
                  {group.curriculum
                    ? (() => {
                        try {
                          const curriculumData =
                            typeof group.curriculum === 'string'
                              ? JSON.parse(group.curriculum)
                              : group.curriculum;

                          return Array.isArray(curriculumData)
                            ? curriculumData.map(
                                (
                                  item: { title: string; detail: string; files?: string[] },
                                  index: number,
                                ) => (
                                  <div key={index} className="mb-3">
                                    <strong className="text-brand">
                                      {index + 1} .{''}
                                      <span className="text-black font-bold">{item.title} :</span>
                                    </strong>
                                    {item.detail}
                                    {/* 커리큘럼 내부 이미지 */}
                                    {item.files && item.files.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {item.files.map((url, i) => (
                                          <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center mt-1 bg-white border border-gray-300 p-1 rounded hover:bg-gray-50 transition-colors"
                                            title={url.split('/').pop()}
                                          >
                                            <img
                                              src="/images/file_blue.svg"
                                              alt="파일"
                                              className="mr-2 w-4 h-4"
                                            />
                                            <span className="truncate max-w-[100px] text-[10px]">
                                              {url.split('/').pop()}
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ),
                              )
                            : '커리큘럼 형식 오류';
                        } catch {
                          return '커리큘럼 파싱 오류';
                        }
                      })()
                    : '커리큘럼 없음'}
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={() => handleApprove(group.group_id)}
                  className="px-4 py-2 bg-brand rounded-sm text-sm font-medium text-white hover:bg-[#046cb6] transition-colors"
                >
                  승인 완료
                </button>
                <button
                  onClick={() => handleReject(group.group_id)}
                  className="px-4 py-2 bg-brand-red rounded-sm text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  승인 거부
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingGroupsList;
