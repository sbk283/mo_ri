import { Link } from 'react-router-dom';

function GroupContentNon() {
  return (
    <div>
      {/* 3항 연산자 넣기 모임장 참여자 유무 */}
      {/* 참여자 */}
      <div className="text-center">
        <p className="mb-12">
          참여한 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!
        </p>
        <Link to={'/grouplist'} className="text-brand">
          모임 참여하러 가기 {'>'}
        </Link>
      </div>
      {/* 모임장 */}
      {/* <div className="text-center">
        <p className="mb-12">
          생성한 모임이 없습니다. 새로운 모임을 만들어 즐거운 활동을 시작해보세요!
        </p>
        <Link to={'/creategroup'} className="text-brand">
          모임 생성하러 가기 {'>'}
        </Link>
      </div> */}
    </div>
  );
}

export default GroupContentNon;
