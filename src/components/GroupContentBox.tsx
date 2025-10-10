import { Link } from 'react-router-dom';

function GroupContentBox() {
  return (
    <Link
      to={'/groupcontent/:id'}
      className="w-[1024px] h-[123px] border rounded-[5px] border-[#acacac] p-[10px] relative flex"
    >
      {/* 3항연산자로 바꾸기 모집예정, 모집중으로 */}
      <div className="absolute rounded-[5px] bg-gray-300 px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
        모임 오픈까지 nn일
      </div>
      {/* <div className="absolute rounded-[5px] bg-brand px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
        모임 오픈까지 nn일
      </div> */}
      <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden">
        <img className="w-full h-full  object-cover" src="/bruce.jpg" alt="모임사진" />
      </div>
      <div className="px-4 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <p className="text-lg font-bold">[모여라] 가라! 포켓몬스터 함께 잡아요. 친구들 모집</p>
          <span className="px-[6px] py-[2px] bg-[#D83737] font-bold text-white rounded-[5px]">
            취미/여가
          </span>
        </div>
        <div>
          <p>모임 설명을 적는 공간입니다.</p>
        </div>
        <div className="flex gap-12 text-sm text-[#6C6C6C]">
          <div className="">2025.02.15 ~ 2025.05.12</div>
          <div className="flex gap-1">
            <img src="/humen.svg" alt="" />
            2/10
          </div>
        </div>
      </div>
      <div className="absolute right-12 top-[50%] translate-y-[-50%] cursor-pointer">
        {/* 3항 연산자 모임자랑 참여자 먼저 3항연산한 후 모집종료 유무 화살표화 후기작성 */}
        <div>
          <img src="/images/swiper_next.svg" alt="상세보기" />
        </div>
        {/* 후기작성 유무로 3항연산자 후기작성과 후기작성완료 */}
        {/* <button className="text-brand border border-brand rounded-[5px] px-[10px] py-[4px]">
          후기작성
        </button> */}
        {/* <button className="text-[#6C6C6C] border border-[#6C6C6C] rounded-[5px] px-[10px] py-[4px]">
          후기작성완료
        </button> */}
      </div>
    </Link>
  );
}

export default GroupContentBox;
