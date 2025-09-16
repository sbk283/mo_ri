function ServiceIntroducePage() {
  return (
    <div>
      {/* 상단배너 */}
      <div className="h-[560px] overflow-hidden relative ">
        <img
          className="absolute w-full h-full object-cover inset-0"
          src="./service_bg.svg"
          alt="mo:ri 배경"
        />
        <div className="relative z-50 w-[1024px] h-full mx-auto flex justify-center items-center pr-[600px]">
          <div className="whitespace-nowrap">
            <img className="mb-3" src="./logo_white.svg" alt="Mo:ri" />
            <p className="text-white">당신의 일상에 가치를 더하는 모임</p>
            <p className="text-white text-xl font-bold">모리에서 함께 만들어갑니다.</p>
          </div>
        </div>
      </div>
      {/* 내용 */}
      <div>
        <div className="w-[1024px] mx-auto bg-slate-400">
          {/* 메인홈가기 */}
          <div>
            <div>
              <img src="" alt="" />
            </div>
            <div>
              <p>"취미부터 자기개발까지,</p>
              <p>
                <span>원하는 모임을 한 곳에서 해결</span>하세요.”
              </p>
              <p>취미, 자기계발, 봉사까지, 원하는 모임을 쉽고 빠르게 찾을 수 있습니다.</p>
            </div>
          </div>
          {/*  배너2개*/}
          <div></div>
          {/* 믿고사용할수있는 최적환경제공 */}
          <div></div>
          {/* 버튼2개 */}
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default ServiceIntroducePage;
