import CategoryMenuComponent from '../components/CategoryMenuComponent';

// 일단 하드코딩 대충해놓고 이거는 DB연결하고 함수들 다시 수정 해야될 것 같아서 내비둘게요.ㅠㅠ

function GroupListPage() {
  // const groups = [
  //   {
  //     id: 1,
  //     title: '강한 남자들의 모임 [강남모]',
  //     categoryMain: '봉사/사회참여',
  //     categorySub: '캠페인',
  //     status: '모집중',
  //     dday: 'D-5',
  //     type: '원데이',
  //   },
  // ];

  return (
    <div className="mx-auto flex w-[1024px] gap-10 px-1 py-[120px]">
      {/* 카테고리 메뉴 컴포넌트 */}
      <CategoryMenuComponent />

      {/* 오른쪽 메인 */}
      <main className="flex-2">
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

        {/* 리스트 뷰 */}
        <section>
          {/* 헤더 + 최신순 정렬 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">봉사/사회참여 &gt; 캠페인 모임</h2>
            <span className="text-sm text-gray-500">최신순 정렬</span>
          </div>

          {/* 리스트 카드 */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                {/* 썸네일 */}
                <img
                  src={`https://picsum.photos/seed/list${i}/200/120`}
                  alt="모임 이미지"
                  className="h-24 w-40 rounded-md object-cover"
                />

                {/* 정보 */}
                <div className="flex-1">
                  {/* 모집중 + 제목 라인 */}
                  <div className="flex items-center gap-2">
                    <span className="flex w-[54px] h-[23px] items-center justify-center rounded-[15px] bg-[#FF5252] text-xs font-semibold text-white">
                      모집중
                    </span>
                    <h3 className="font-bold text-sm flex items-center gap-1">
                      강한 남자들의 모임 [강남모]
                      <img src="/images/trophy.svg" alt="trophy" className="w-4 h-4" />
                    </h3>
                    {/* D-day */}
                    <span className="flex w-[40px] h-[21px] items-center justify-center rounded bg-[#BEC0C4] text-[11px] text-white">
                      D-5
                    </span>
                    {/* 원데이 */}
                    <span className="flex w-[47px] h-[21px] items-center justify-center rounded bg-[#FBAB17] text-[11px] text-white">
                      원데이
                    </span>
                  </div>

                  {/* 설명 */}
                  <p className="mt-1 text-sm text-gray-600">
                    준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.
                  </p>

                  {/* 하단 메타 정보 */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>참여인원: 2/10</span>
                    {/* {groups.categoryMain} &gt; {groups.categorySub} */}
                  </div>
                </div>
              </div>
            ))}
            <p className="mt-6 text-center text-sm text-gray-500">ㅡ 모든 항목을 불러왔습니다 ㅡ</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default GroupListPage;
