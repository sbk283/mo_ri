import { Link } from 'react-router-dom';
import MyPageLayout from '../components/layout/MyPageLayout';
import Faq from '../data/Faq.json';
import { useState } from 'react';

function MyPageFAQPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(1); // 기본 카테고리
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  const currentCategory = Faq.find(cat => cat.id === activeCategoryId);

  const toggleQuestion = (qId: number) => {
    setOpenQuestionId(prev => (prev === qId ? null : qId));
  };

  // from 태그 (추후 검색입력 기록 삭제도 하기!)
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    console.log('검색 실행:', query);
  };

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} FAQ
        </div>
      </div>
      <div className="flex gap-[12px] mb-[45px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            서비스 이용 중 자주 궁금해 하시는 내용을 모아두었습니다.
          </div>
          <div className="text-md">빠르게 확인하고 문제를 해결해 보세요.</div>
        </div>
      </div>
      {/* 하단 내용 부분 */}
      <div className="pt-[76px] pb-[100px] flex flex-col items-center bg-white border border-card border-gray-300 rounded-[5px] shadow-card  w-[1024px]">
        <div className="text-center">
          <div className="text-gray-400  font-semibold text-xxl mb-[40px]">
            고객님, 무엇을 도와드릴까요?
          </div>
          {/*  검색창 */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="자주 묻는 질문을 검색해 보세요!"
              className=" w-[707px] border border-gray-300 shadow-cardInset py-[8px] px-[40px] rounded-[21px] placeholder:text-lg placeholder:font-normal placeholder:text-gray-300"
            />
            <button type="submit" className="absolute right-[30px] top-[5px]">
              <img src="./search.png" alt="검색" className="w-[30px] h-[30px] transform scale-75" />
            </button>
          </form>
          {/* 토글 버튼 */}
          <div className="flex justify-between mt-[41px] mb-[48px]">
            {Faq.map(cat => (
              <button
                key={cat.id}
                className={`px-[22px] py-[8px] rounded-[5px] text-lg font-medium ${
                  activeCategoryId === cat.id
                    ? 'bg-brand text-white'
                    : 'bg-white text-brand border border-brand'
                }`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                {' '}
                {cat.category}
              </button>
            ))}
          </div>
          {/* 질문 목록 */}
          <div className="w-full max-w-[707px] flex flex-col gap-4">
            {currentCategory?.questions.map(q => (
              <div key={q.id} className="flex flex-col">
                {/* 질문 영역 */}
                <div className="mb-[18px] flex justify-between items-center">
                  <div
                    className="flex justify-center items-center gap-[22px] cursor-pointer"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="w-[35px] h-[35px] border-[2px] border-brand rounded-[5px] text-xl text-brand font-semibold">
                      Q
                    </div>
                    <div className="text-lg text-gray-400 font-medium">{q.question}</div>
                  </div>
                  <button onClick={() => toggleQuestion(q.id)}>
                    <img src="/toggle.svg" />
                  </button>
                </div>

                {/* 답변 영역 */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openQuestionId === q.id
                      ? 'text-gray-500 text-lg py-[30px] px-[40px] break-words break-all'
                      : 'max-h-0'
                  }`}
                >
                  <div className="text-gray-500 whitespace-pre-line">{q.answer}</div>
                </div>
              </div>
            ))}
          </div>
          {/*  1:1문의 버튼 고고씽 */}
          <Link
            to={'/inquiry'}
            className=" bg-brand  px-[41px] py-[8px] rounded-[5px] block w-[195px] mx-auto mt-[50px] text-white font-medium text-xl "
          >
            1:1 문의 하기
          </Link>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyPageFAQPage;
