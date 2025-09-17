import Footer from '../../components/Footer';
import Header from '../../components/Header';

// 제휴/환불정책
function RefundPolicypage() {
  return (
    <>
      <Header isLoggedIn={false} />
      <div className=" mt-[120px]">
        <div className="flex relative">
          {/* 이용약관 카테고리 */}
          <div className="absolute left-[160px]">
            <div className="w-[255px]">
              <h3 className="text-xl font-bold text-gray-400 mb-[11px]">제휴 정책</h3>
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
            <h2 className="text-brand font-bold text-xl">제휴정책 (Partnership Policy)</h2>
            <br />
            <div className="text-md">
              <div>
                <b>1. 제휴 목적</b>
                <br />
                회원에게 더 나은 경험을 제공하고 지역 생태계를 활성화하기 위해 기업·단체·공간과
                협력합니다.
              </div>
              <br />
              <div>
                <b>2. 제휴 유형</b>
                <br />· 브랜드/마케팅: 공동 캠페인, 챌린지, 스폰서십
                <br />· 공간/시설: 모임 공간 제공(예약 연동, 할인)
                <br />· 교육/콘텐츠: 강좌/키트/클래스 연계
                <br />· 복지/멤버십: 쿠폰, 포인트 교환, 멤버십 혜택
              </div>
              <br />
              <div>
                <b>3. 제휴 절차</b>
                <br />
                문의 접수 → 1차 검토(적합성·안전성·브랜드 적합) → 제안서 교환 → 조건 협의(MOU/계약)
                → 론칭 체크리스트(브랜드 가이드, 개인정보/데이터 처리, KPI) → 성과 리포트
              </div>
              <br />
              <div>
                <b>4. 데이터 및 개인정보</b>
                <br />
                성과 측정을 위한 최소한의 통계 데이터만 공유하며, 개인정보는 사전 동의·법적 근거
                없이는 제공하지 않습니다. 데이터 공유 시 목적·항목·보관기간·보안조치를 계약서에
                명시합니다.
              </div>
              <br />
              <div>
                <b>5. 브랜딩 가이드</b>
                <br />
                로고 사용 위치/비율/여백, 톤앤매너, 문구 승인 프로세스 준수. 허위·과장광고 금지.
              </div>
              <br />
              <div>
                <b>6. 수익 배분/정산(해당 시)</b>
                <br />
                티켓 매출, 스폰서십, 유료 노출 등은 계약서에 따른 분배율·정산주기·세금계산서 발행
                조건을 따릅니다.
              </div>
              <br />
              <div>
                <b>7. 금지 사항</b>
                <br />
                불법/사행/혐오/차별/청소년유해 업종, 과도한 개인정보 요구, 안전 미비 활동 연계 등은
                제휴 불가.
              </div>
              <br />
              <div>
                <b>8. 계약 기간 및 해지</b>
                <br />
                계약 기간, 중도 해지 사유(브랜드 훼손, 법령 위반 등), 위약 조항, 손해배상 범위를
                명시합니다.
              </div>
              <br />
              <div>
                <b>9. 문의</b>
                <br />
                제휴 전용 이메일: [partnership@도메인] / 폼 링크: [URL] / 담당자: [성명/직책/연락처]
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RefundPolicypage;
