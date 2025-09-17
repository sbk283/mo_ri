// 청소년 보호 정책
function YouthPolicyPage() {
  return (
    <div className=" mt-[147px]">
      <div className="flex relative">
        {/* 이용약관 카테고리 */}
        <div className="absolute left-[160px]">
          <div className="w-[255px]">
            <h3 className="text-xl font-bold text-gray-400 mb-[11px]">청소년 보호 정책</h3>
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
          <h2 className="text-brand font-bold text-xl">청소년 보호 정책</h2>
          <br />
          <div className="text-md">
            <div>
              <b>목적</b>
              <br />
              회사는 청소년이 유해 정보로부터 안전하게 서비스를 이용할 수 있도록 「청소년보호법」 등
              관련 법령을 준수하며 다음과 같은 정책을 시행합니다.
            </div>
            <br />
            <div>
              <b>1. 유해정보 차단</b>
              <br />
              · 음란·폭력·도박·마약·불법 촬영물·혐오/차별 조장 콘텐츠 금지 <br />
              · 모임 개설 시 카테고리/키워드 필터링과 사전·사후 모니터링
              <br /> · 신고 접수 시 즉시 임시차단 후 검토
            </div>
            <br />
            <div>
              <b>2. 연령 확인 및 보호조치</b>
              <br />· 만 19세 미만 이용자 연령 확인(본인인증 수단 적용 가능) <br />
              · 성인 전용 모임/콘텐츠 접근 제한 <br />· 야간시간대 접속 제한 기능(선택제) 검토
            </div>
            <br />
            <div>
              <b>3. 신고 및 상담</b>
              <br />· 앱 내 신고 버튼, 고객센터 1:1 문의, 긴급 신고 채널 <br />· 위반 시 경고/접속
              제한/영구 이용정지 등 단계적 조치
            </div>
            <br />
            <div>
              <b>4. 교육 및 관리</b>
              <br />
              · 내부 운영자 대상 정기 교육(불법·유해정보 식별, 대응 프로세스) <br />· 외부 기관
              협력(필요 시 수사기관 통보)
            </div>
            <br />
            <div>
              <b>5. 책임자 지정</b>
              <br />· 청소년보호책임자: [성명/직책/연락처/이메일]
              <br /> · 시행일: [YYYY.MM.DD] / 개정이력 공개
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YouthPolicyPage;
