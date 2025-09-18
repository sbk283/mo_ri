import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function MyPageSidebar() {
  const [openCategory, setOpenCategory] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    {
      name: '마이페이지',
      icon: '/people_dark.svg',
      path: '/mypage',
    },
    {
      name: '결제수단/관리',
      icon: '/pay_dark.svg',
      path: '/payments',
    },
    {
      name: '고객센터',
      icon: '/faqicon_dark.svg',
      sub: [
        { name: 'FAQ', path: '/faq' },
        { name: '1:1 문의 하기', path: '/inquiry' },
        { name: '1:1 문의 내역', path: '/inquiry/history' },
      ],
    },
    {
      name: '설정',
      icon: '/mpsetting_dark.svg',
      sub: [{ name: '회원 정보 관리', path: '/mypagesetting' }],
    },
  ];

  useEffect(() => {
    categories.forEach(cat => {
      if (cat.sub?.some(s => s.path === location.pathname)) {
        setOpenCategory(cat.name);
      }
    });
  }, [location.pathname]);

  return (
    <aside className="w-[207px]">
      <nav className="border border-brand w-[207px] h-[100%] rounded-[5px]">
        <div className="flex border-b border-brand items-center gap-[8px] text-xl py-[17px] px-[23px] font-semibold text-brand">
          <span>
            <img src="/people.svg" />
          </span>
          마이페이지
        </div>

        <ul className="px-[23px] mb-[80px] mt-[10px]">
          {categories.map(cat => {
            const isActiveMain =
              (cat.path && location.pathname === cat.path) ||
              (cat.sub && cat.sub.some(s => s.path === location.pathname));

            return (
              <li key={cat.name} className="text-lg font-semibold">
                {/* 메인 클릭 시 처리 */}
                <button
                  onClick={() => {
                    if (cat.sub) {
                      // sub 있는 경우 → 첫 번째 sub 경로로 이동
                      navigate(cat.sub[0].path);
                      setOpenCategory(cat.name);
                    } else if (cat.path) {
                      // sub 없는 경우 → path로 이동
                      navigate(cat.path);
                      setOpenCategory('');
                    }
                  }}
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

                {/* sub 카테고리 */}
                <AnimatePresence>
                  {cat.sub && openCategory === cat.name && (
                    <motion.ul
                      initial={
                        openCategory === cat.name && location.pathname === cat.sub[0].path
                          ? { opacity: 0, height: 0 }
                          : false
                      }
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-7 mt-1 space-y-1 border-l border-gray-300 pl-3 text-sm"
                    >
                      {cat.sub.map(sub => (
                        <li key={sub.name}>
                          <Link
                            to={sub.path}
                            className={`w-full text-left block ${
                              location.pathname === sub.path ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}

                  {/* 현재 path가 sub라서 이미 활성화된 경우는 그냥 ul 출력 */}
                  {cat.sub && isActiveMain && openCategory !== cat.name && (
                    <ul className="ml-7 mt-1 space-y-1 border-l border-gray-300 pl-3 text-sm">
                      {cat.sub.map(sub => (
                        <li key={sub.name}>
                          <Link
                            to={sub.path}
                            className={`w-full text-left block ${
                              location.pathname === sub.path ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default MyPageSidebar;
