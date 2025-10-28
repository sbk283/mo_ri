import { useLocation, useNavigate } from 'react-router-dom';

interface GroupDashboardSidebarProps {
  groupId: string;
}

export default function GroupDashboardSidebar({ groupId }: GroupDashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const safeId = groupId && groupId !== 'undefined' && groupId !== 'null' ? groupId : '';

  const categories = [
    {
      name: '게시판',
      icon: '/grouplist_dark.svg',
      path: safeId ? `/groupcontent/${safeId}` : null,
    },
    {
      name: '모임 일정',
      icon: '/schedule_dark.svg',
      path: safeId ? `/groupschedule/${safeId}` : null,
    },
    {
      name: '모임 멤버',
      icon: '/people_dark.svg',
      path: safeId ? `/groupmember/${safeId}` : null,
    },
    {
      name: '채팅/문의',
      icon: '/talk_dark.svg',
      path: safeId ? `/chat/${safeId}` : null,
    },
  ];

  return (
    <aside className="w-[207px] bg-white">
      <nav className="border border-brand w-[207px] h-full rounded-[5px]">
        {/* 상단 타이틀 */}
        <div className="flex border-b border-brand items-center gap-[8px] text-xl py-[17px] px-[23px] font-semibold text-brand">
          <span>
            <img src="/groupmeeting.svg" alt="모임 아이콘" />
          </span>
          모임
        </div>

        {/* 메뉴 리스트 */}
        <ul className="px-[23px] mb-[30px] mt-[10px]">
          {categories.map(cat => {
            const isActive = cat.path ? location.pathname === cat.path : false;

            return (
              <li key={cat.name} className="text-lg font-semibold">
                <button
                  onClick={() => {
                    if (!cat.path) return; // ✅ id 없으면 이동 X
                    navigate(cat.path);
                  }}
                  disabled={!cat.path}
                  className={`flex items-center gap-[10px] py-[8px] text-lg w-full text-left transition-colors ${
                    isActive ? 'text-brand' : 'text-[#555]'
                  } ${!cat.path ? 'opacity-40 cursor-not-allowed' : 'hover:text-brand'}`}
                >
                  <img
                    src={isActive ? cat.icon.replace('_dark', '') : cat.icon}
                    alt={cat.name}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* id 없을 때 안내문 */}
        {!safeId && (
          <p className="text-center text-gray-400 text-sm px-3">현재 선택된 모임이 없습니다.</p>
        )}
      </nav>
    </aside>
  );
}
