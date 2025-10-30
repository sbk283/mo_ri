import { useLocation, useNavigate } from 'react-router-dom';

function GroupManagerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    {
      name: '생성한 모임 리스트',
      icon: '/grouplist_dark.svg',
      path: '/groupmanager',
    },

    {
      name: '참여한 모임 리스트',
      icon: '/grouplist_dark.svg',
      path: '/joingroups',
    },
    {
      name: '후기/리뷰 관리',
      icon: '/groupreview_dark.svg',
      path: '/groupreviews',
    },
    {
      name: '찜리스트',
      icon: '/groupstart_dark.svg',
      path: '/groupwish',
    },
  ];

  return (
    <aside className="w-[207px]">
      <nav className="border border-brand w-[207px] h-[100%] rounded-[5px]">
        <div className="flex border-b border-brand items-center gap-[8px] text-xl py-[17px] px-[23px] font-semibold text-brand">
          <span>
            <img src="/groupmeeting.svg" />
          </span>
          모임관리
        </div>

        <ul className="px-[23px] mb-[80px] mt-[10px]">
          {categories.map(cat => {
            const isActiveMain = location.pathname === cat.path;

            return (
              <li key={cat.name} className="text-lg font-semibold">
                {/* 메인 클릭 시 처리 */}
                <button
                  onClick={() => navigate(cat.path)}
                  className={`flex items-center gap-[10px] py-[8px] text-lg w-full text-left text-nowrap ${
                    isActiveMain ? 'text-brand' : 'text-[#555]'
                  }`}
                >
                  <img
                    src={isActiveMain ? cat.icon.replace('_dark', '') : cat.icon}
                    alt={cat.name}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold ">{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default GroupManagerSidebar;
