import { Link } from 'react-router-dom';

const DashboardChat = () => {
  return (
    <div className="p-5">
      {/* 제목 */}
      <div className="flex justify-between mb-4">
        <p className="text-xl font-bold">일정</p>
      </div>
      {/* 채팅컨테이너 */}
      <div className="relative w-[378px] h-[303px] bg-[#ECEEF4] border border-[#A3A3A3] rounded-[5px] p-4 overflow-hidden">
        {/* 상단 */}
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
        <div className="py-3 flex flex-col gap-2 h-[180px] overflow-hidden">
          {/* 상대방 채팅 */}
          <div className="flex justify-start gap-2">
            <div className="w-[23px] h-[23px] rounded-[50%] overflow-hidden ">
              <img className="w-full h-full object-cover" src="/bruce.jpg" alt="프로필사진" />
            </div>
            <div className="p-3 max-w-[225px] bg-white shadow-card text-sm">
              <p>
                [마비노기 던전 레이드 파티원 모집] 모임장 채팅입니다. 문의 사항이 있으시면 메세지
                남겨 주세요.
              </p>
            </div>
          </div>
          {/* 내채팅 */}
          <div className="flex justify-end">
            <div className="p-3 max-w-[225px] bg-brand shadow-card">
              <p className="text-sm text-white">
                안녕하세요, 모임장님. 다름이 아니라 제가 이번 모임에서는 잠깐 쉬어야할것같아요. 온
                몸이 아프네요.
              </p>
            </div>
          </div>
        </div>
        <Link to={'/chat'} className="absolute bottom-3">
          <button className="w-[345px] h-[32px] bg-brand rounded-sm text-white font-bold text-sm">
            채팅 확인하기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardChat;
