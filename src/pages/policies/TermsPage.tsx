// 이용약관 페이지
function TermsPage() {
  return (
    <>
      <div className=" mt-[120px]">
        <div className="flex relative">
          {/* 이용약관 카테고리 */}
          <div className="absolute left-[160px]">
            <div className="w-[255px]">
              <h3 className="text-xl font-bold text-gray-400 mb-[11px]">이용약관</h3>

              <ul className="mb-6">
                <li className="flex items-center py-[19px] w-[251px] h-[51px] pl-[19px] hover:bg-blue-50 text-[#4e4e4e] hover:text-brand cursor-pointer border border-[#F2F4F8]">
                  <span className=" text-lg font-bold ">1. 목적과 정의</span>
                </li>
                <li className="flex items-center py-[19px] w-[251px] h-[51px] pl-[19px] hover:bg-blue-50 text-[#4e4e4e] hover:text-brand cursor-pointer border border-[#F2F4F8]">
                  <span className=" text-lg font-bold ">2. 서비스 이용 및 약관</span>
                </li>
                <li className="flex items-center py-[19px] w-[251px] h-[51px] pl-[19px] hover:bg-blue-50 text-[#4e4e4e] hover:text-brand cursor-pointer border border-[#F2F4F8]">
                  <span className=" text-lg font-bold ">3. 개인 정보 보호</span>
                </li>
                <li className="flex items-center py-[19px] w-[251px] h-[51px] pl-[19px] hover:bg-blue-50 text-[#4e4e4e] hover:text-brand cursor-pointer border border-[#F2F4F8]">
                  <span className=" text-lg font-bold ">4. 권리와 의무</span>
                </li>
                <li className="flex items-center py-[19px] w-[251px] h-[51px] pl-[19px] hover:bg-blue-50 text-[#4e4e4e] hover:text-brand cursor-pointer border border-[#F2F4F8]">
                  <span className=" text-lg font-bold ">5. 서비스 제한</span>
                </li>
              </ul>

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
            <h2 className="text-brand font-bold text-xl"> 제 1장 총칙</h2>
            <br />
            <br />
            <div className="text-md">
              <div>
                <b>제 1조(목적)</b>
                <br />본 약관은 [Mo:ri] (“Mo:ri”)이 제공하는 지역 기반 소셜 매칭 플랫폼 [Mo:ri]
                (“Mo:ri”)의 이용과 관련하여 회사와 회원 간 권리·의무 및 책임사항, 서비스 이용조건 및
                절차 등 기본적인 사항을 규정함을 목적으로 합니다.
              </div>
              <br />
              <div>
                <b>제 2조(정의)</b>
                <br />
                ·회원 : 본 약관에 동의하고 회사가 정한 절차에 따라 계정을 생성하여 서비스를 이용하는
                자
                <br />
                ·모임 : 회원이 서비스 내에서 생성·관리·참여할 수 있는 활동 단위 모임장 : 모임을
                <br />
                ·개설·운영하는 회원 콘텐츠 : 회원이 서비스에 게시·업로드하는 텍스트, 사진, 영상,
                후기, 평점 등
                <br /> ·유료서비스 : 구독, 유료 이벤트/티켓, 노출상위, 부가 기능 등 금전적 대가가
                수반되는
                <br />
                ·서비스 개인위치정보 : 위치정보법상 개인의 위치에 관한 정보
              </div>
              <br />
              <div>
                <b>제 3조(약관의 게시와 개정)</b>
                <br />
                회사는 약관을 서비스 내 화면 또는 연결화면에 게시합니다.
                <br />
                회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자
                및 개정사유를 명시하여
                <br />
                최소 7일(회원에게 불리하거나 중대한 변경은 30일) 전부터 공지합니다.
                <br /> 회원이 적용일 이후에도 서비스를 계속 이용하면 변경에 동의한 것으로 봅니다.
              </div>
              <br />
              <div>
                <b>제 4조(약관 외 준칙)</b>
                <br />본 약관에서 정하지 아니한 사항은 관계 법령, 위치정보법, 개인정보보호법,
                전자상거래법 등 관련 규정과 회사의 운영정책, 세부가이드에 따릅니다.
              </div>
            </div>
            <br />
            <br />
            <h2 className="text-brand font-bold text-xl"> 제 2장 서비스 이용</h2>
            <br />
            <br />
            <div className="text-md">
              <div>
                <b>제 5조(계정 생성 및 관리)</b>
                <br />
                회원은 실명 기반의 정확한 정보를 제공해야 하며, 계정 보안(비밀번호, 2단계 인증 등)을
                유지할 책임이 있습니다.
                <br />만 14세 미만은 보호자 동의가 있어야 가입할 수 있습니다.
                <br />
                제3자의 계정 도용, 공유, 양도·대여는 금지됩니다.
              </div>
              <br />
              <div>
                <b>제 6조(서비스 내용)</b>
                <br />
                모임 탐색·생성·참여, 위치 기반 추천, 채팅, 일정·출석·리뷰, 랭킹·배지·포인트, 알림,
                결제/정산, 이벤트/혜택 제공 등 회사는 합리적인 범위에서 서비스의 전부 또는 일부를
                변경·중단할 수 있으며, 중대한 변경은 사전 공지합니다.
              </div>
              <br />
              <div>
                <b>제 7조(유료서비스 및 결제)</b>
                <br />
                유료서비스의 내용, 가격, 이용기간, 환불조건은 각 상품 상세에 표시합니다.
                <br />
                결제수단: 신용/체크카드, 간편결제, 계좌이체 등. 결제 오류가 발생한 경우 회사 또는
                결제대행사에 즉시 통지해야 합니다.
                <br />
                환불: 전자상거래법 등 관련 법령 및 환불정책에 따릅니다. 사용(참여) 개시 후에는
                환불이 제한될 수 있습니다.
                <br /> 모임 참가비는 플랫폼을 통한 대행 정산 또는 모임장 직접 수납 방식 중 선택될 수
                있으며, 각 방식별 책임 범위는 별도 안내에 따릅니다.
              </div>
              <br />
              <div>
                <b>제 8조(모임 운영 및 책임)</b>
                <br /> 회사는 통신판매중개자에 해당할 수 있으며, 모임장과 참가자 간 분쟁의 당사자가
                아닙니다.
                <br />
                모임의 안전, 품질, 일정, 환불 등은 원칙적으로 모임장이 책임지며, 회사는 합리적
                범위에서 분쟁 조정을 지원할 수 있습니다.
              </div>
            </div>
            <br />
            <br />
            <h2 className="text-brand font-bold text-xl"> 제 3장 개인정보 보호</h2>
            <br />
            <br />
            <div className="text-md">
              <div>
                <b>제 9조(개인정보 및 위치 정보 보호)</b>
                <br />
                개인정보 처리에 대한 사항은 「개인정보처리방침」, 위치정보 처리에 대한 사항은
                「위치기반서비스 이용약관」을 따릅니다.
              </div>
            </div>
            <br />
            <br />
            <h2 className="text-brand font-bold text-xl"> 제 4장 권리와 의무</h2>
            <br />
            <br />
            <div className="text-md">
              <div>
                <b>제 10조(회원의 의무)</b>
                <br />
                · 법령 및 약관, 공지, 가이드를 준수 <br />
                · 타인의 권리 침해 금지(초상권·저작권·상표권 등) <br />
                · 허위정보, 스팸, 상업성 과다 광고, 음란·폭력·혐오·차별 콘텐츠 게시 금지 <br />
                · 안전지침 준수(현장 위험행위, 불법행위, 사기성 모집 금지) <br />·
                위치정보·개인정보의 · 무단 수집·공유 금지
              </div>
              <br />
              <div>
                <b>제 11조(금지행위 예시)</b>
                <br />
                · 모임의 실제 제공 내용과 다른 허위 고지, 과장·기만 <br />
                · 표적 괴롭힘, 혐오·차별 발언, 불법 촬영물 유통 <br />
                · 자동화 수단을 통한 데이터 수집/스크래핑 <br />
                · 서비스의 역설계·비인가 접근·보안 취약점 악용 <br />· 과도한 환불 유도, 티켓
                재판매, 참석 확인 조작
              </div>
              <br />
              <div>
                <b>제 12조(콘텐츠의 권리와 사용허락)</b>
                <br />
                회원이 업로드한 콘텐츠의 저작권은 회원에게 귀속됩니다.
                <br />
                회원은 회사에 대해 해당 콘텐츠를 서비스 운영·홍보를 위해 전세계적·비독점적·무상으로
                저장, 복제, 공개, 배포, 2차 표시(썸네일·리사이즈)에 필요한 범위에서 이용할 수 있는
                라이선스를 부여합니다.
                <br />
                회원이 삭제하면 합리적 기간 내 노출이 중단됩니다(백업·법령상 보존 제외).
                <br />
                제3자의 권리를 침해하는 콘텐츠 게시 시 모든 법적 책임은 게시자에게 있습니다.
              </div>
            </div>
            <br />
            <br />
            <h2 className="text-brand font-bold text-xl"> 제 5장 서비스 제한</h2>
            <br />
            <br />
            <div className="text-md">
              <div>
                <b>제 13조(제재 및 이용제한)</b>
                <br />
                회사는 위반행위에 대해 게시물 삭제, 경고, 일시정지, 영구정지, 모임 강제 종료, 법적
                조치 등을 취할 수 있습니다.
                <br />
                위반으로 인해 회사 또는 제3자에게 손해가 발생한 경우 해당 회원은 그 손해를 배상해야
                합니다.
              </div>
              <br />
              <div>
                <b>제 14조(서비스 중지·변경)</b>
                <br />
                천재지변, 정전, IDC 장애, 통신사 사정, 서비스 개편 등 불가항력 또는 상당한 사유가
                있는 경우 사전 통지 없이 중지될 수 있습니다. <br />
                회사는 가능한 신속히 복구하고 공지합니다.
              </div>
              <br />
              <div>
                <b>제 15조(면책)</b>
                <br />
                회원의 귀책사유로 인한 손해, 제3자에 의한 비인가 접근/행위로 발생한 손해에 대해
                회사는 고의·중과실이 없는 한 책임을 지지 않습니다. <br />
                회사는 회원 간 거래/약속 불이행, 분쟁에서 발생한 손해에 대해 직접적 책임이 없습니다.
              </div>
              <br />
              <div>
                <b>제 16조(계약 해지)</b>
                <br />
                회원은 언제든지 계정 탈퇴를 요청할 수 있습니다. 미결제 대금, 진행 중인 분쟁이 있을
                경우 처리가 완료된 뒤 탈퇴가 완료될 수 있습니다.
              </div>
              <br />
              <div>
                <b>제 17조(분쟁 해결 및 관할)</b>
                <br />
                분쟁은 고객센터를 통해 우선 협의하며, 협의가 되지 않는 경우 민사소송법에 따른
                관할법원을 제1심 법원으로 합니다. 준거법은 대한민국 법령입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TermsPage;
