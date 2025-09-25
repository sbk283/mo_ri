import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function MypageMyGroupMenu() {
  const tabs = [
    {
      label: '모임 참여 이력',
      subMenus: ['전체보기', '운동/건강', '스터디/학습', '취미/여가', '봉사/사회참여'],
    },
    {
      label: '모임 생성 이력',
      subMenus: ['전체보기', '운동/건강', '스터디/학습', '취미/여가', '봉사/사회참여'],
    },
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [selectedSubMenu, setSelectedSubMenu] = useState(tabs[0].subMenus[0]);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSelectedSubMenu(selectedTab.subMenus[0]); // "전체보기"로 리셋
  }, [selectedTab]);

  // underline 위치/너비 계산용
  const listRef = useRef<HTMLUListElement | null>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measure = () => {
    const idx = tabs.findIndex(t => t.label === selectedTab.label);
    const el = tabRefs.current[idx];
    const parent = listRef.current;
    if (!el || !parent) return;
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    setUnderline({ left: er.left - pr.left, width: er.width });
  };

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selectedTab]);

  return (
    <div className="w-full">
      {/* 네비게이션 */}
      <nav className="h-[40px] border-b-[1px] border-gray-300">
        <ul ref={listRef} className="relative flex pb-[5px]">
          {tabs.map((item, i) => (
            <li
              key={item.label}
              ref={el => (tabRefs.current[i] = el)}
              className="relative w-[167px] text-center pt-1 top-[-10px] cursor-pointer"
              onClick={() => setSelectedTab(item)}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200  ${
                  item.label === selectedTab.label ? 'text-brand' : 'text-gray-400 hover:text-brand'
                }`}
              >
                {item.label}
              </p>
            </li>
          ))}

          {/* underline: 항상 렌더링하고, 선택된 탭의 left/width로 이동 */}
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8] rounded"
            initial={false}
            animate={{ left: underline.left, width: underline.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>

      {/* 서브 메뉴 */}
      <div className="flex gap-[45px] pl-[20px] mt-[18px] text-gray-200 font-semibold text-md mb-[38px]">
        {selectedTab.subMenus.map((menu, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSubMenu(menu)}
            className={`transition-colors ${
              selectedSubMenu === menu
                ? 'text-brand font-bold' // 선택된 상태
                : 'text-gray-400 hover:text-brand'
            }`}
          >
            {menu}
          </button>
        ))}
      </div>
      <div className="border-l-[4px] border-brand  text-md pl-[16px] mb-[26px] text-gray-400 font-bold">
        참여 이력을 선택하여 원하는 이력만 출력이 가능합니다.
      </div>

      {/* 메뉴 클릭시 변경되는 부분 추후 데이터베이스 연동 해야함 */}

      <div className="flex border-[1px] border-gray-300 rounded-[5px] py-[23px] px-[26px] items-center mb-[15px]">
        {/* 체크박스 영역 */}
        <button
          onClick={() => setChecked(!checked)}
          className={`flex items-center justify-center w-6 h-6 rounded transition-colors duration-200
          ${checked ? 'bg-[#0689E8]' : 'bg-white border-[2px] border-brand'}`}
        >
          {checked && <span className="text-white text-sm">✔</span>}
        </button>
        {/* 이름 영역 */}
        <div className="ml-[24px]">
          <div className="font-bold text-xl text-gray-400">단기 속성 피그마 스터디 하기</div>
          <div className="text-sm text-[#777777] font-bold">모임 기간 : 2025.02.12~2025.02.20</div>
        </div>
        {/* 아이콘 영역 */}
        <div className="flex gap-[9px] ml-[30px]">
          <div className="text-brand text-lg font-semibold border border-brand py-[3px] px-[11px] rounded-[5px]">
            스터디/학습
          </div>
          <div
            className={`text-white text-lg font-semibold bg-brand-red py-[3px] px-[11px] rounded-[5px] `}
          >
            종료
          </div>
        </div>
        {/* 공백 */}
        <div className="flex-grow" />
        {/* 상세보기 영역 */}
        <Link to={'/'} className="text-lg font-bold text-gray-400">
          상세보기
        </Link>
      </div>

      {/* 참여이력 출력하기 버튼 */}
      <div className="flex justify-end ">
        <button className="text-xl bg-brand py-[8px] px-[28px] rounded-[5px] text-white font-bold">
          참여 이력 출력하기
        </button>
      </div>
    </div>
  );
}

export default MypageMyGroupMenu;
