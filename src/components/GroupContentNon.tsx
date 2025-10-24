import { Link } from 'react-router-dom';

function GroupContentNon() {
  return (
    <div className="mt-[100px]">
      <div className="text-center">
        <p className="mb-6">
          생성한 모임이 없습니다. 새로운 모임을 만들어 즐거운 활동을 시작해보세요!
        </p>
        <Link to={'/creategroup'} className="text-brand">
          모임 생성하러 가기 {'>'}
        </Link>
      </div>
    </div>
  );
}

export default GroupContentNon;
