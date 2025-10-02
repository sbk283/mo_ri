import { Link } from 'react-router-dom';

const DashboardChat = () => {
  return (
    <div className="p-5">
      {/* 제목 */}
      <div className="flex justify-between mb-4">
        <p className="text-xl font-bold">일정</p>
      </div>
      {/* 채팅 */}
      <div className="w-[378px] h-[303px] bg-[#ECEEF4] border border-[#A3A3A3] rounded-[5px] p-5">
        <div className="flex justify-between  border-b">
          <div className="flex gap-5">
            <div className="w-[38px] h-[38px] rounded-[50%] overflow-hidden ">
              <img className="w-full h-full object-cover" src="/bruce.jpg" alt="프로필사진" />
            </div>
            <div>
              <p className="font-bold truncate">마비노기 던전 레이드 파티원모집</p>
              <p className="text-brand text-sm font-bold">춤추는 낙타</p>
            </div>
          </div>
          <div>
            <span className="w-[12px] h-[12px] rounded-[50%] bg-[#FF5252] inline-block"></span>
          </div>
        </div>
        <div>
          {/* 상대방 채팅 */}
          <div></div>
          {/* 내채팅 */}
          <div></div>
        </div>
        <Link to={'/chat'}>
          <button className="w-[352px] h-[32px] rounded-sm text-white font-bold text-sm">
            채팅 확인하기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardChat;
