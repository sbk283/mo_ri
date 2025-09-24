import { useState } from 'react';
import InquirySelector from '../components/InquirySelector';
import MyPageLayout from '../components/layout/MyPageLayout';

// 1:1 문의하기 페이지입니다.
function InquiryPage() {
  // 문의 유형 선택
  const [inquiryMajor, setInquiryMajor] = useState('');
  const [inquirySub, setInquirySub] = useState('');
  // 첨부된 파일 이름 보기
  const [fileName, setFileName] = useState<string[]>([]);

  // 문의 유형 선택
  const handleChange = (field: 'inquiryMajor' | 'inquirySub', value: string) => {
    if (field === 'inquiryMajor') setInquiryMajor(value);
    if (field === 'inquirySub') setInquirySub(value);
  };

  // 첨부 파일 이름 보기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(f => f.name);
      // 기존 + 새로 선택된 파일 합쳐서 2개까지만 저장
      const updated = [...fileName, ...selectedFiles].slice(0, 2);
      setFileName(updated);
    }
  };

  // 첨부파일 삭제 하기
  const handleFileRemove = (name: string) => {
    setFileName(prev => prev.filter(f => f !== name));
  };

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} 1:1 문의 하기
        </div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            서비스 이용 중 궁금한 점이나 불편사항을 직접 문의하실 수 있는 공간입니다.
          </div>
          <div className="text-md">
            남겨주신 문의는 담당자가 확인 후 신속하게 답변 드리겠습니다.
          </div>
        </div>
      </div>
      {/* 하단 내용 부분 */}
      <div className="mt-[56px] ">
        <div className=" text-brand text-xxl font-semibold mb-[38px]">1:1 문의 하기</div>
        <form className="w-[1024px] rounded-[5px] border border-gray-300 py-[90px] px-[87px]">
          <div className="mb-[44px]">
            <div className=" text-gray-400 text-lg font-medium mb-[11px]">이름</div>
            <input
              type="text"
              placeholder="이름을 입력해 주세요."
              className="border w-[850px] rounded-[5px] border-gray-300 p-[12px] placeholder:font-normal placeholder:text-[#a6a6a6] placeholder:text-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            />
          </div>
          <div className="mb-[44px]">
            <div className=" text-gray-400 text-lg font-medium mb-[11px]">
              답변 알림 이메일 주소
            </div>
            <input
              type="email"
              placeholder="답변 받을 이메일 주소를 입력해 주세요."
              className="border-[1px] w-[850px] rounded-[5px] border-gray-300 p-[12px] placeholder:font-normal placeholder:text-[#a6a6a6] focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            />
          </div>
          <div className="mb-[44px]">
            <div className=" text-gray-400 text-lg font-medium mb-[11px]">문의 유형</div>
            <InquirySelector major={inquiryMajor} sub={inquirySub} onChange={handleChange} />
          </div>
          <div className="mb-[44px]">
            <div className=" text-gray-400 text-lg font-medium mb-[11px]">문의 내용</div>
            <textarea
              placeholder="선택하신 문의 유형에 맞는 문의사항을 자세히 적어주세요."
              className="border-[1px] w-[850px] h-[235px] rounded-[5px] border-gray-300 p-[12px] placeholder:font-normal placeholder:text-[#a6a6a6] focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            />
          </div>
          <div>
            <div className=" text-gray-400 text-lg font-medium mb-[11px]">첨부파일</div>
            <div className="flex items-center mb-[11px] gap-[8px] justify-between">
              <div className="flex-1 rounded-[5px] min-h-[40px] flex items-center gap-2 flex-wrap">
                {fileName.length > 0 ? (
                  fileName.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-white border border-gray-300 p-1 rounded-[5px] text-sm"
                    >
                      <span className="truncate max-w-[200px]">{f}</span>
                      <button type="button" onClick={() => handleFileRemove(f)} className="ml-2">
                        ❌
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">첨부된 파일이 없습니다.</span>
                )}
              </div>

              <div className="flex ">
                <label className="flex items-center justify-center gap-[5px] p-1 border whitespace-nowrap placeholder:text-[#A6A6A6] border-gray-300 rounded-[5px] cursor-pointer text-sm text-[#5D5C5C]">
                  <img src="/images/file_blue.svg" alt="파일첨부" />
                  파일첨부
                  <input type="file" className="hidden" onChange={handleFileChange} multiple />
                </label>
              </div>
            </div>

            <div className="text-md font-normal text-gray-400 mb-[31px]">
              <p>· 사진 및 파일은 최대 2개 까지 등록가능합니다.</p>
              <p>· 10MB 이내의 모든 이미지 파일 업로드가 가능합니다.</p>
              <p>
                · 첨부파일 형식 및 내용이 1:1 문의내용과 맞지 않는 경우 (비방,음란 등) 관리자에 의해
                삭제 될 수 있습니다.
              </p>
            </div>
          </div>
          <div className="border borer-b-[1px] mb-[35px]" />
          <div className=" text-gray-400 text-lg font-medium mb-[17px]">안내사항</div>
          <div className="text-md font-normal text-gray-400 mb-[63px]">
            <p>· 로그인 후 등록한 문의는 고객센터 페이지 1:1 문의 내역에서 확인 할 수 있습니다.</p>
            <p>· 남겨주신 문의는 담당자가 확인 후 업무시간 내 순차적 답변 드리니 기다려주세요.</p>
          </div>
          <button className="block mx-auto  w-[190px] py-[12px] px-[52px] bg-brand rounded-[5px] font-semibold text-white text-xl items-center">
            문의하기
          </button>
        </form>
      </div>
    </MyPageLayout>
  );
}

export default InquiryPage;
