function GroupListPage() {
  return (
    <main className="mx-auto w-[1024px] px-4 py-10">
      {/* 검색창 */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="찾고 싶은 모임을 검색하세요..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      {/* 인기 모임 TOP8 */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-bold">
          해당 카테고리의 인기있는 TOP8{' '}
          <span className="text-sm text-gray-500">(추천 순위기준)</span>
        </h2>

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
        <h2 className="mb-4 text-lg font-bold">봉사/사회참여 &gt; 캠페인 모임</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              {/* 왼쪽 썸네일 */}
              <img
                src={`https://picsum.photos/seed/list${i}/200/120`}
                alt="모임 이미지"
                className="h-24 w-40 rounded-md object-cover"
              />

              {/* 오른쪽 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-white">
                    모집중
                  </span>
                  <span className="text-xs text-gray-500">2025.05.12 ~ 2025.05.30</span>
                </div>
                <h3 className="mt-1 font-bold">[4차] 하반신 근력 강화 모임</h3>
                <p className="text-sm text-gray-600">
                  준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>참여인원: 2/10</span>
                  <span>카테고리: 운동/헬스</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default GroupListPage;
