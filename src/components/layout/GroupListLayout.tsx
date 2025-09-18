import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function GroupListLayout() {
  const [sort, setSort] = useState('최신순');
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = ['최신순', '원데이', '장기', '단기'];

  return (
    <div className="mx-auto flex w-[1024px] gap-10 px-1 py-[56px]">
      {/* 오른쪽 메인 */}
      <main className="flex-1">
        {/* 모임 리스트 헤더 */}
        <header className="mb-10">
          <h1 className="text-2xl font-bold">모임리스트</h1>
          <div className="mt-2 border-l-4 border-brand pl-3">
            <p className="text-m font-bold text-gray-800">
              카테고리와 주변 지역에 맞는 모임을 한눈에 볼 수 있습니다.
            </p>
            <p className="text-sm text-gray-600">
              관심 있는 모임을 쉽고 빠르게 찾아 다양한 활동을 즐겨보세요.
            </p>
          </div>
        </header>

        {/* 여기서부터 수정해야함!!!!!!!!!! 중앙 Swiper (추후 컴포넌트 교체 예정) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">해당 카테고리의 인기있는 TOP8</h2>
            {/* ➜ 버튼 요거 일단 하드 코딩만 해둔거라, 추후에 수정하겠슴다 */}
            <button className="flex w-[37px] h-[37px] items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
              ➜
            </button>
          </div>

          {/* Swiper 자리 (임시 grid) map돌림. */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white shadow hover:shadow-md transition p-4"
              >
                <img
                  src={`https://picsum.photos/seed/${i}/300/200`}
                  alt="모임 이미지"
                  className="h-32 w-full rounded-md object-cover"
                />
                <span className="mt-2 inline-block rounded bg-red-500 px-2 py-1 text-xs text-white">
                  운동/헬스
                </span>
                <h3 className="mt-1 font-semibold">하반신 근력 강화 모임</h3>
                <p className="text-xs text-gray-600">건강한 바디프로필 도전!</p>
              </div>
            ))}
          </div>
        </section>

        {/* 리스트 */}
        <section>
          <div className="flex items-center justify-between mb-4 relative">
            <h2 className="text-lg font-bold">봉사/사회참여 &gt; 캠페인 모임</h2>

            {/* 정렬 - 요거 따로 나중에 컴포넌트 빼것슴다 */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="border border-[#D9D9D9] rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand flex items-center gap-1"
              >
                {sort}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <img src="/images/arrow_down.svg" alt="정렬" />
                </motion.span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-md z-10"
                  >
                    {sortOptions.map(option => (
                      <li key={option}>
                        <button
                          onClick={() => {
                            setSort(option);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                            sort === option ? 'text-brand font-semibold' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 리스트 카드 */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className=" h-[175px] flex items-start gap-4 rounded-lg border border-[#D9D9D9] bg-white shadow-sm hover:shadow-md transition"
              >
                {/* 썸네일 */}
                <img
                  src={`https://picsum.photos/seed/list${i}/200/120`}
                  alt="모임 이미지"
                  className="h-[175px] w-[300px] rounded-tl-sm rounded-bl-sm object-cover"
                />

                {/* 정보 */}
                <div className="flex-1 pt-[21px] pl-[22px]">
                  {/* 모집중 + 제목 라인 */}
                  <div className="flex items-center gap-2">
                    <span className="flex w-[54px] h-[23px] items-center justify-center rounded-sm bg-[#FF5252] text-xs font-semibold text-white">
                      모집중
                    </span>
                    <h3 className="font-semibold text-sm flex items-center gap-[13px]">
                      강한 남자들의 모임 [강남모]
                      <img src="/images/trophy.svg" alt="trophy" className="w-4 h-4" />
                    </h3>
                    {/* D-day */}
                    <span className="flex w-[40px] h-[21px] items-center justify-center rounded-sm bg-[#BEC0C4] text-[11px] font-extrabold text-white">
                      D-5
                    </span>
                    {/* 원데이 */}
                    <span className="flex w-[47px] h-[21px] items-center justify-center rounded-sm bg-[#FBAB17] text-[11px] font-bold text-white">
                      원데이
                    </span>
                  </div>

                  {/* 설명 */}
                  <p className="mt-[26px] text-sm text-[#818181]">
                    준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.
                  </p>

                  {/* 하단 메타 정보 */}
                  <div className="mt-[42px] flex items-center gap-2 text-xs text-gray-500">
                    <p className="font-semibold text-[#FF5252] text-md">
                      취미/여가 &gt;{' '}
                      <span className="font-semibold text-gray-200 text-md mr-11">게임/오락</span>
                    </p>
                    <img
                      src="/images/group_member.svg"
                      alt="그룹멤버"
                      className="w-[15px] h-[15px]"
                    />
                    <span className="text-[#767676] mr-[200px]">2/10</span>
                    <span className="text-md text-[#777]">2025.05.12 ~ 2025.05.12</span>
                  </div>
                </div>
              </div>
            ))}
            {/* {isLast && ( */}
            <div className="pt-[107px] flex items-center">
              <div className="flex-1 border-t border-[#8C8C8C]" />
              <span className="mx-4 text-sm text-[#8C8C8C] whitespace-nowrap">
                모든 항목을 불러왔습니다
              </span>
              <div className="flex-1 border-t border-[#8C8C8C]" />
            </div>
            {/* )} */}
          </div>
        </section>
      </main>
    </div>
  );
}

export default GroupListLayout;
