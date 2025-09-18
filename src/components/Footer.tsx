export default function Footer() {
  return (
    <footer className="bottom-0 left-0 w-full border-t border-solid border-[#DBDBDB] bg-[rgba(207,208,208,0.2)] text-sm text-gray-200 pb-[30px]">
      <div className="mx-auto w-[1024px]">
        <div className="flex flex-wrap justify-between gap-4 py-[19px] font-bold text-xs sm:gap-7">
          <a href="/terms" className="text-gray-200 hover:text-gray-900">
            이용약관
          </a>
          <span>|</span>
          <a href="/privacy" className="text-gray-200 hover:text-gray-900 font-semibold">
            개인정보 처리 방침
          </a>
          <span>|</span>
          <a href="/faq" className="text-gray-200 hover:text-gray-900">
            고객센터
          </a>
          <span>|</span>
          <a href="/serviceint" className="text-gray-200 hover:text-gray-900">
            회사소개
          </a>
          <span>|</span>
          <a href="/location-service" className="text-gray-200 hover:text-gray-900">
            위치기반서비스 이용약관
          </a>
          <span>|</span>
          <a href="/youth-policy" className="text-gray-200 hover:text-gray-900">
            청소년 보호 정책
          </a>
          <span>|</span>
          <a href="/review-policy" className="text-gray-200 hover:text-gray-900">
            후기 정책
          </a>
          <span>|</span>
          <a href="/refund-policy" className="text-gray-200 hover:text-gray-900">
            제휴 정책
          </a>
        </div>

        {/* 로고 + 소개 */}
        <div className="flex items-start justify-between pt-[11px] pb-[10px]">
          {/* 왼쪽 : 로고 + 소개 */}
          <div className="flex flex-col items-start text-left max-w-md">
            <img src="/images/footerLogo.svg" alt="Mori Logo" className="pb-2" />
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              다양한 관심사를 바탕으로 한 자기계발 모임 플랫폼.
            </p>
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              참여와 기록을 통해 성장과 커리어를 이어갑니다.
            </p>
          </div>
        </div>

        {/* 대표자 등 */}
        <div className="flex pt-1">
          <div className="text-[13px] text-gray-500 leading-relaxed">
            <p>
              대표자: 유지선, 문유비, 여채현, 송병근 &nbsp; | &nbsp; 주소: 서울특별시 모리길 모리로
              15-1 77F 777호 대표전화: 000-000-0000 &nbsp; | &nbsp; 팩스: 000-000-0000
            </p>
          </div>
        </div>

        {/* 두 번째 줄: 이메일 */}
        <div className="text-[13px] text-gray-500">
          이메일: dev.yachea@gmail.com · dev.munyubi@gmail.com · sbkcoding@gmail.com ·
          z.seon.dev@gmail.com
        </div>

        {/* 세 번째 줄: 저작권 */}
        <div className="mt-4 text-xs text-gray-500">© mo:ri. All Rights Reserved.</div>
      </div>
    </footer>
  );
}
