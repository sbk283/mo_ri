// src/pages/GroupContentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { dailyMock } from './common/GroupDailyContent';

type Props =
  | { id: number; onBack: () => void } // 라우팅 없이 사용
  | { id?: never; onBack?: never }; // 라우팅으로 사용

export default function GroupContentDetail(props: Props) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const resolvedId =
    (('id' in props && props.id) as number | undefined) ??
    (params.id ? Number(params.id) : undefined);

  const goBack = 'onBack' in props && props.onBack ? props.onBack : () => navigate(-1);

  const notice = dailyMock.find(n => n.id === Number(resolvedId));

  if (!notice) {
    return (
      <div className="p-8 text-center">
        <p>⚠️ 해당 공지를 찾을 수 없습니다.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <article className="mx-auto bg-white shadow-md border border-[#A3A3A3]">
        {/* 제목 + 날짜 + 조회수 */}
        <header className="px-8 pt-6">
          <div className="flex">
            <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">{notice.title}</h1>
            <span
              className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm
                    flex items-center justify-center ml-4 leading-none
                    ${notice.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'}`}
            >
              {notice.isRead ? '읽음' : '안읽음'}
            </span>
          </div>
          <div className="flex items-center text-[#8C8C8C] text-sm gap-3">
            <span>{notice.date}</span>
            <span>조회수 {notice.views ?? 0}</span>
          </div>
        </header>
        <div className="text-center">
          <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[904px]"></div>
        </div>
        {/* 본문 내용 */}
        <section className="px-8 py-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {notice.content}
        </section>
      </article>
      {/* 목록으로 돌아가기 */}
      <footer className="py-6 flex text-left justify-start">
        <button onClick={goBack} className="text-[#8C8C8C] py-2 transition text-md">
          &lt; 목록으로
        </button>
      </footer>
    </div>
  );
}
