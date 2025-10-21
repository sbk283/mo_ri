interface PDFPreviewProps {
  items: any[];
}

export default function PDFPreview({ items }: PDFPreviewProps) {
  return (
    <div className="p-10">
      <div className="mb-[30px]">
        <h1 className="text-[22px] font-semibold">모임 참여 이력 증명서</h1>
        <p className="text-sm">출력일: {new Date().toLocaleDateString()}</p>
      </div>

      {/* 프로필 정보 */}
      <div className="p-4">
        <div className="text-lg font-semibold mb-[20px] ml-[20px]">프로필 정보</div>
        <div className="border-b-[2px] border-gray-200 mb-[7px]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-md font-semibold mb-[20px] ml-[20px] pl-[20px]">성 명</div>
            <div className="text-md font-semibold mb-[20px] ml-[60px]">유지선</div>
          </div>
          <div className="flex items-center">
            <div className="text-md font-semibold mb-[20px]">이메일</div>
            <div className="text-md font-semibold mb-[20px] ml-[40px] pr-[150px]">
              z.seon.dev@gmail.com
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 mb-[20px]" />
      </div>

      {/* 모임 참여 이력 */}
      <div className="p-4 w-full">
        <div className="text-lg font-semibold mb-[20px] ml-[20px]">모임 참여 이력</div>
        <div className="border-b-[2px] border-gray-200 mb-[7px] " />
        <div className="grid grid-cols-[20%_60%_20%] w-full mb-[20px]">
          <div className="text-md font-semibold text-center">모임 기간</div>
          <div className="text-md font-semibold text-center">모임 이름</div>
          <div className="text-md font-semibold text-center">모임 분류</div>
        </div>
        <div className="border-b border-gray-200" />

        <div className="flex flex-col">
          {items.map((item, index) => (
            <div key={index} className="flex w-full items-center border-b border-gray-200 py-2">
              <div className="w-1/5 text-sm font-normal text-center">
                {item.period?.start ?? '-'} ~ {item.period?.end ?? '-'}
              </div>
              <div className="w-3/5 text-base font-semibold text-center">{item.title}</div>
              <div className="w-1/5 text-base font-semibold text-center">{item.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 모임 세부 정보 */}
      <div className="p-4 w-full">
        <div className="text-lg font-semibold mb-[20px] ml-[20px]">모임 세부 정보</div>
        {items.map((item, index) => (
          <div className="border p-3 rounded-sm mb-[20px]" key={index}>
            <div className="flex justify-between pb-[20px]">
              <div className="flex">
                <div className="text-md font-semibold ml-[20px] pl-[20px]">모임기간</div>
                <div className="text-md font-semibold ml-[60px]">
                  {item.period?.start ?? '-'} ~ {item.period?.end ?? '-'}
                </div>
              </div>
              <div className="flex">
                <div className="text-md font-semibold">모임 분류</div>
                <div className="text-md font-semibold ml-[40px] pr-[150px]">{item.category}</div>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-[10px]" />
            <div className="flex pb-[20px]">
              <div className="text-md font-semibold ml-[20px] pl-[20px]">모임 이름</div>
              <div className="text-md font-semibold ml-[56px]">{item.title}</div>
            </div>

            <div className="border-b border-gray-200 mb-[10px]" />
            <div className="flex pb-[20px]">
              <div className="text-md font-semibold ml-[20px] pl-[20px]">커리큘럼</div>
              <div>
                {item.curriculum?.map((c: string, idx: number) => (
                  <div className="text-md font-normal ml-[56px]" key={idx}>
                    {idx + 1}. {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
