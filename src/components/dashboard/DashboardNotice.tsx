import { Link } from 'react-router-dom';

const DashboardNotice = () => {
  return (
    <div className="p-5">
      {/* 제목 */}
      <div className="flex justify-between mb-4 relative">
        <p className="text-xl font-bold">게시판이얌</p>
        <Link to={'/groupcontent/:id'} className="flex gap-1 items-center text-[#8C8C8C] text-sm">
          <img src="/plus_gray.svg" alt="더보기" />
          더보기
        </Link>
      </div>
      {/* 내용 */}
      <div className="flex flex-col">
        <div>
          <div className="flex justify-between border-b border-dashed border-gray-600 p-2">
            <p className="w-[370px] truncate font-bold">
              [필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.
            </p>
            <p className="text-gray-300 text-sm">2025-06-26</p>
            <span className="w-[60px] h-[24px] bg-[#C4C4C4]  rounded-full font-bold text-white text-sm flex items-center justify-center">
              읽음
            </span>
          </div>
          <div className="flex justify-between border-b border-dashed border-gray-600 p-2">
            <p className="w-[370px] truncate font-bold">
              [필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.
            </p>
            <p className="text-gray-300 text-sm">2025-06-26</p>
            <span className="w-[60px] h-[24px] bg-[#FF5252]  rounded-full font-bold text-white  text-sm flex items-center justify-center">
              읽지않음
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNotice;
