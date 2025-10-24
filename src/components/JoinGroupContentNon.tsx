import { Link } from 'react-router-dom';

function JoinGroupContentNon() {
  return (
    <div className="mt-[100px]">
      <div className="text-center">
        <p className="mb-12">
          참여한 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!
        </p>
        <Link to={'/grouplist'} className="text-brand">
          모임 참여하러 가기 {'>'}
        </Link>
      </div>
    </div>
  );
}

export default JoinGroupContentNon;
