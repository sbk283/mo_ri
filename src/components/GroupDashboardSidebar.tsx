import { useLocation, useNavigate, useParams } from 'react-router-dom';

function GroupDashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 

  const categories = [
    {
      name: '게시판',
      icon: '/grouplist_dark.svg',
      path: `/groupcontent/${id}`,
    },
    {
      name: '모임 일정',
      icon: '/schedule_dark.svg',
      path: `/groupschedule/${id}`,
    },
    {
      name: '모임 멤버',
      icon: '/people_dark.svg',
      path: `/groupmember/${id}`,
    },
    {
      name: '채팅/문의',
      icon: '/talk_dark.svg',
      path: `/chat/${id}`,
    },
  ];

  return (
    <aside className="w-[207px] bg-white">
      <nav className="border border-brand w-[207px] h-[100%] rounded-[5px]">
        <div className="flex border-b border-brand items-center gap-[8px] text-xl py-[17px] px-[23px] font-semibold text-brand">
          <span>
            <img src="/groupmeeting.svg" alt="모임 아이콘" />
          </span>
          모임
        </div>

        <ul className="px-[23px] mb-[30px] mt-[10px]">
          {categories.map(cat => {
            const isActiveMain = location.pathname === cat.path;

            return (
              <li key={cat.name} className="text-lg font-semibold">
                <button
                  onClick={() => navigate(cat.path)}
                  className={`flex items-center gap-[10px] py-[8px] text-lg w-full text-left ${
                    isActiveMain ? 'text-brand' : 'text-[#555]'
                  }`}
                >
                  <img
                    src={isActiveMain ? cat.icon.replace('_dark', '') : cat.icon}
                    alt={cat.name}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default GroupDashboardSidebar;
