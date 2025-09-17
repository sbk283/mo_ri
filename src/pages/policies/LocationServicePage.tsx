// 위치기반 서비스 관련 약관 페이지
function LocationServicePage() {
  return (
    <div className=" mt-[147px]">
      <div className="flex relative">
        {/* 이용약관 카테고리 */}
        <div className="absolute left-[160px]">
          <div className="w-[255px]">
            <h3 className="text-xl font-bold text-gray-400 mb-[11px]">위치기반서비스 이용약관</h3>
            <div className="space-y-[7px]">
              <button className="w-[255px] bg-brand text-white py-[13px] rounded-[5px] hover:bg-blue-700 transition">
                PDF로 저장 / 인쇄
              </button>
              <button className="w-[255px] bg-brand text-white py-[13px] rounded-[5px] hover:bg-blue-700 transition">
                고객센터 문의
              </button>
            </div>
          </div>
        </div>
        {/* 약관 내용 페이지 */}
        <div className="w-[1024px] h-[100%] pt-[54px] px-[77px] pb-[65px] mb-[309px] border-gray-300 border-[1px] rounded-[5px] mx-auto">
          <h2 className="text-brand font-bold text-xl">위치기반서비스 이용약관</h2>
          <br />
          <div className="text-md">
            <div>
              <b>제1조(목적)</b>
              <br />본 약관은 회사가 제공하는 위치기반서비스의 이용과 관련하여 회사와 이용자 간
              권리·의무 및 기타 필요한 사항을 규정합니다.
            </div>
            <br />
            <div>
              <b>제2조(서비스 내용)</b>
              <br />
              1. 이용자의 현재 위치 또는 지정 위치를 기반으로 한 주변 모임 검색·추천 <br /> 2. 모임
              경로 안내, 체크인(출석), 안전 안내, 위치 기반 알림 <br />
              3. 통계/추천 고도화를 위한 위치정보 이용
            </div>
            <br />
            <div>
              <b>제3조(요금)</b>
              <br />
              위치기반서비스는 기본 무료입니다. 유료 부가서비스가 있는 경우 별도 고지합니다.
            </div>
            <br />
            <div>
              <b>제4조(개인위치정보의 처리)</b>
              <br />
              1. 수집항목: GPS/Wi-Fi/기지국 기반 좌표, 타임스탬프, 정확도 등 <br />
              2. 이용·보유기간: 목적 달성 후 즉시 파기. 법령상 확인자료는 6개월 보관
              <br />
              3. 제3자 제공: 원칙적으로 동의 없이 제공하지 않으며, 제공 필요 시 사전 고지 및 동의
            </div>
            <br />
            <div>
              <b>제5조(동의 및 철회)</b>
              <br />
              1. 최초 이용 시 명시적 동의를 받습니다(앱 권한 포함).
              <br />
              2. 설정에서 언제든 동의를 철회할 수 있으며, 철회 시 관련 서비스가 제한될 수 있습니다.
            </div>
            <br />
            <div>
              <b>제6조(8세 이하 아동 등 보호의무자 권리)</b>
              <br />
              위치정보법에 따라 8세 이하의 아동, 피성년후견인 등은 보호의무자의 동의 하에 서비스
              이용이 가능하며, 보호의무자는 열람·정정·삭제·동의철회를 행사할 수 있습니다.
            </div>
            <br />
            <div>
              <b>제7조(개인위치정보주체의 권리)</b>
              <br />
              개인위치정보주체는 열람·고지 요구, 정정·삭제, 일시 중지 요구, 동의 범위 설정·철회 등을
              회사에 요구할 수 있습니다.
            </div>
            <br />
            <div>
              <b>제8조(보호조치)</b>
              <br />
              개인위치정보는 암호화 저장·전송하고, 접근통제·접근기록 보관·위변조 방지 등 안전조치를
              시행합니다.
            </div>
            <br />
            <div>
              <b>제9조(분쟁조정 및 신고)</b>
              <br />
              개인위치정보 침해에 관한 분쟁은 위치정보분쟁조정위원회에 신청할 수 있습니다.
            </div>
            <br />
            <div>
              <b>제10조(고지의무)</b>
              <br />
              약관 변경 시 적용일 7일 전(불리한 변경은 30일 전) 공지합니다. <br />
              시행일: [YYYY.MM.DD] <br />
              위치정보관리책임자: [성명/직책/연락처/이메일].
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationServicePage;
