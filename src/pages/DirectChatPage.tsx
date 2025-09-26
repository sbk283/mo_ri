import { useState } from 'react';

function DirectChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput('');
  };

  return (
    <div className="flex pt-24 pb-7 justify-center bg-gray-100">
      <div className="flex h-[calc(100vh-120px)] w-full max-w-[1024px]">
        {/* --- 좌측 사용자 프로필 영역 --- */}
        <aside className="w-72 bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          {/* 프로필 이미지 */}
          <img src="/ham.png" alt="프로필" className="w-32 h-32 rounded-full object-cover" />

          {/* 닉네임 + 크라운 */}
          <div className="mt-4 flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-brand whitespace-nowrap">춤추는 낙타</h2>
            <div className="flex w-[23px] h-[13px] px-[5px] py-[2px] rounded-[11px] bg-[#0689E8] items-center justify-center">
              <img src="/images/group_crown.svg" alt="모임장크라운" className="w-3 h-3" />
            </div>
          </div>

          {/* 구분선 */}
          <div className="w-full border-b border-gray-[#8c8c8c] my-4"></div>

          {/* 설명글 */}
          <p className="text-[#3C3C3C] text-[15px] font-medium">
            마비노기 던전 레이드 파티원 모집 관리자 입니다.
          </p>
          <p className="mt-4 text-[#8C8C8C] font-['Noto_Sans'] text-[12px] font-medium leading-normal">
            문의할 점이나 궁금하신 점을 채팅을 통해 대화할 수 있습니다. <br />
            비방이나 욕설 등 부적절한 메시지가 보이면 고객센터로 연락주세요.
          </p>
        </aside>

        {/* --- 채팅 영역 --- */}
        <main className="flex-1 ml-4 bg-white shadow-md rounded-lg flex flex-col">
          {/* 채팅 기록 영역 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <span className="text-2xl">💬</span>
                <p className="mt-2">대화내역이 없습니다.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs shadow">
                    {msg}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 입력창 영역 */}
          <div className="border-t p-4 flex items-center">
            <input
              type="text"
              placeholder="메시지를 입력해 주세요."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleSend}
              className="ml-2 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              보내기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DirectChatPage;
