// GroupContentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { noticeMock } from './DashboardNotice';

type Props =
  | { id: number; onBack: () => void } // 라우팅 없이 사용
  | { id?: never; onBack?: never }; // 라우팅으로 사용

function GroupContentDetail(props: Props) {
  // props 우선, 없으면 라우터 파라미터 사용
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const resolvedId =
    (('id' in props && props.id) as number | undefined) ??
    (params.id ? Number(params.id) : undefined);

  const goBack = 'onBack' in props && props.onBack ? props.onBack : () => navigate(-1);

  const notice = noticeMock.find(n => n.id === Number(resolvedId));

  if (!notice) {
    return (
      <div className="p-8 text-center">
        <p>⚠️ 해당 공지를 찾을 수 없습니다.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-[800px] mx-auto p-8 bg-white rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">{notice.title}</h1>
      <p className="text-gray-500 text-sm mb-6">{notice.date}</p>
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{notice.content}</p>

      <div className="mt-8 flex gap-2">
        <button onClick={goBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          목록으로 돌아가기
        </button>
      </div>
    </article>
  );
}

export default GroupContentDetail;
