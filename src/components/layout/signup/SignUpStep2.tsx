function SignUpStep2({ onSubmit }) {
  return (
    <div className="py-[40px] px-[90px]">
      <div className="flex items-center gap-4 mb-5">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className=" font-bold text-gray-600 text-lg">01_ 기본 정보 작성</span>
          <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
          <span className=" font-bold text-lg  text-brand">02_ 관심사 선택</span>
        </div>
      </div>
      {/* 선택 */}
      <div>
        <div className="mb-6">
          <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
            <img className="h-[29px]" src="/images/health.svg" alt="운동/건강" />
            <p className="font-bold text-xl text-gray-[#3c3c3c]">운동 / 건강</p>
          </div>
          <div className="flex gap-[10px] text-lg font-bold text-gray-600">
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand">
              구기활동
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              실내활동
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              실외활동
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              힐링/건강관리
            </button>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
            <img className="h-[29px]" src="/images/hobby.svg" alt="취미/여가" />
            <p className="font-bold text-xl text-gray-[#3c3c3c]">취미 / 여가</p>
          </div>
          <div className="flex gap-[10px] text-lg font-bold text-gray-600">
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand">
              예술/창작
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              음악/공연/문화
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              요리/제과제빵
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              게임/오락
            </button>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
            <img className="h-[29px]" src="/images/volunteer.svg" alt="봉사/사회참여" />
            <p className="font-bold text-xl text-gray-[#3c3c3c]">봉사 / 사회참여</p>
          </div>
          <div className="flex gap-[10px] text-lg font-bold text-gray-600">
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand">
              복지/나눔
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              캠페인
            </button>
          </div>
        </div>
        <div className="mb-12">
          <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
            <img className="h-[29px]" src="/images/study.svg" alt="스터디/자기계발" />
            <p className="font-bold text-xl text-gray-[#3c3c3c]">스터디 / 자기계발</p>
          </div>
          <div className="flex gap-[10px] text-lg font-bold text-gray-600">
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand">
              학습
            </button>
            <button className="border rounded-[5px] py-1 px-3 cursor-pointer  hover:bg-brand hover:text-white hover:border-brand">
              IT
            </button>
          </div>
        </div>
        <button
          onClick={onSubmit}
          className="rounded-[5px] bg-brand text-white font-bold text-xxl w-[487px] h-[48px]"
        >
          다음단계
        </button>
      </div>
    </div>
  );
}

export default SignUpStep2;
