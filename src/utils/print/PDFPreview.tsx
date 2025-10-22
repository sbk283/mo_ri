import type { GroupWithCategory } from '../../types/group';

interface PDFPreviewProps {
  items: GroupWithCategory[];
  profile: { name: string; email: string } | null;
  isFirstPage?: boolean;
}

export default function PDFPreview({ items, profile, isFirstPage = true }: PDFPreviewProps) {
  return (
    <div className="p-10 w-full max-w-[210mm] box-border bg-white">
      {isFirstPage && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1">모임 참여 이력 증명서</h1>
            <p className="text-sm">출력일: {new Date().toLocaleDateString()}</p>
          </div>

          {/* 프로필 정보 */}
          <div className="p-4 border-b border-gray-200 mb-6">
            <h2 className="text-lg font-semibold mb-4">프로필 정보</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex">
                <span className="font-semibold w-20">성명</span>
                <span>{profile?.name ?? '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-20">이메일</span>
                <span>{profile?.email ?? '-'}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 모임 참여 이력 */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">모임 참여 이력</h2>
        <div className="grid grid-cols-[25%_50%_25%] font-semibold text-center border-b-2 border-gray-200 pb-2 mb-2">
          <div>모임 기간</div>
          <div>모임 이름</div>
          <div>모임 분류</div>
        </div>

        <div className="flex flex-col">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex border-b border-gray-200 py-2 text-center items-center"
            >
              <div className="w-1/4 text-sm">
                {item.group_start_day} ~ {item.group_end_day}
              </div>
              <div className="w-1/2 font-semibold">{item.group_title}</div>
              <div className="w-1/4 font-semibold break-words">
                {item.categories_major?.category_major_name ?? '-'} &gt;{' '}
                {item.categories_sub?.category_sub_name ?? '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모임 세부 정보 */}
      <div className="p-4">
        <div className="text-lg font-semibold mb-4">모임 세부 정보</div>
        {items.map((item, index) => (
          <div key={index} className="border rounded-sm mb-5 p-3 page-break-inside-avoid">
            <div className="flex justify-between pb-4">
              <div className="flex gap-x-4">
                <span className="font-semibold">모임기간 :</span>
                <span>
                  {item.group_start_day} ~ {item.group_end_day}
                </span>
              </div>
              <div className="flex gap-x-4">
                <span className="font-semibold">모임 분류 :</span>
                <span>
                  {item.categories_major?.category_major_name ?? '-'} &gt;{' '}
                  {item.categories_sub?.category_sub_name ?? '-'}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-3"></div>

            <div className="flex gap-x-4 pb-4">
              <span className="font-semibold">모임 이름 :</span>
              <span className="font-semibold">{item.group_title}</span>
            </div>

            <div className="border-b border-gray-200 mb-3"></div>

            <div className="pb-4">
              <span className="font-semibold">커리큘럼 :</span>
              <div className="ml-5 mt-2">
                {(() => {
                  // curriculum이 없거나 null인 경우
                  if (!item.curriculum) {
                    return <div className="text-gray-400">커리큘럼 없음</div>;
                  }

                  let curriculumArray: { title?: string; detail?: string }[] = [];

                  try {
                    // jsonb는 이미 파싱된 객체로 올 수도 있고, 문자열로 올 수도 있음
                    let parsed = item.curriculum;

                    if (typeof item.curriculum === 'string') {
                      parsed = JSON.parse(item.curriculum);
                    }

                    if (Array.isArray(parsed)) {
                      curriculumArray = parsed
                        .filter(
                          (c): c is { title?: string; detail?: string; files?: any } =>
                            typeof c === 'object' && c !== null,
                        )
                        .map(c => ({
                          title: c.title ?? '-',
                          detail: c.detail ?? '-',
                        }));
                    }
                  } catch (e) {
                    console.error('커리큘럼 파싱 에러:', e);
                    return <div className="text-gray-400">커리큘럼 없음</div>;
                  }

                  if (curriculumArray.length === 0) {
                    return <div className="text-gray-400">커리큘럼 없음</div>;
                  }

                  // title 기준 정렬
                  curriculumArray.sort((a, b) => a.title!.localeCompare(b.title!));

                  return curriculumArray.map((c, idx) => (
                    <div key={idx} className="mb-1">
                      {idx + 1}. <span className="font-normal">{c.title}</span>
                      <div className="text-gray-600 ml-3">{c.detail}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
