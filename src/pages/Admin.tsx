import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { groups } from '../types/group';

type GroupWithCategory = groups & {
  categories_major?: { category_major_name: string; category_major_slug: string };
  categories_sub?: { category_sub_name: string; category_sub_slug: string };
  created_by?: { name: string; nickname: string };
};

function Admin() {
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

      console.log('승인 완료 DB 반영:', data);
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

  // 파일명 추출 함수
  const extractFileName = (path: string, originalName?: string): string => {
    if (originalName) return originalName;

    const pathFileName = path.split('/').pop() || '';

    // 파일명이 ".확장자"만 있거나 너무 짧은 경우
    if (pathFileName.startsWith('.') || pathFileName.length < 3) {
      const pathParts = path.split('/');
      const groupId = pathParts[pathParts.length - 2] || 'unknown';
      return `image_${groupId.slice(0, 8)}${pathFileName}`;
    }

    // URL 디코딩 시도
    try {
      return decodeURIComponent(pathFileName);
    } catch {
      return pathFileName;
    }
  };

  return (
    <div>
      <div className="h-[150px]" />
      <div className="m-auto mb-[100px] border border-gray-300 w-[1024px] rounded-sm p-8 shadow-card">
        <div className="mb-5 font-semibold text-xxl text-brand">관리자 페이지</div>

        <div className="mb-10 flex gap-5">
          <div className="font-semibold text-lg text-gray-800">모임생성 신청 목록</div>
          <div className="font-semibold text-lg text-gray-400">문의 내역 목록</div>
          <div className="font-semibold text-lg text-gray-400">회원 탈퇴 목록</div>
        </div>

        <div className="border border-gray-300 p-4 rounded-sm">
          {loading ? (
            <p>로딩 중...</p>
          ) : pendingGroups.length === 0 ? (
            <p>승인 대기 중인 모임이 없습니다.</p>
          ) : (
            pendingGroups.map(group => (
              <div
                key={group.group_id}
                className="border-b border-gray-200 mb-4 pb-4 last:border-b-0"
              >
                <div className="flex gap-20 mb-2 flex-wrap">
                  <div>
                    <label className="font-medium">모임 생성 신청자: </label>
                    <span>{group.created_by?.name || '알 수 없음'}</span>
                  </div>
                  <div>
                    <label className="font-medium">모임 이름: </label>
                    <span>{group.group_title}</span>
                  </div>
                  <div>
                    <label className="font-medium">모임 카테고리: </label>
                    <span>
                      {group.categories_major?.category_major_name} {'>'}{' '}
                      {group.categories_sub?.category_sub_name}
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="font-medium">모임 소개: </label>
                  <span>{group.group_short_intro}</span>
                </div>

                <div className="mb-3">
                  <label className="font-medium block mb-1">모임 커리큘럼 상세 내용</label>
                  <div className="ml-4 bg-gray-50 p-2 rounded">
                    {group.curriculum
                      ? (() => {
                          try {
                            const curriculumData =
                              typeof group.curriculum === 'string'
                                ? JSON.parse(group.curriculum)
                                : group.curriculum;

                            return Array.isArray(curriculumData)
                              ? curriculumData.map(
                                  (item: { title: string; detail: string }, index: number) => (
                                    <div key={index} className="mb-1">
                                      <strong>{item.title}:</strong> {item.detail}
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

                {/* 포함된 이미지들 */}
                {group.image_urls && group.image_urls.length > 0 && (
                  <div className="mb-3">
                    <label className="font-medium block mb-1">포함된 이미지</label>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          let files: { path: string; originalName?: string }[] = [];
                          let parsed: any = group.image_urls;

                          if (typeof parsed === 'string') {
                            parsed = JSON.parse(parsed);
                          }

                          if (Array.isArray(parsed)) {
                            files = parsed
                              .map(item => {
                                if (typeof item === 'string') {
                                  try {
                                    const obj = JSON.parse(item);
                                    if (obj && obj.path) return obj;
                                  } catch {
                                    return { path: item };
                                  }
                                } else if (typeof item === 'object' && item !== null) {
                                  return item;
                                }
                                return null;
                              })
                              .filter(Boolean) as { path: string; originalName?: string }[];
                          }

                          return files.map((file, idx) => {
                            const fileUrl = file.path.startsWith('http')
                              ? file.path
                              : (() => {
                                  const pathParts = file.path.split('/');
                                  const encodedPath = pathParts
                                    .map(part => encodeURIComponent(part))
                                    .join('/');
                                  return `https://eetunrwteziztszaezhd.supabase.co/storage/v1/object/public/group-post-images/${encodedPath}`;
                                })();

                            const fileName = extractFileName(file.path, file.originalName);

                            return (
                              <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center bg-white border border-gray-300 p-2 rounded hover:bg-gray-50 transition-colors"
                                title={fileName}
                              >
                                <img
                                  src="/images/file_blue.svg"
                                  alt="파일"
                                  className="mr-2 w-4 h-4"
                                />
                                <span className="truncate max-w-[200px] text-sm">{fileName}</span>
                              </a>
                            );
                          });
                        } catch (e) {
                          console.warn('이미지 파싱 오류:', e);
                          return <span className="text-red-500 text-sm">이미지 로드 실패</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(group.group_id)}
                    className="px-4 py-2 bg-brand rounded-sm text-sm font-medium text-white hover:bg-brand-dark transition-colors"
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
