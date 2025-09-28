import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';

// 더미 데이터
const members = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: '춤추는 낙타',
  message: '안녕하세요~ 잘 부탁 드려요~',
  avatar: '/ham.png',
  isNew: i === 22, // 마지막만 NEW 표시
}));

const ITEMS_PER_PAGE = 10;

function GroupMemberPage() {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null); // 현재 열려 있는 멤버 id

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const current = members.slice(start, end);

  const toggleMenu = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <GroupDashboardLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-black text-3xl font-semibold pt-1 pb-8">모임 멤버</h2>

        {/* 멤버 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {current.map(m => (
            <div
              key={m.id}
              className="relative flex items-center gap-3 w-full h-24 bg-white border border-neutral-400 rounded-sm px-4 py-3 hover:shadow"
            >
              {/* 아바타 */}
              <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover" />

              {/* 이름 + 메시지 */}
              <div className="flex-1 flex flex-col">
                <p className="font-semibold text-xl text-brand">
                  {m.name}
                  {m.isNew && <span className="ml-1 text-xs text-red-500 font-bold">NEW</span>}
                </p>
                <p className="flex text-md text-neutral-700 truncate">{m.message}</p>
              </div>

              {/* … 버튼 */}
              <div
                className="text-neutral-400 text-3xl font-semibold pr-[2px] cursor-pointer select-none"
                onClick={() => toggleMenu(m.id)}
              >
                …
              </div>

              {/* 드롭다운 메뉴 */}
              <AnimatePresence>
                {openId === m.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-16 right-[-60px] w-30 bg-white rounded-md shadow-lg border border-neutral-300 overflow-hidden z-50"
                  >
                    <button className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100">
                      모임 추방하기
                    </button>
                    <div className="h-px bg-neutral-200" />
                    <button className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100">
                      채팅 대화하기
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-2 py-1 text-sm text-gray-600 disabled:opacity-40"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-2 py-1 text-sm text-gray-600 disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </div>
    </GroupDashboardLayout>
  );
}

export default GroupMemberPage;
